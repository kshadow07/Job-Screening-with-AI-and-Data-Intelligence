# AI-Powered Job Screening System

An intelligent recruitment system that uses AI to match job applications with job descriptions through resume parsing and semantic similarity analysis.

## Features

- 🤖 AI-powered resume parsing and analysis
- 📊 Semantic similarity matching between resumes and job descriptions
- 🔍 Automatic resume summarization
- 💼 Job description management
- 📱 Modern React frontend with shadcn-ui
- 🔒 SQLite database for data persistence

## Tech Stack

### Backend
- Node.js & Express
- SQLite3 with sqlite driver
- Ollama AI for text generation and embeddings
- PDF parsing with pdf-parse
- UUID for unique identifiers

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS
- shadcn-ui components
- Axios for API calls

## Prerequisites

- Node.js >= 18.0.0
- Docker and Docker Compose
- Ollama running locally with required models

## Project Structure

```
.
├── backend/
│   ├── server.js        # Recruiter API
│   ├── user.js          # Job Application API
│   └── uploads/         # Resume storage
├── frontend/
│   └── ai-recruit-flow-main/
└── docker-compose.yml
```

## Quick Start with Docker

1. Clone the repository:
```sh
git clone https://github.com/yourusername/ai-job-screening.git
cd ai-job-screening
```

2. Start the services:
```sh
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Manual Setup

### Backend Setup

1. Navigate to backend directory:
```sh
cd backend
```

2. Install dependencies:
```sh
npm install
```

3. Create .env file:
```sh
OLLAMA_URL=http://localhost:11434/api
PORT=3000
UPLOADS_DIR=./uploads
```

4. Start the server:
```sh
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```sh
cd frontend/ai-recruit-flow-main
```

2. Install dependencies:
```sh
npm install
```

3. Start development server:
```sh
npm run dev
```

## API Endpoints

### Recruiter API (Port 3000)
- POST `/api/process-job` - Create new job posting
- GET `/api/job/:id` - Get job description
- GET `/api/jobs` - List all jobs

### Application API (Port 4000) 
- POST `/api/apply` - Submit job application
- GET `/api/applications` - List applications
- GET `/api/application/:id` - Get application details

## Docker Configuration
