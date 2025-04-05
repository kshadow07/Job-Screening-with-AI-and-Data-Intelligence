# AI-Powered Job Screening System

Welcome to the AI-Powered Job Screening System, a cutting-edge recruitment solution designed to revolutionize the hiring process. By leveraging advanced artificial intelligence technologies, this system seamlessly matches job applications with job descriptions, ensuring that the best candidates are highlighted for each role. Our system excels in resume parsing, semantic similarity analysis, and much more, making it an indispensable tool for modern recruiters.

## Features

- 🤖 AI-powered resume parsing and analysis
- 📊 Semantic similarity matching between resumes and job descriptions
- 💼 Job description management
- 📱 Modern React frontend with shadcn-ui
- 🔒 SQLite database for data persistence
- 📧 Automatic email notifications
- 🔍 Semantic embedding for enhanced matching

## Tech Stack

### Backend
-- Node.js & Express
- SQLite3 with sqlite driver
- Ollama AI for text generation and embeddings
- PDF parsing with pdf-parse
- UUID for unique identifiers
- Nodemailer for email notifications

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

Images-

![Screenshot 2025-04-05 114312](https://github.com/user-attachments/assets/cc373fb8-633d-495f-b809-eff190231289)

![Screenshot 2025-04-05 114332](https://github.com/user-attachments/assets/407a65f6-e4f6-4f6d-8ac0-2b85199d350b)

![Screenshot 2025-04-05 114349](https://github.com/user-attachments/assets/c48bd835-1cf8-431b-8963-a8a1861e4897)

![Screenshot 2025-04-05 114421](https://github.com/user-attachments/assets/d679fc08-e480-4174-b99d-f0e1a39fd0ef)

![Screenshot 2025-04-05 114435](https://github.com/user-attachments/assets/e3d4a772-301a-44c0-a626-0185c2bb9dc3)

![Screenshot 2025-04-05 114447](https://github.com/user-attachments/assets/33165d2e-7886-4d99-be30-a7bb59af38fb)

