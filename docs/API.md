# API Documentation

Complete API reference for the YouTube AI Library backend.

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Rate Limiting

No rate limiting is currently implemented, but it's recommended for production deployments.

## Error Handling

All endpoints return standard HTTP status codes and JSON error responses:

```json
{
  "detail": "Error description"
}
```

Common status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Endpoints

### Health Check

#### GET /health
Check the health of the API and database connection.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## Channel Management

### Analyze Channel

#### POST /api/channels/analyze

Analyze a YouTube channel from URL without creating a database entry.

**Parameters:**
- `url` (query parameter): YouTube channel URL

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/channels/analyze?url=https://youtube.com/@channelname"
```

**Response:**
```json
{
  "channel_id": "UC1234567890",
  "name": "Channel Name",
  "description": "Channel description",
  "thumbnail_url": "https://yt3.ggpht.com/...",
  "subscriber_count": 100000,
  "video_count": 50
}
```

### Create Channel

#### POST /api/channels/

Create a new channel in the database.

**Request Body:**
```json
{
  "name": "Channel Name",
  "description": "Optional channel description",
  "url": "https://youtube.com/@channelname"
}
```

**Response:**
```json
{
  "id": 1,
  "channel_id": "UC1234567890",
  "name": "Channel Name",
  "description": "Channel description",
  "thumbnail_url": "https://yt3.ggpht.com/...",
  "subscriber_count": 100000,
  "video_count": 50,
  "url": "https://youtube.com/@channelname",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": null
}
```

### Get All Channels

#### GET /api/channels/

Retrieve all active channels.

**Response:**
```json
[
  {
    "id": 1,
    "channel_id": "UC1234567890",
    "name": "Channel Name",
    "description": "Channel description",
    "thumbnail_url": "https://yt3.ggpht.com/...",
    "subscriber_count": 100000,
    "video_count": 50,
    "url": "https://youtube.com/@channelname",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": null
  }
]
```

### Get Channel by ID

#### GET /api/channels/{channel_id}

Retrieve a specific channel by ID.

**Parameters:**
- `channel_id` (path): Channel database ID

**Response:**
```json
{
  "id": 1,
  "channel_id": "UC1234567890",
  "name": "Channel Name",
  "description": "Channel description",
  "thumbnail_url": "https://yt3.ggpht.com/...",
  "subscriber_count": 100000,
  "video_count": 50,
  "url": "https://youtube.com/@channelname",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": null
}
```

### Delete Channel

#### DELETE /api/channels/{channel_id}

Soft delete a channel (sets is_active to false).

**Parameters:**
- `channel_id` (path): Channel database ID

**Response:**
```json
{
  "message": "Channel deleted successfully"
}
```

---

## Video Management

### Get Channel Videos from YouTube

#### GET /api/videos/channel/{channel_id}

Fetch videos from YouTube for a specific channel (not from database).

**Parameters:**
- `channel_id` (path): Channel database ID

**Response:**
```json
[
  {
    "video_id": "dQw4w9WgXcQ",
    "title": "Video Title",
    "description": "Video description",
    "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
    "duration": 212,
    "view_count": 1000000,
    "published_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Ingested Videos

#### GET /api/videos/channel/{channel_id}/ingested

Retrieve videos that have been ingested into the database for a channel.

**Parameters:**
- `channel_id` (path): Channel database ID

**Response:**
```json
[
  {
    "id": 1,
    "video_id": "dQw4w9WgXcQ",
    "title": "Video Title",
    "description": "Video description",
    "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
    "duration": 212,
    "view_count": 1000000,
    "published_at": "2024-01-01T00:00:00Z",
    "is_ingested": true,
    "channel_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T01:00:00Z"
  }
]
```

### Ingest Videos

#### POST /api/videos/ingest/{channel_id}

Start the ingestion process for selected videos.

**Parameters:**
- `channel_id` (path): Channel database ID

**Request Body:**
```json
{
  "video_ids": ["dQw4w9WgXcQ", "jNQXAC9IVRw"]
}
```

**Response:**
```json
{
  "message": "Started ingesting 2 videos",
  "status": "processing"
}
```

### Get Ingestion Status

#### GET /api/videos/ingest/status/{channel_id}

Check the progress of video ingestion for a channel.

**Parameters:**
- `channel_id` (path): Channel database ID

**Response:**
```json
{
  "total": 10,
  "ingested": 7,
  "progress": 0.7
}
```

### Get Video by ID

#### GET /api/videos/{video_id}

Retrieve a specific video by its database ID.

**Parameters:**
- `video_id` (path): Video database ID

**Response:**
```json
{
  "id": 1,
  "video_id": "dQw4w9WgXcQ",
  "title": "Video Title",
  "description": "Video description",
  "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
  "duration": 212,
  "view_count": 1000000,
  "published_at": "2024-01-01T00:00:00Z",
  "is_ingested": true,
  "channel_id": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T01:00:00Z"
}
```

---

## Chat and Search

### Chat with Channel

#### POST /api/chat/{channel_id}

Send a message to the AI using channel content as context.

**Parameters:**
- `channel_id` (path): Channel database ID

**Request Body:**
```json
{
  "message": "What topics are covered in this channel?",
  "channel_id": 1
}
```

**Response:**
```json
{
  "response": "Based on the videos in this channel, the main topics covered include...",
  "sources": [
    {
      "video_title": "Introduction to AI",
      "video_url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
      "timestamp_start": 120,
      "timestamp_end": 180,
      "content_preview": "In this section, we discuss the fundamentals of artificial intelligence..."
    }
  ]
}
```

### Search Content

#### POST /api/chat/search/{channel_id}

Perform semantic search across channel content.

**Parameters:**
- `channel_id` (path): Channel database ID
- `query` (query parameter): Search query
- `limit` (query parameter, optional): Number of results (default: 5)

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/chat/search/1?query=machine%20learning&limit=10"
```

**Response:**
```json
[
  {
    "content": "Machine learning is a subset of artificial intelligence that focuses on...",
    "timestamp_start": 45,
    "timestamp_end": 120,
    "video_title": "Introduction to AI",
    "video_url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "similarity_score": 0.85
  }
]
```

---

## Data Models

### Channel Model

```python
{
  "id": int,                    # Database ID
  "channel_id": str,           # YouTube channel ID
  "name": str,                 # Channel name
  "description": str | None,   # Channel description
  "thumbnail_url": str | None, # Channel avatar URL
  "subscriber_count": int | None, # Subscriber count
  "video_count": int | None,   # Number of videos
  "url": str,                  # Original channel URL
  "is_active": bool,           # Active status
  "created_at": datetime,      # Creation timestamp
  "updated_at": datetime | None # Last update timestamp
}
```

### Video Model

```python
{
  "id": int,                    # Database ID
  "video_id": str,             # YouTube video ID
  "title": str,                # Video title
  "description": str | None,   # Video description
  "thumbnail_url": str | None, # Video thumbnail URL
  "duration": int | None,      # Duration in seconds
  "view_count": int | None,    # View count
  "published_at": datetime | None, # Publication date
  "url": str,                  # Video URL
  "transcript": str | None,    # Video transcript
  "is_ingested": bool,         # Ingestion status
  "channel_id": int,           # Foreign key to channel
  "created_at": datetime,      # Creation timestamp
  "updated_at": datetime | None # Last update timestamp
}
```

### Video Embedding Model

```python
{
  "id": int,              # Database ID
  "video_id": int,        # Foreign key to video
  "content": str,         # Text content that was embedded
  "embedding": List[float], # Vector embedding (1536 dimensions)
  "chunk_index": int,     # Position in transcript
  "timestamp_start": int | None, # Start time in seconds
  "timestamp_end": int | None,   # End time in seconds
  "created_at": datetime  # Creation timestamp
}
```

---

## Error Responses

### Validation Error (422)

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Not Found (404)

```json
{
  "detail": "Channel not found"
}
```

### Bad Request (400)

```json
{
  "detail": "Invalid YouTube channel URL"
}
```

### Internal Server Error (500)

```json
{
  "detail": "Internal server error occurred"
}
```

---

## Rate Limiting (Future Implementation)

When implemented, rate limiting will follow these guidelines:

- **Channel Analysis**: 10 requests per minute per IP
- **Video Ingestion**: 5 requests per minute per IP
- **Chat Requests**: 30 requests per minute per IP
- **Search Requests**: 60 requests per minute per IP

Rate limit headers will be included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

---

## Webhooks (Future Implementation)

Future webhook support for:
- Ingestion completion notifications
- Error notifications
- Channel update notifications

Webhook payload example:
```json
{
  "event": "ingestion.completed",
  "data": {
    "channel_id": 1,
    "video_count": 5,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```