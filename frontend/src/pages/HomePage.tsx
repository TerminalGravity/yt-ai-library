import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import ChannelInputModal from '../components/ChannelInputModal';
import Sidebar from '../components/Sidebar';
import { useChannel } from '../contexts/ChannelContext';

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { channels } = useChannel();
  const navigate = useNavigate();

  const handleChannelCreated = (channelId: number) => {
    navigate(`/channel/${channelId}`);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex items-center justify-center">
        {channels.length === 0 ? (
          <div className="text-center">
            <div className="mx-auto w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-8">
              <PlusIcon className="w-16 h-16 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to YouTube AI Library
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Start by adding a YouTube channel to create your AI-powered study library
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary text-lg px-8 py-3"
            >
              Add Your First Channel
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              YouTube AI Library
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Select a channel from the sidebar or add a new one
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5 inline-block mr-2" />
              Add New Channel
            </button>
          </div>
        )}
      </div>

      <ChannelInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onChannelCreated={handleChannelCreated}
      />
    </div>
  );
};

export default HomePage;