from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import re

from app.database import get_db
from app.models import Channel
from app import schemas
from app.services.youtube_service import YouTubeService

router = APIRouter()

@router.post("/analyze", response_model=schemas.ChannelAnalysis)
async def analyze_channel(url: str, db: Session = Depends(get_db)):
    """Analyze a YouTube channel from URL without saving to database"""
    try:
        youtube_service = YouTubeService()
        channel_data = await youtube_service.analyze_channel(url)
        return schemas.ChannelAnalysis(**channel_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to analyze channel: {str(e)}")

@router.post("/", response_model=schemas.Channel)
async def create_channel(channel: schemas.ChannelCreate, db: Session = Depends(get_db)):
    """Create a new channel in the database"""
    try:
        youtube_service = YouTubeService()
        channel_data = await youtube_service.analyze_channel(channel.url)
        
        # Check if channel already exists
        existing_channel = db.query(Channel).filter(Channel.channel_id == channel_data["channel_id"]).first()
        if existing_channel:
            raise HTTPException(status_code=400, detail="Channel already exists")
        
        db_channel = Channel(
            channel_id=channel_data["channel_id"],
            name=channel_data["name"],
            description=channel_data.get("description"),
            thumbnail_url=channel_data.get("thumbnail_url"),
            subscriber_count=channel_data.get("subscriber_count"),
            video_count=channel_data.get("video_count"),
            url=channel.url
        )
        
        db.add(db_channel)
        db.commit()
        db.refresh(db_channel)
        
        return db_channel
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create channel: {str(e)}")

@router.get("/", response_model=List[schemas.Channel])
async def get_channels(db: Session = Depends(get_db)):
    """Get all channels"""
    channels = db.query(Channel).filter(Channel.is_active == True).all()
    return channels

@router.get("/{channel_id}", response_model=schemas.Channel)
async def get_channel(channel_id: int, db: Session = Depends(get_db)):
    """Get a specific channel"""
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel

@router.delete("/{channel_id}")
async def delete_channel(channel_id: int, db: Session = Depends(get_db)):
    """Delete a channel"""
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    channel.is_active = False
    db.commit()
    
    return {"message": "Channel deleted successfully"}