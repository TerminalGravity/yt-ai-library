from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.models import Channel, VideoEmbedding
from app import schemas
from app.services.chat_service import ChatService

router = APIRouter()

@router.post("/{channel_id}", response_model=schemas.ChatResponse)
async def chat_with_channel(
    channel_id: int,
    request: schemas.ChatRequest,
    db: Session = Depends(get_db)
):
    """Chat with AI using channel content as context"""
    try:
        channel = db.query(Channel).filter(Channel.id == channel_id).first()
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")
        
        chat_service = ChatService()
        response = await chat_service.chat_with_context(
            message=request.message,
            channel_id=channel_id,
            db=db
        )
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.post("/search/{channel_id}")
async def search_content(
    channel_id: int,
    query: str,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Search for content in channel using semantic similarity"""
    try:
        channel = db.query(Channel).filter(Channel.id == channel_id).first()
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")
        
        chat_service = ChatService()
        query_embedding = await chat_service.get_embedding(query)
        
        # Perform similarity search using pgvector
        results = db.execute(
            text("""
                SELECT ve.content, ve.timestamp_start, ve.timestamp_end, v.title, v.url,
                       ve.embedding <=> :query_embedding as distance
                FROM video_embeddings ve
                JOIN videos v ON ve.video_id = v.id
                WHERE v.channel_id = :channel_id
                ORDER BY distance
                LIMIT :limit
            """),
            {
                "query_embedding": query_embedding,
                "channel_id": channel_id,
                "limit": limit
            }
        ).fetchall()
        
        return [
            {
                "content": row.content,
                "timestamp_start": row.timestamp_start,
                "timestamp_end": row.timestamp_end,
                "video_title": row.title,
                "video_url": row.url,
                "similarity_score": 1 - row.distance
            }
            for row in results
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")