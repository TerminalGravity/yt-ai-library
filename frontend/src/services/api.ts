import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Channel {
  id: number;
  channel_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  subscriber_count?: number;
  video_count?: number;
  url: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ChannelAnalysis {
  channel_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  subscriber_count?: number;
  video_count?: number;
}

export interface VideoAnalysis {
  video_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  duration?: number;
  view_count?: number;
  published_at?: string;
}

export interface Video {
  id: number;
  video_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  duration?: number;
  view_count?: number;
  published_at?: string;
  is_ingested: boolean;
  channel_id: number;
  created_at: string;
  updated_at?: string;
}

export interface ChatRequest {
  message: string;
  channel_id: number;
}

export interface ChatResponse {
  response: string;
  sources: Array<{
    video_title: string;
    video_url: string;
    timestamp_start: number;
    timestamp_end: number;
    content_preview: string;
  }>;
}

export interface IngestionProgress {
  total: number;
  ingested: number;
  progress: number;
}

// API functions
export const channelApi = {
  analyzeChannel: async (url: string): Promise<ChannelAnalysis> => {
    const response = await api.post('/api/channels/analyze', null, { params: { url } });
    return response.data;
  },

  createChannel: async (channelData: { name: string; description?: string; url: string }): Promise<Channel> => {
    const response = await api.post('/api/channels/', channelData);
    return response.data;
  },

  getChannels: async (): Promise<Channel[]> => {
    const response = await api.get('/api/channels/');
    return response.data;
  },

  getChannel: async (channelId: number): Promise<Channel> => {
    const response = await api.get(`/api/channels/${channelId}`);
    return response.data;
  },

  deleteChannel: async (channelId: number): Promise<void> => {
    await api.delete(`/api/channels/${channelId}`);
  },
};

export const videoApi = {
  getChannelVideos: async (channelId: number): Promise<VideoAnalysis[]> => {
    const response = await api.get(`/api/videos/channel/${channelId}`);
    return response.data;
  },

  getIngestedVideos: async (channelId: number): Promise<Video[]> => {
    const response = await api.get(`/api/videos/channel/${channelId}/ingested`);
    return response.data;
  },

  ingestVideos: async (channelId: number, videoIds: string[]): Promise<void> => {
    await api.post(`/api/videos/ingest/${channelId}`, { video_ids: videoIds });
  },

  getIngestionStatus: async (channelId: number): Promise<IngestionProgress> => {
    const response = await api.get(`/api/videos/ingest/status/${channelId}`);
    return response.data;
  },
};

export const chatApi = {
  chatWithChannel: async (channelId: number, message: string): Promise<ChatResponse> => {
    const response = await api.post(`/api/chat/${channelId}`, { message, channel_id: channelId });
    return response.data;
  },

  searchContent: async (channelId: number, query: string, limit = 5): Promise<any[]> => {
    const response = await api.post(`/api/chat/search/${channelId}`, null, {
      params: { query, limit }
    });
    return response.data;
  },
};

export default api;