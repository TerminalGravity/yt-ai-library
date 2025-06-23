from typing import List
from sqlalchemy.orm import Session
from openai import OpenAI
import os
from datetime import datetime
import re

from app.models import Video, VideoEmbedding, Channel
from app.services.youtube_service import YouTubeService

class IngestionService:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.youtube_service = YouTubeService()
        self.chunk_size = 1000  # characters per chunk
        self.chunk_overlap = 200  # overlap between chunks
    
    async def ingest_videos(self, channel_id: int, video_ids: List[str], db: Session):
        """Ingest multiple videos for a channel"""
        try:
            for video_id in video_ids:
                await self.ingest_single_video(channel_id, video_id, db)
        except Exception as e:
            print(f"Error during video ingestion: {str(e)}")
            raise
    
    async def ingest_single_video(self, channel_id: int, video_id: str, db: Session):
        """Ingest a single video"""
        try:
            # Check if video already exists and is ingested
            existing_video = db.query(Video).filter(Video.video_id == video_id).first()
            if existing_video and existing_video.is_ingested:
                print(f"Video {video_id} already ingested, skipping")
                return
            
            # Get video information from YouTube
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            
            # If video doesn't exist in database, we need to get its info first
            if not existing_video:
                # This is a simplified approach - in practice, you'd want to get full video info
                video_info = {
                    "video_id": video_id,
                    "title": f"Video {video_id}",  # Placeholder - should get real title
                    "description": "",
                    "url": video_url
                }
                
                db_video = Video(
                    video_id=video_id,
                    title=video_info["title"],
                    description=video_info["description"],
                    url=video_url,
                    channel_id=channel_id,
                    is_ingested=False
                )
                db.add(db_video)
                db.commit()
                db.refresh(db_video)
            else:
                db_video = existing_video
            
            # Get transcript
            transcript = await self.youtube_service.get_video_transcript(video_id)
            if not transcript:
                print(f"No transcript available for video {video_id}")
                return
            
            # Update video with transcript
            db_video.transcript = transcript
            db.commit()
            
            # Create embeddings for transcript chunks
            await self.create_embeddings_for_video(db_video, transcript, db)
            
            # Mark video as ingested
            db_video.is_ingested = True
            db.commit()
            
            print(f"Successfully ingested video {video_id}")
            
        except Exception as e:
            print(f"Error ingesting video {video_id}: {str(e)}")
            # Don't re-raise to continue with other videos
    
    async def create_embeddings_for_video(self, video: Video, transcript: str, db: Session):
        """Create embeddings for video transcript chunks"""
        try:
            # Split transcript into chunks
            chunks = self.split_text_into_chunks(transcript)
            
            for i, chunk in enumerate(chunks):
                if not chunk.strip():
                    continue
                
                # Create embedding using OpenAI
                embedding = await self.create_embedding(chunk)
                
                # Calculate approximate timestamp (this is simplified)
                # In a real implementation, you'd want to use the actual subtitle timestamps
                total_duration = len(transcript)
                chunk_start_ratio = sum(len(c) for c in chunks[:i]) / total_duration
                chunk_end_ratio = sum(len(c) for c in chunks[:i+1]) / total_duration
                
                # Assume a typical video length for timestamp calculation
                estimated_duration = 600  # 10 minutes default
                timestamp_start = int(chunk_start_ratio * estimated_duration)
                timestamp_end = int(chunk_end_ratio * estimated_duration)
                
                # Save embedding to database
                db_embedding = VideoEmbedding(
                    video_id=video.id,
                    content=chunk,
                    embedding=embedding,
                    chunk_index=i,
                    timestamp_start=timestamp_start,
                    timestamp_end=timestamp_end
                )
                
                db.add(db_embedding)
            
            db.commit()
            print(f"Created {len(chunks)} embeddings for video {video.video_id}")
            
        except Exception as e:
            print(f"Error creating embeddings for video {video.video_id}: {str(e)}")
            raise
    
    def split_text_into_chunks(self, text: str) -> List[str]:
        """Split text into overlapping chunks"""
        if len(text) <= self.chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            
            # Try to break at a sentence boundary
            if end < len(text):
                # Look for sentence endings within the overlap zone
                break_point = text.rfind('.', start, end)
                if break_point == -1:
                    break_point = text.rfind('!', start, end)
                if break_point == -1:
                    break_point = text.rfind('?', start, end)
                if break_point != -1 and break_point > start + self.chunk_size // 2:
                    end = break_point + 1
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = end - self.chunk_overlap
            if start >= len(text):
                break
        
        return chunks
    
    async def create_embedding(self, text: str) -> List[float]:
        """Create embedding for text using OpenAI"""
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text,
                encoding_format="float"
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error creating embedding: {str(e)}")
            raise