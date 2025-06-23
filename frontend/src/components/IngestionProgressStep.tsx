import React, { useEffect, useState } from 'react';
import { Channel, videoApi, IngestionProgress } from '../services/api';

interface IngestionProgressStepProps {
  channel: Channel;
  videoIds: string[];
  onComplete: () => void;
  onError: (error: string) => void;
}

const IngestionProgressStep: React.FC<IngestionProgressStepProps> = ({
  channel,
  videoIds,
  onComplete,
  onError,
}) => {
  const [progress, setProgress] = useState<IngestionProgress>({
    total: videoIds.length,
    ingested: 0,
    progress: 0,
  });
  const [status, setStatus] = useState('Starting ingestion...');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startIngestion = async () => {
      try {
        setStatus('Initializing video ingestion...');
        
        // Start the ingestion process
        await videoApi.ingestVideos(channel.id, videoIds);
        
        setStatus('Processing videos and creating embeddings...');
        
        // Poll for progress updates
        const pollInterval = setInterval(async () => {
          try {
            const currentProgress = await videoApi.getIngestionStatus(channel.id);
            setProgress(currentProgress);
            
            if (currentProgress.progress >= 1) {
              setStatus('Ingestion completed successfully!');
              setIsComplete(true);
              clearInterval(pollInterval);
              
              setTimeout(() => {
                onComplete();
              }, 1500);
            } else {
              const percentage = Math.round(currentProgress.progress * 100);
              setStatus(`Processing videos... ${currentProgress.ingested} of ${currentProgress.total} completed (${percentage}%)`);
            }
          } catch (error) {
            console.error('Error polling ingestion status:', error);
            clearInterval(pollInterval);
            onError('Failed to get ingestion status');
          }
        }, 2000);

        // Cleanup interval on component unmount
        return () => clearInterval(pollInterval);
        
      } catch (error: any) {
        console.error('Ingestion failed:', error);
        onError(error.response?.data?.detail || 'Failed to start video ingestion');
      }
    };

    startIngestion();
  }, [channel.id, videoIds, onComplete, onError]);

  const progressPercentage = Math.round(progress.progress * 100);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isComplete ? 'bg-green-100' : 'bg-primary-100'
        }`}>
          {isComplete ? (
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
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
          )}
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isComplete ? 'Ingestion Complete!' : 'Processing Videos'}
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          {status}
        </p>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-out ${
              isComplete ? 'bg-green-600' : 'bg-primary-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          {progress.ingested} of {progress.total} videos processed ({progressPercentage}%)
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Processing Steps:
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${progressPercentage > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-600">Downloading video transcripts</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${progressPercentage > 25 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-600">Processing text content</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${progressPercentage > 50 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-600">Creating AI embeddings</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${progressPercentage > 75 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-600">Storing in vector database</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${isComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-600">Finalizing library setup</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h5 className="text-sm font-medium text-blue-900 mb-1">
              What's happening?
            </h5>
            <p className="text-xs text-blue-700 leading-relaxed">
              We're downloading transcripts from your selected videos, breaking them into meaningful chunks, 
              and creating AI embeddings that will power semantic search and intelligent chat features. 
              This process may take a few minutes depending on the number and length of videos.
            </p>
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            🎉 Your channel library is ready! You can now chat with your content, search for specific topics, and generate study materials.
          </p>
        </div>
      )}
    </div>
  );
};

export default IngestionProgressStep;