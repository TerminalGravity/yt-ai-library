# YouTube AI Library Documentation

A comprehensive YouTube AI library inspired by NotebookLM that transforms YouTube channels into AI-powered study and reference libraries.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

YouTube AI Library allows you to:
- Add YouTube channels to create dedicated AI-powered libraries
- Ingest video content through transcript extraction and embedding generation
- Chat with AI using channel content as context
- Perform semantic search across video transcripts
- Generate study materials and reference content
- Manage multiple channel libraries

## Features

### Core Features
- **Channel Analysis**: Automatic extraction of channel metadata and video lists
- **Selective Ingestion**: Choose specific videos to include in your library
- **AI Chat Interface**: Context-aware conversations using o3-mini
- **Semantic Search**: Find content using natural language queries
- **Multi-Channel Support**: Manage multiple YouTube channels independently
- **Real-time Progress**: Live updates during video ingestion

### AI Capabilities
- **Embedding Generation**: Uses OpenAI's text-embedding-3-small model
- **Contextual Chat**: AI responses with source citations and timestamps
- **Study Guide Generation**: Create structured learning materials
- **Content Summarization**: Generate channel and topic summaries

### Technical Features
- **Vector Search**: PostgreSQL with pgvector for semantic similarity
- **Background Processing**: Asynchronous video ingestion
- **Responsive UI**: Modern React interface with Tailwind CSS
- **RESTful API**: FastAPI backend with comprehensive endpoints

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │  PostgreSQL DB  │
│                 │    │                 │    │   + pgvector    │
│ - Channel Input │◄──►│ - YouTube API   │◄──►│                 │
│ - Video Select  │    │ - Embedding Gen │    │ - Channels      │
│ - Chat Interface│    │ - LLM Chat      │    │ - Videos        │
│ - Search UI     │    │ - Vector Search │    │ - Embeddings    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         │              │  External APIs  │
         └──────────────┤                 │
                        │ - OpenAI        │
                        │ - YouTube (yt-dlp)│
                        └─────────────────┘
```

### Technology Stack

**Backend:**
- Python 3.10+
- FastAPI for REST API
- SQLAlchemy with PostgreSQL
- pgvector for vector similarity search
- OpenAI API (o3-mini, text-embedding-3-small)
- yt-dlp for YouTube data extraction
- LangGraph SDK for workflow orchestration

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Headless UI for components
- Axios for API communication
- React Router for navigation

**Database:**
- PostgreSQL 16
- pgvector extension for embeddings
- Three main tables: channels, videos, video_embeddings

## Installation

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- Docker and Docker Compose
- OpenAI API key

### Quick Start

1. **Clone the repository:**
```bash
git clone <repository-url>
cd yt-ai-library
```

2. **Start the database:**
```bash
docker-compose up -d
```

3. **Set up the backend:**
```bash
cd backend
cp .env.example .env
# Edit .env file with your configuration
pip install -r requirements.txt
uvicorn main:app --reload
```

4. **Set up the frontend:**
```bash
cd frontend
npm install
npm start
```

5. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Docker Setup (Alternative)

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.full.yml up --build
```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://admin:password@localhost:5432/youtube_library

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=o3-mini

# YouTube Data API (optional)
YOUTUBE_API_KEY=your_youtube_api_key_here

# Application Settings
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=your_secret_key_here

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

### Database Configuration

The application uses PostgreSQL with the pgvector extension. The database schema includes:

- **channels**: Store YouTube channel metadata
- **videos**: Store individual video information
- **video_embeddings**: Store text embeddings for semantic search

## Usage Guide

### Adding a Channel

1. **Enter Channel URL**: Paste any YouTube channel URL format:
   - `https://www.youtube.com/@channelname`
   - `https://www.youtube.com/c/channelname`
   - `https://www.youtube.com/channel/UC...`
   - `https://www.youtube.com/user/username`

2. **Channel Analysis**: The system will:
   - Extract channel metadata (name, description, subscriber count)
   - Fetch the video list
   - Create a channel entry in your library

3. **Video Selection**: 
   - Browse all available videos
   - Use search to filter by title or description
   - Select individual videos or use "Select All"
   - Choose videos to ingest into your library

4. **Ingestion Process**:
   - Videos are processed in the background
   - Transcripts are extracted using yt-dlp
   - Text is split into chunks and embedded
   - Progress is tracked in real-time

### Using the Chat Interface

1. **Navigate to Chat**: Select a channel and go to the Chat tab
2. **Ask Questions**: Type natural language questions about the channel content
3. **Review Sources**: AI responses include source citations with:
   - Video title and timestamp
   - Relevant transcript excerpt
   - Direct link to video at specific time

### Semantic Search

1. **Navigate to Search**: Go to the Search tab for any channel
2. **Enter Query**: Use natural language to describe what you're looking for
3. **Review Results**: Results show:
   - Matching content with similarity scores
   - Video title and timestamp
   - Direct links to source videos

### Managing Multiple Channels

- **Sidebar Navigation**: View all your channels in the left sidebar
- **Channel Dropdown**: Quick access to channel-specific features
- **Add New Channels**: Use the "+" button to add additional channels
- **Delete Channels**: Remove channels you no longer need

