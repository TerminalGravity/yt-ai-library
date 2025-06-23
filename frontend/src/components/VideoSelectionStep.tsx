import React, { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, PlayIcon } from '@heroicons/react/24/outline';
import { ChannelAnalysis, VideoAnalysis, Channel, channelApi } from '../services/api';

interface VideoSelectionStepProps {
  channelAnalysis: ChannelAnalysis;
  videos: VideoAnalysis[];
  onComplete: (channel: Channel, selectedVideoIds: string[]) => void;
  onBack: () => void;
  onError: (error: string) => void;
}

const VideoSelectionStep: React.FC<VideoSelectionStepProps> = ({
  channelAnalysis,
  videos,
  onComplete,
  onBack,
  onError,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    
    const query = searchQuery.toLowerCase();
    return videos.filter(video =>
      video.title.toLowerCase().includes(query) ||
      (video.description && video.description.toLowerCase().includes(query))
    );
  }, [videos, searchQuery]);

  const handleVideoToggle = (videoId: string) => {
    setSelectedVideoIds(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVideoIds.length === filteredVideos.length) {
      setSelectedVideoIds([]);
    } else {
      setSelectedVideoIds(filteredVideos.map(video => video.video_id));
    }
  };

  const handleProceed = async () => {
    if (selectedVideoIds.length === 0) {
      onError('Please select at least one video to ingest');
      return;
    }

    try {
      setLoading(true);
      
      // Get the created channel data
      const channels = await channelApi.getChannels();
      const channel = channels.find(c => c.channel_id === channelAnalysis.channel_id);
      
      if (!channel) {
        throw new Error('Channel not found');
      }

      onComplete(channel, selectedVideoIds);
    } catch (error: any) {
      onError(error.response?.data?.detail || 'Failed to proceed with video selection');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Channel Summary */}
      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
        {channelAnalysis.thumbnail_url && (
          <img
            src={channelAnalysis.thumbnail_url}
            alt={channelAnalysis.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {channelAnalysis.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {channelAnalysis.description && channelAnalysis.description.length > 100
              ? `${channelAnalysis.description.substring(0, 100)}...`
              : channelAnalysis.description}
          </p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            {channelAnalysis.subscriber_count && (
              <span>{channelAnalysis.subscriber_count.toLocaleString()} subscribers</span>
            )}
            <span>{videos.length} videos available</span>
          </div>
        </div>
      </div>

      {/* Search and Selection Controls */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          <button
            onClick={handleSelectAll}
            className="btn-secondary whitespace-nowrap"
          >
            {selectedVideoIds.length === filteredVideos.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {selectedVideoIds.length} of {filteredVideos.length} videos selected
          </p>
          {searchQuery && (
            <p className="text-sm text-gray-500">
              Showing {filteredVideos.length} of {videos.length} videos
            </p>
          )}
        </div>
      </div>

      {/* Video List */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
        {filteredVideos.map((video) => (
          <div
            key={video.video_id}
            className={`flex items-start space-x-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedVideoIds.includes(video.video_id) ? 'bg-primary-50' : ''
            }`}
            onClick={() => handleVideoToggle(video.video_id)}
          >
            <input
              type="checkbox"
              checked={selectedVideoIds.includes(video.video_id)}
              onChange={() => handleVideoToggle(video.video_id)}
              className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-12 bg-gray-300 rounded flex items-center justify-center">
                      <PlayIcon className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  {video.duration && (
                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {video.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                    {video.view_count && (
                      <span>{formatViewCount(video.view_count)}</span>
                    )}
                    {video.published_at && (
                      <span>• {new Date(video.published_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  {video.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredVideos.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {searchQuery ? 'No videos found matching your search' : 'No videos available'}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="btn-secondary"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleProceed}
          disabled={selectedVideoIds.length === 0 || loading}
          className="btn-primary"
        >
          {loading ? 'Processing...' : `Ingest ${selectedVideoIds.length} Videos`}
        </button>
      </div>
    </div>
  );
};

export default VideoSelectionStep;