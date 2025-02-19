import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostVideo.css';

function PostVideo() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just console.log the file and userPrompt
    console.log('File:', selectedFile);
    console.log('User Prompt:', userPrompt);
    // Navigate to processing page
    navigate('/processing');
  };

  return (
    <div className="post-video-container">
      <div className="post-video-card">
        <h2 className="post-video-title">Post a New Video</h2>
        <form onSubmit={handleSubmit} className="post-video-form">
          <div className="file-input-container">
            <label htmlFor="video-upload" className="file-input-label">
              Choose Video File
            </label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              required
              className="file-input"
            />
            {selectedFile && (
              <p className="file-name">Selected: {selectedFile.name}</p>
            )}
          </div>
          
          <div className="textarea-container">
            <textarea
              placeholder="Add context for your video (optional)"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows="4"
              className="prompt-textarea"
            />
          </div>
          
          <button type="submit" className="submit-button">
            Generate Narration
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostVideo; 