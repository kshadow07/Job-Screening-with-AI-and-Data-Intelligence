import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import axios from 'axios';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for PDF uploads
const upload = multer({ dest: 'uploads/' });

// Initialize SQLite database for applications
let appDb;
(async () => {
    appDb = await open({
        filename: './applications.db',
        driver: sqlite3.Database
    });

    await appDb.exec(`
        CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            job_id TEXT,
            resume_text TEXT,
            summary TEXT,
            resume_embedding TEXT,
            similarity_score REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Applications database initialized');
})();

// Open the job descriptions database (created by the recruiter API)
let jobDb;
(async () => {
    jobDb = await open({
        filename: './job_descriptions.db',
        driver: sqlite3.Database
    });
    console.log('Job descriptions database opened');
})();

// AI API Configurations
const OLLAMA_API = 'http://localhost:11434';
const GENERATION_MODEL = 'deepseek-r1:7b';
const EMBED_MODEL = 'nomic-embed-text';

// Summary Prompt
const SUMMARY_PROMPT = `Summarize the following resume, highlighting:
- Key technical skills
- Years of experience
- Education background
- Main projects/work experience
Keep it concise and professional. Resume text:`;

// 🚀 API to Process Job Application via PDF
app.post('/api/apply', upload.single('resume'), async (req, res) => {
    try {
        const { job_id } = req.body;
        const resumeFile = req.file;

        if (!job_id || !resumeFile) {
            return res.status(400).json({ error: 'Job ID and Resume file are required' });
        }

        // Parse PDF Resume
        const resumeText = await parsePdf(resumeFile.path);

        // Summarize Resume
        const summary = await generateSummary(resumeText);

        // Generate Resume Embedding
        const resumeEmbedding = await generateEmbedding(resumeText);

        // Fetch Job Embedding from job descriptions database
        const jobData = await jobDb.get(`SELECT embedding FROM job_descriptions WHERE id = ?`, [job_id]);
        if (!jobData) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const jobEmbedding = JSON.parse(jobData.embedding);

        // Compute Similarity Score
        const similarityScore = cosineSimilarity(resumeEmbedding, jobEmbedding);

        // Save to Applications Database
        const applicationId = uuidv4();
        await appDb.run(
            `INSERT INTO applications (id, job_id, resume_text, summary, resume_embedding, similarity_score) VALUES (?, ?, ?, ?, ?, ?)`,
            [applicationId, job_id, resumeText, summary, JSON.stringify(resumeEmbedding), similarityScore]
        );

        res.json({
            id: applicationId,
            job_id,
            summary,
            similarity_score: similarityScore,
            message: 'Application processed successfully'
        });

    } catch (error) {
        console.error('Error processing application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🚀 API to Process Job Application via Text (if resume text is provided directly)
app.post('/api/apply-text', async (req, res) => {
    try {
        const { job_id, resume_text } = req.body;

        if (!job_id || !resume_text) {
            return res.status(400).json({ error: 'Job ID and Resume text are required' });
        }

        // Summarize Resume
        const summary = await generateSummary(resume_text);

        // Generate Resume Embedding
        const resumeEmbedding = await generateEmbedding(resume_text);

        // Fetch Job Embedding from job descriptions database
        const jobData = await jobDb.get(`SELECT embedding FROM job_descriptions WHERE id = ?`, [job_id]);
        if (!jobData) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const jobEmbedding = JSON.parse(jobData.embedding);

        // Compute Similarity Score
        const similarityScore = cosineSimilarity(resumeEmbedding, jobEmbedding);

        // Save to Applications Database
        const applicationId = uuidv4();
        await appDb.run(
            `INSERT INTO applications (id, job_id, resume_text, summary, resume_embedding, similarity_score) VALUES (?, ?, ?, ?, ?, ?)`,
            [applicationId, job_id, resume_text, summary, JSON.stringify(resumeEmbedding), similarityScore]
        );

        res.json({
            id: applicationId,
            job_id,
            summary,
            similarity_score: similarityScore,
            message: 'Application processed successfully'
        });

    } catch (error) {
        console.error('Error processing text-based application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🚀 API to Get Application by ID
app.get('/api/application/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const application = await appDb.get(`SELECT * FROM applications WHERE id = ?`, [id]);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({
            id: application.id,
            job_id: application.job_id,
            summary: application.summary,
            similarity_score: application.similarity_score,
            created_at: application.created_at
        });

    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🚀 API to Get All Applications
app.get('/api/applications', async (req, res) => {
    try {
        const applications = await appDb.all(`SELECT * FROM applications ORDER BY created_at DESC`);
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🔹 Helper Function: Parse PDF
async function parsePdf(filePath) {
    const data = await pdfParse(filePath);
    return data.text;
}

// 🔹 Helper Function: Generate Summary using Ollama
async function generateSummary(resumeText) {
    try {
        const response = await axios.post(`${OLLAMA_API}/api/generate`, {
            model: GENERATION_MODEL,
            prompt: `${SUMMARY_PROMPT}\n\n${resumeText}`,
            stream: false
        });
        
        const fullResponse = response.data.response.trim();
        
        // Extract only the part after the thinking process
        let summary = fullResponse;
        
        // Check if the response contains the thinking part
        if (fullResponse.includes('</think>')) {
            summary = fullResponse.split('</think>')[1].trim();
        }
        
        // Remove Markdown formatting (** for bold)
        summary = summary.replace(/\*\*/g, '');
        
        return summary;
    } catch (error) {
        console.error('Error generating summary:', error);
        throw new Error('Failed to generate summary');
    }
}

// 🔹 Helper Function: Generate Embedding using Ollama
async function generateEmbedding(text) {
    try {
        const response = await axios.post(`${OLLAMA_API}/api/embed`, {
            model: EMBED_MODEL,
            input: text
        });
        if (!response.data?.embeddings || response.data.embeddings.length === 0) {
            throw new Error('Invalid embedding response');
        }
        return response.data.embeddings[0];
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error('Failed to generate embedding');
    }
}

// 🔹 Helper Function: Normalize Vector
function normalizeVector(vec) {
    const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val ** 2, 0));
    return vec.map(val => val / magnitude);
}

// 🔹 Helper Function: Cosine Similarity using Normalized Vectors
function cosineSimilarity(vecA, vecB) {
    const normA = normalizeVector(vecA);
    const normB = normalizeVector(vecB);
    const dotProduct = normA.reduce((sum, val, i) => sum + val * normB[i], 0);
    return dotProduct;
}


// 🚀 Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Cleanup on exit
process.on('SIGINT', async () => {
    if (appDb) {
        await appDb.close();
    }
    if (jobDb) {
        await jobDb.close();
    }
    process.exit();
});