## API Reference

### Channel Endpoints

#### Analyze Channel
```http
POST /api/channels/analyze?url={channel_url}
```
Analyzes a YouTube channel without saving to database.

#### Create Channel
```http
POST /api/channels/
Content-Type: application/json

{
  "name": "Channel Name",
  "description": "Channel Description",
  "url": "https://youtube.com/@channel"
}
```

#### Get Channels
```http
GET /api/channels/
```
Returns all active channels.

#### Get Channel by ID
```http
GET /api/channels/{channel_id}
```

#### Delete Channel
```http
DELETE /api/channels/{channel_id}
```

### Video Endpoints

#### Get Channel Videos
```http
GET /api/videos/channel/{channel_id}
```
Returns all videos from YouTube (not database).

#### Get Ingested Videos
```http
GET /api/videos/channel/{channel_id}/ingested
```
Returns videos that have been ingested into the database.

#### Ingest Videos
```http
POST /api/videos/ingest/{channel_id}
Content-Type: application/json

{
  "video_ids": ["video_id_1", "video_id_2"]
}
```

#### Get Ingestion Status
```http
GET /api/videos/ingest/status/{channel_id}
```

### Chat Endpoints

#### Chat with Channel
```http
POST /api/chat/{channel_id}
Content-Type: application/json

{
  "message": "Your question here",
  "channel_id": 1
}
```

#### Search Content
```http
POST /api/chat/search/{channel_id}?query={search_query}&limit={result_limit}
```

### Response Formats

#### Channel Response
```json
{
  "id": 1,
  "channel_id": "UC...",
  "name": "Channel Name",
  "description": "Channel description",
  "thumbnail_url": "https://...",
  "subscriber_count": 100000,
  "video_count": 50,
  "url": "https://youtube.com/@channel",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Chat Response
```json
{
  "response": "AI response text",
  "sources": [
    {
      "video_title": "Video Title",
      "video_url": "https://youtube.com/watch?v=...",
      "timestamp_start": 120,
      "timestamp_end": 180,
      "content_preview": "Relevant transcript excerpt..."
    }
  ]
}
```

## Development

### Project Structure

```
yt-ai-library/
├── backend/
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   └── workflows/     # LangGraph workflows
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   └── contexts/      # React contexts
│   ├── package.json
│   └── public/
├── docs/                  # Documentation
├── docker-compose.yml
└── README.md
```

### Adding New Features

#### Backend Development

1. **Database Models**: Add new models in `app/models/`
2. **API Endpoints**: Create routes in `app/api/`
3. **Business Logic**: Implement services in `app/services/`
4. **Workflows**: Add LangGraph workflows in `app/workflows/`

#### Frontend Development

1. **Components**: Create reusable components in `src/components/`
2. **Pages**: Add new pages in `src/pages/`
3. **API Integration**: Update `src/services/api.ts`
4. **State Management**: Use React Context in `src/contexts/`

### Testing

#### Backend Testing
```bash
cd backend
pytest tests/
```

#### Frontend Testing
```bash
cd frontend
npm test
```

### Code Quality

#### Backend Linting
```bash
cd backend
black .
flake8 .
mypy .
```

#### Frontend Linting
```bash
cd frontend
npm run lint
npm run type-check
```

## Troubleshooting

### Common Issues

#### Database Connection Failed
- Ensure PostgreSQL is running: `docker-compose ps`
- Check database credentials in `.env`
- Verify pgvector extension is installed

#### OpenAI API Errors
- Verify API key is correct in `.env`
- Check API usage limits and billing
- Ensure model name is correct (o3-mini)

#### YouTube Video Processing Fails
- Some videos may not have transcripts
- Check yt-dlp version and update if needed
- Verify video privacy settings allow transcript access

#### Frontend Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all environment variables are set

### Performance Optimization

#### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_video_embeddings_video_id ON video_embeddings(video_id);
CREATE INDEX idx_videos_channel_id ON videos(channel_id);
CREATE INDEX idx_videos_is_ingested ON videos(is_ingested);
```

#### Memory Management
- Monitor embedding storage size
- Implement cleanup for old embeddings
- Use pagination for large video lists

### Monitoring

#### Backend Logs
```bash
# View application logs
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f backend
```

#### Database Monitoring
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('youtube_library'));

-- Monitor embedding count
SELECT COUNT(*) FROM video_embeddings;

-- Check ingestion progress
SELECT 
  c.name,
  COUNT(v.id) as total_videos,
  COUNT(CASE WHEN v.is_ingested THEN 1 END) as ingested_videos
FROM channels c
LEFT JOIN videos v ON c.id = v.channel_id
GROUP BY c.id, c.name;
```

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature`
8. Submit a pull request

### Code Style Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all new React components
- Write comprehensive docstrings for all functions
- Include type hints for all Python functions
- Follow React best practices and hooks patterns

### Documentation

- Update API documentation for new endpoints
- Add JSDoc comments for complex React components
- Update this README for significant changes
- Include examples in all documentation

---

For additional support or questions, please open an issue on the project repository.