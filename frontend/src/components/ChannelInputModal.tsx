import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ChannelAnalysisStep from './ChannelAnalysisStep';
import VideoSelectionStep from './VideoSelectionStep';
import IngestionProgressStep from './IngestionProgressStep';
import { useChannel } from '../contexts/ChannelContext';
import { ChannelAnalysis, VideoAnalysis, Channel } from '../services/api';

interface ChannelInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: (channelId: number) => void;
}

type ModalStep = 'input' | 'analysis' | 'selection' | 'ingestion' | 'completed';

const ChannelInputModal: React.FC<ChannelInputModalProps> = ({
  isOpen,
  onClose,
  onChannelCreated,
}) => {
  const { addChannel } = useChannel();
  const [step, setStep] = useState<ModalStep>('input');
  const [channelUrl, setChannelUrl] = useState('');
  const [channelAnalysis, setChannelAnalysis] = useState<ChannelAnalysis | null>(null);
  const [channelVideos, setChannelVideos] = useState<VideoAnalysis[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [createdChannel, setCreatedChannel] = useState<Channel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetModal = () => {
    setStep('input');
    setChannelUrl('');
    setChannelAnalysis(null);
    setChannelVideos([]);
    setSelectedVideoIds([]);
    setCreatedChannel(null);
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleAnalysisComplete = (analysis: ChannelAnalysis, videos: VideoAnalysis[]) => {
    setChannelAnalysis(analysis);
    setChannelVideos(videos);
    setStep('selection');
  };

  const handleSelectionComplete = (channel: Channel, videoIds: string[]) => {
    setCreatedChannel(channel);
    setSelectedVideoIds(videoIds);
    addChannel(channel);
    setStep('ingestion');
  };

  const handleIngestionComplete = () => {
    setStep('completed');
    setTimeout(() => {
      if (createdChannel) {
        onChannelCreated(createdChannel.id);
      }
      handleClose();
    }, 2000);
  };

  const getModalTitle = () => {
    switch (step) {
      case 'input':
        return 'Add New Channel';
      case 'analysis':
        return 'Analyzing Channel';
      case 'selection':
        return 'Select Videos to Ingest';
      case 'ingestion':
        return 'Ingesting Videos';
      case 'completed':
        return 'Channel Added Successfully';
      default:
        return 'Add New Channel';
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'input':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="channelUrl" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Channel URL
              </label>
              <input
                type="url"
                id="channelUrl"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                placeholder="https://www.youtube.com/@channelname"
                className="input-field"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Paste any YouTube channel URL (e.g., @username, /c/channel, /channel/id)
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('analysis')}
                disabled={!channelUrl.trim() || loading}
                className="btn-primary"
              >
                Analyze Channel
              </button>
            </div>
          </div>
        );

      case 'analysis':
        return (
          <ChannelAnalysisStep
            channelUrl={channelUrl}
            onComplete={handleAnalysisComplete}
            onError={(error) => {
              setError(error);
              setStep('input');
            }}
          />
        );

      case 'selection':
        return (
          <VideoSelectionStep
            channelAnalysis={channelAnalysis!}
            videos={channelVideos}
            onComplete={handleSelectionComplete}
            onBack={() => setStep('input')}
            onError={(error) => setError(error)}
          />
        );

      case 'ingestion':
        return (
          <IngestionProgressStep
            channel={createdChannel!}
            videoIds={selectedVideoIds}
            onComplete={handleIngestionComplete}
            onError={(error) => setError(error)}
          />
        );

      case 'completed':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Channel Added Successfully!
            </h3>
            <p className="text-sm text-gray-600">
              Your channel library is ready. Redirecting to the channel page...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-25" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                {getModalTitle()}
              </Dialog.Title>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {renderStep()}
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ChannelInputModal;