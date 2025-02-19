import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProcessingPage.css';

function ProcessingPage() {
  const navigate = useNavigate();

  return (
    <div className="processing-container">
      <div className="processing-card">
        <h2 className="processing-title">Processing your video...</h2>
        <p className="processing-text">Please wait while we generate your narration.</p>
        <button 
          onClick={() => navigate('/result')}
          className="check-results-button"
        >
          Check Results
        </button>
      </div>
    </div>
  );
}

export default ProcessingPage; 