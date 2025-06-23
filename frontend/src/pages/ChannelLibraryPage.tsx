import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import SearchInterface from '../components/SearchInterface';
import VideosInterface from '../components/VideosInterface';
import { useChannel } from '../contexts/ChannelContext';
import { channelApi, Channel } from '../services/api';

type ActiveTab = 'chat' | 'search' | 'videos';

const ChannelLibraryPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentChannel, setCurrentChannel } = useChannel();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTab = (searchParams.get('tab') as ActiveTab) || 'chat';

  useEffect(() => {
    const loadChannel = async () => {
      if (!channelId) return;

      try {
        setLoading(true);
        setError(null);
        const channel = await channelApi.getChannel(parseInt(channelId));
        setCurrentChannel(channel);
      } catch (err: any) {
        setError('Failed to load channel');
        console.error('Error loading channel:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChannel();
  }, [channelId, setCurrentChannel]);

  const handleTabChange = (tab: ActiveTab) => {
    setSearchParams({ tab });
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading channel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentChannel) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Channel Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested channel could not be found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center space-x-4 mb-4">
              {currentChannel.thumbnail_url && (
                <img
                  src={currentChannel.thumbnail_url}
                  alt={currentChannel.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentChannel.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {currentChannel.video_count || 0} videos • {currentChannel.subscriber_count?.toLocaleString() || 0} subscribers
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="flex space-x-8">
              <button
                onClick={() => handleTabChange('chat')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'chat'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => handleTabChange('search')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Search
              </button>
              <button
                onClick={() => handleTabChange('videos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'videos'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Videos
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <ChatInterface channel={currentChannel} />
          )}
          {activeTab === 'search' && (
            <SearchInterface channel={currentChannel} />
          )}
          {activeTab === 'videos' && (
            <VideosInterface channel={currentChannel} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelLibraryPage;