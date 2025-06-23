from pydantic import BaseModel, HttpUrl, ConfigDict
from typing import List, Optional
from datetime import datetime

class ChannelBase(BaseModel):
    name: str
    description: Optional[str] = None
    url: str

class ChannelCreate(ChannelBase):
    pass

class ChannelAnalysis(BaseModel):
    channel_id: str
    name: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    subscriber_count: Optional[int]
    video_count: Optional[int]

class Channel(ChannelBase):
    id: int
    channel_id: str
    thumbnail_url: Optional[str]
    subscriber_count: Optional[int]
    video_count: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    url: str

class VideoAnalysis(BaseModel):
    video_id: str
    title: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    duration: Optional[int]
    view_count: Optional[int]
    published_at: Optional[datetime]

class Video(VideoBase):
    id: int
    video_id: str
    thumbnail_url: Optional[str]
    duration: Optional[int]
    view_count: Optional[int]
    published_at: Optional[datetime]
    is_ingested: bool
    channel_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class VideoIngestRequest(BaseModel):
    video_ids: List[str]

class ChatRequest(BaseModel):
    message: str
    channel_id: int

class ChatResponse(BaseModel):
    response: str
    sources: List[dict]