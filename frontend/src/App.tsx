import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChannelLibraryPage from './pages/ChannelLibraryPage';
import { ChannelProvider } from './contexts/ChannelContext';

function App() {
  return (
    <ChannelProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/channel/:channelId" element={<ChannelLibraryPage />} />
          </Routes>
        </div>
      </Router>
    </ChannelProvider>
  );
}

export default App;