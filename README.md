# YouTube AI Library

A YouTube AI library inspired by NotebookLM for studying and referencing YouTube content using AI.

## Features

- Add YouTube channels to your library
- Selective video ingestion with search and multi-select
- AI-powered chat and study material generation
- Embedding-based semantic search
- Multi-channel library management

## Tech Stack

- **Backend**: Python FastAPI with LangGraph SDK
- **Frontend**: React with TypeScript and Tailwind CSS
- **Database**: PostgreSQL with pgvector extension
- **LLM**: OpenAI o3-mini
- **Video Processing**: yt-dlp for YouTube downloads and transcript extraction

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker and Docker Compose

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Update the `.env` file with your OpenAI API key

4. Start the database:
   ```bash
   docker-compose up -d
   ```

5. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

6. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Open http://localhost:3000 in your browser

## Usage

1. Enter a YouTube channel URL to add it to your library
2. Select videos to ingest from the channel
3. Use AI tools to generate study materials and chat with the content
4. Manage multiple channels in your library

## Development

The application is structured as:
- `backend/`: Python FastAPI application
- `frontend/`: React TypeScript application
- `docker-compose.yml`: PostgreSQL database with pgvector