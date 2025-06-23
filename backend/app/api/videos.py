from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Channel, Video
from app import schemas
from app.services.youtube_service import YouTubeService
from app.services.ingestion_service import IngestionService

router = APIRouter()

@router.get("/channel/{channel_id}", response_model=List[schemas.VideoAnalysis])
async def get_channel_videos(channel_id: int, db: Session = Depends(get_db)):
    """Get all videos for a channel from YouTube (not from database)"""
    try:
        channel = db.query(Channel).filter(Channel.id == channel_id).first()
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")
        
        youtube_service = YouTubeService()
        videos = await youtube_service.get_channel_videos(channel.channel_id)
        
        return [schemas.VideoAnalysis(**video) for video in videos]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get channel videos: {str(e)}")

@router.get("/channel/{channel_id}/ingested", response_model=List[schemas.Video])
async def get_ingested_videos(channel_id: int, db: Session = Depends(get_db)):
    """Get all ingested videos for a channel from database"""
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    videos = db.query(Video).filter(
        Video.channel_id == channel_id,
        Video.is_ingested == True
    ).all()
    
    return videos

@router.post("/ingest/{channel_id}")
async def ingest_videos(
    channel_id: int,
    request: schemas.VideoIngestRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start ingesting selected videos for a channel"""
    try:
        channel = db.query(Channel).filter(Channel.id == channel_id).first()
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")
        
        # Start background ingestion process
        ingestion_service = IngestionService()
        background_tasks.add_task(
            ingestion_service.ingest_videos,
            channel_id,
            request.video_ids,
            db
        )
        
        return {"message": f"Started ingesting {len(request.video_ids)} videos", "status": "processing"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to start ingestion: {str(e)}")

@router.get("/ingest/status/{channel_id}")
async def get_ingestion_status(channel_id: int, db: Session = Depends(get_db)):
    """Get ingestion status for a channel"""
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    total_videos = db.query(Video).filter(Video.channel_id == channel_id).count()
    ingested_videos = db.query(Video).filter(
        Video.channel_id == channel_id,
        Video.is_ingested == True
    ).count()
    
    return {
        "total": total_videos,
        "ingested": ingested_videos,
        "progress": ingested_videos / total_videos if total_videos > 0 else 0
    }

@router.get("/{video_id}", response_model=schemas.Video)
async def get_video(video_id: int, db: Session = Depends(get_db)):
    """Get a specific video"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video