import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useChannel } from '../contexts/ChannelContext';
import ChannelInputModal from './ChannelInputModal';

const Sidebar: React.FC = () => {
  const { channels, removeChannel } = useChannel();
  const { channelId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedChannels, setExpandedChannels] = useState<number[]>([]);

  const toggleChannelExpansion = (id: number) => {
    setExpandedChannels(prev =>
      prev.includes(id)
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteChannel = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this channel?')) {
      try {
        // You would implement the delete API call here
        removeChannel(id);
      } catch (error) {
        console.error('Error deleting channel:', error);
      }
    }
  };

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
        <div className="p-6">
          <Link to="/" className="block">
            <h1 className="text-xl font-bold text-gray-900">Channel Library</h1>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Channels
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Add new channel"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {channels.map((channel) => (
                <div key={channel.id} className="group">
                  <Link
                    to={`/channel/${channel.id}`}
                    className={`
                      flex items-center justify-between p-3 rounded-lg transition-colors
                      ${channelId === channel.id.toString()
                        ? 'bg-primary-100 text-primary-800'
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {channel.thumbnail_url ? (
                        <img
                          src={channel.thumbnail_url}
                          alt={channel.name}
                          className="w-8 h-8 rounded-full mr-3 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {channel.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {channel.video_count || 0} videos
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => toggleChannelExpansion(channel.id)}
                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronDownIcon 
                          className={`w-4 h-4 transition-transform ${
                            expandedChannels.includes(channel.id) ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      <button
                        onClick={(e) => handleDeleteChannel(channel.id, e)}
                        className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete channel"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </Link>

                  {expandedChannels.includes(channel.id) && (
                    <div className="ml-11 mt-2 space-y-1">
                      <Link
                        to={`/channel/${channel.id}?tab=chat`}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                      >
                        Chat
                      </Link>
                      <Link
                        to={`/channel/${channel.id}?tab=search`}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                      >
                        Search
                      </Link>
                      <Link
                        to={`/channel/${channel.id}?tab=videos`}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                      >
                        Videos
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {channels.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">No channels added yet</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                  >
                    Add your first channel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ChannelInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onChannelCreated={() => {}}
      />
    </>
  );
};

export default Sidebar;