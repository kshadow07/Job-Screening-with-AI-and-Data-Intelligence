import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize SQLite database
let db;
(async () => {
    db = await open({
        filename: './job_descriptions.db',
        driver: sqlite3.Database
    });
    
    await db.exec(`
        CREATE TABLE IF NOT EXISTS job_descriptions (
            id TEXT PRIMARY KEY,
            original_data TEXT,
            summary TEXT,
            embedding TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Database initialized');
})();

// Ollama API configuration
const OLLAMA_API = 'http://localhost:11434';
const GENERATION_MODEL = 'deepseek-r1:7b';
const EMBED_MODEL = 'nomic-embed-text';

// Prompt for summarizing job descriptions
const SUMMARY_PROMPT = `Please summarize the following job description in 3-4 sentences, focusing on:
- Key technical skills required
- Years of experience needed
- Main responsibilities
- Any special qualifications
Keep the summary concise and professional. Here's the job description:`;

// Endpoint to process job description
app.post('/api/process-job', async (req, res) => {
    try {
        const jobData = req.body;
        const jobId = uuidv4();

        // Validate required fields
        if (!jobData.jobTitle || !jobData.requiredSkills || !jobData.jobResponsibilities) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Convert job data to text for processing
        const jobText = formatJobDescriptionForProcessing(jobData);

        // Step 1: Generate summary using Ollama
        const summary = await generateSummary(jobText);
        
        // Step 2: Generate embedding using Ollama
        const embedding = await generateEmbedding(jobText);

        // Step 3: Store in database
        await db.run(
            `INSERT INTO job_descriptions (id, original_data, summary, embedding) VALUES (?, ?, ?, ?)`,
            [jobId, JSON.stringify(jobData), summary, JSON.stringify(embedding)]
        );
        
        res.json({
            id: jobId,
            summary,
            message: 'Job description processed and stored successfully'
        });
    } catch (error) {
        console.error('Error processing job description:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to retrieve job description by ID
app.get('/api/job/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        const row = await db.get(
            `SELECT * FROM job_descriptions WHERE id = ?`,
            [jobId]
        );
        
        if (!row) {
            return res.status(404).json({ error: 'Job description not found' });
        }
        
        res.json({
            id: row.id,
            original_data: JSON.parse(row.original_data),
            summary: row.summary,
            embedding: JSON.parse(row.embedding),
            created_at: row.created_at
        });
    } catch (error) {
        console.error('Database retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve job description' });
    }
});

// Helper function to format job description for processing
function formatJobDescriptionForProcessing(jobData) {
    return `
        Job Title: ${jobData.jobTitle}
        Department: ${jobData.department}
        Employment Type: ${jobData.employmentType}
        Salary Range: ${jobData.minimumSalary || 'N/A'} - ${jobData.maximumSalary || 'N/A'}
        Required Skills: ${jobData.requiredSkills}
        Application Deadline: ${jobData.applicationDeadline}
        
        Job Responsibilities:
        ${jobData.jobResponsibilities}
        
        Qualifications:
        ${jobData.qualifications}
        
        Company: ${jobData.company}
        Location: ${jobData.location}
        Experience Level: ${jobData.experienceLevel}
    `;
}

// Function to generate summary using Ollama
async function generateSummary(jobText) {
    try {
        const response = await axios.post(`${OLLAMA_API}/api/generate`, {
            model: GENERATION_MODEL,
            prompt: `${SUMMARY_PROMPT}\n\n${jobText}`,
            stream: false
        });

        let result = response.data.response.trim();
        
        // Remove content between <think> tags
        result = result.replace(/<think>[\s\S]*?<\/think>/g, '');
        
        // Remove any asterisks
        result = result.replace(/\*\*/g, '');
        
        // Extract content after a <think> tag if it exists
        const thinkTagMatch = result.match(/<think>[\s\S]*$/);
        if (thinkTagMatch) {
            result = result.substring(thinkTagMatch.index + thinkTagMatch[0].length).trim();
        }

        return result.trim();
    } catch (error) {
        console.error('Error generating summary:', error);
        throw new Error('Failed to generate summary');
    }
}
async function generateEmbedding(jobText) {
    try {
        const response = await axios.post(`${OLLAMA_API}/api/embed`, {
            model: EMBED_MODEL,
            input: jobText // Use "input" instead of "prompt"
        });
        
        console.log('Embedding API response:', response.data); // For debugging

        if (!response.data?.embeddings || response.data.embeddings.length === 0) {
            throw new Error('Invalid embedding response');
        }
        
        // Return the first embedding from the array (adjust as needed)
        return response.data.embeddings[0];
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error('Failed to generate embedding');
    }
}


// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Cleanup on exit
process.on('SIGINT', async () => {
    if (db) {
        await db.close();
    }
    process.exit();
});