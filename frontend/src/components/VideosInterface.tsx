import React, { useState, useEffect } from 'react';
import { PlayIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Channel, videoApi, Video } from '../services/api';

interface VideosInterfaceProps {
  channel: Channel;
}

const VideosInterface: React.FC<VideosInterfaceProps> = ({ channel }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const ingestedVideos = await videoApi.getIngestedVideos(channel.id);
        setVideos(ingestedVideos);
      } catch (err: any) {
        setError('Failed to load videos');
        console.error('Error loading videos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [channel.id]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count?: number) => {
    if (!count) return '';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Videos</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Ingested Videos</h2>
            <p className="text-sm text-gray-600 mt-1">
              {videos.length} videos available for AI chat and search
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircleIcon className="w-5 h-5" />
            <span>Ready for AI interactions</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {videos.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlayIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Videos Ingested
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Videos from this channel haven't been ingested yet. 
              Add videos to enable AI chat and search features.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div key={video.id} className="card border border-gray-200 hover:shadow-md transition-shadow">
                <div className="relative mb-4">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-300 rounded flex items-center justify-center">
                      <PlayIcon className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </span>
                  )}

                  <div className="absolute top-2 right-2">
                    {video.is_ingested ? (
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                        <CheckCircleIcon className="w-3 h-3" />
                        <span>Ingested</span>
                      </div>
                    ) : (
                      <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Processing
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {video.view_count && (
                    <p>{formatViewCount(video.view_count)}</p>
                  )}
                  
                  {video.published_at && (
                    <p>Published {formatDate(video.published_at)}</p>
                  )}
                  
                  <p>Added {formatDate(video.created_at)}</p>
                </div>
                
                {video.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {video.description}
                  </p>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>Watch on YouTube</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosInterface;