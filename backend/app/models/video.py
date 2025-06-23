from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    thumbnail_url = Column(String)
    duration = Column(Integer)  # duration in seconds
    view_count = Column(Integer)
    published_at = Column(DateTime)
    url = Column(String, nullable=False)
    transcript = Column(Text)
    is_ingested = Column(Boolean, default=False)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    channel = relationship("Channel", back_populates="videos")
    embeddings = relationship("VideoEmbedding", back_populates="video", cascade="all, delete-orphan")