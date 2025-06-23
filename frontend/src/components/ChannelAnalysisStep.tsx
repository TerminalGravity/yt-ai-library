import React, { useEffect, useState } from 'react';
import { channelApi, videoApi, ChannelAnalysis, VideoAnalysis } from '../services/api';

interface ChannelAnalysisStepProps {
  channelUrl: string;
  onComplete: (analysis: ChannelAnalysis, videos: VideoAnalysis[]) => void;
  onError: (error: string) => void;
}

const ChannelAnalysisStep: React.FC<ChannelAnalysisStepProps> = ({
  channelUrl,
  onComplete,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Analyzing channel...');

  useEffect(() => {
    const analyzeChannel = async () => {
      try {
        setStatus('Analyzing channel information...');
        setProgress(25);

        // Analyze the channel
        const channelAnalysis = await channelApi.analyzeChannel(channelUrl);
        
        setStatus('Creating channel in library...');
        setProgress(50);

        // Create the channel in the database
        const createdChannel = await channelApi.createChannel({
          name: channelAnalysis.name,
          description: channelAnalysis.description,
          url: channelUrl,
        });

        setStatus('Fetching channel videos...');
        setProgress(75);

        // Get the channel's videos
        const videos = await videoApi.getChannelVideos(createdChannel.id);

        setStatus('Analysis complete!');
        setProgress(100);

        setTimeout(() => {
          onComplete(channelAnalysis, videos);
        }, 500);

      } catch (error: any) {
        console.error('Channel analysis failed:', error);
        onError(error.response?.data?.detail || 'Failed to analyze channel. Please check the URL and try again.');
      } finally {
        setLoading(false);
      }
    };

    analyzeChannel();
  }, [channelUrl, onComplete, onError]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            className="w-8 h-8 text-primary-600 animate-spin" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Analyzing Channel
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          {status}
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          {progress}% complete
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          What we're doing:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className={progress >= 25 ? 'text-green-600' : ''}>
            • Extracting channel information and metadata
          </li>
          <li className={progress >= 50 ? 'text-green-600' : ''}>
            • Creating channel entry in your library
          </li>
          <li className={progress >= 75 ? 'text-green-600' : ''}>
            • Fetching available videos from the channel
          </li>
          <li className={progress >= 100 ? 'text-green-600' : ''}>
            • Preparing video selection interface
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChannelAnalysisStep;