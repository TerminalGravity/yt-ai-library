from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.database import Base

class VideoEmbedding(Base):
    __tablename__ = "video_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    content = Column(Text, nullable=False)  # the text chunk that was embedded
    embedding = Column(Vector(1536))  # 1536 dimensions for OpenAI embeddings
    chunk_index = Column(Integer, nullable=False)  # position in the video transcript
    timestamp_start = Column(Integer)  # start time in seconds
    timestamp_end = Column(Integer)  # end time in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    video = relationship("Video", back_populates="embeddings")