import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Channel, channelApi } from '../services/api';

interface ChannelContextType {
  channels: Channel[];
  currentChannel: Channel | null;
  loading: boolean;
  error: string | null;
  refreshChannels: () => Promise<void>;
  setCurrentChannel: (channel: Channel | null) => void;
  addChannel: (channel: Channel) => void;
  removeChannel: (channelId: number) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const useChannel = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
};

interface ChannelProviderProps {
  children: ReactNode;
}

export const ChannelProvider: React.FC<ChannelProviderProps> = ({ children }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedChannels = await channelApi.getChannels();
      setChannels(fetchedChannels);
    } catch (err) {
      setError('Failed to fetch channels');
      console.error('Error fetching channels:', err);
    } finally {
      setLoading(false);
    }
  };

  const addChannel = (channel: Channel) => {
    setChannels(prev => [...prev, channel]);
  };

  const removeChannel = (channelId: number) => {
    setChannels(prev => prev.filter(c => c.id !== channelId));
    if (currentChannel?.id === channelId) {
      setCurrentChannel(null);
    }
  };

  useEffect(() => {
    refreshChannels();
  }, []);

  const value: ChannelContextType = {
    channels,
    currentChannel,
    loading,
    error,
    refreshChannels,
    setCurrentChannel,
    addChannel,
    removeChannel,
  };

  return (
    <ChannelContext.Provider value={value}>
      {children}
    </ChannelContext.Provider>
  );
};