import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Channel, chatApi } from '../services/api';

interface SearchInterfaceProps {
  channel: Channel;
}

interface SearchResult {
  content: string;
  timestamp_start: number;
  timestamp_end: number;
  video_title: string;
  video_url: string;
  similarity_score: number;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ channel }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchResults = await chatApi.searchContent(channel.id, query, 10);
      setResults(searchResults);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Search Channel Content
        </h2>
        
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search for specific topics, concepts, or keywords..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="btn-primary"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!hasSearched ? (
          <div className="text-center text-gray-500 mt-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Search Channel Content
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Use semantic search to find specific topics, concepts, or discussions 
              across all videos in this channel.
            </p>
          </div>
        ) : loading ? (
          <div className="text-center mt-20">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Searching through video content...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.709 2.172" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-sm text-gray-600">
              Try different keywords or check if the videos have been fully ingested.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results
              </h3>
              <p className="text-sm text-gray-600">
                {results.length} results found
              </p>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="card border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900 flex-1">
                      {result.video_title}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>
                        {Math.round(result.similarity_score * 100)}% match
                      </span>
                      <span>•</span>
                      <span>
                        {formatTimestamp(result.timestamp_start)} - {formatTimestamp(result.timestamp_end)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {result.content}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Found at {formatTimestamp(result.timestamp_start)}
                    </div>
                    <a
                      href={`${result.video_url}&t=${result.timestamp_start}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Watch at timestamp →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInterface;