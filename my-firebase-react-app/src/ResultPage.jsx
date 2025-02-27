import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

function ResultPage() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [ttsAudioUrl, setTtsAudioUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function handleDownload() {
    if (!videoUrl) return;
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "myNarratedClip.mp4"; // customize filename
      document.body.appendChild(link);
      link.click();

      // cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }

  async function handleAudioDownload() {
    if (!ttsAudioUrl) return;
    try {
      const response = await fetch(ttsAudioUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "narration.mp3"; // customize filename
      document.body.appendChild(link);
      link.click();

      // cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Audio download failed:", error);
    }
  }

  useEffect(() => {
    const q = query(
      collection(db, "videos"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLoading(true);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        console.log("Realtime doc ID:", doc.id, data);

        if (data.mergedVideoUrl) {
          setVideoUrl(data.mergedVideoUrl);
        }
        
        if (data.ttsAudioUrl) {
          setTtsAudioUrl(data.ttsAudioUrl);
        }
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '0 10px'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#cccccc',
    cursor: 'not-allowed'
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
      <h2>Your narrated video is ready!</h2>
      
      {loading ? (
        <p>Loading video...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : videoUrl ? (
        <>
          {/* <p>Video URL: {videoUrl}</p> */}
          <video 
            src={videoUrl} 
            controls 
            style={{ width: '100%', maxWidth: '600px', marginTop: '20px' }} 
          />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button 
              onClick={handleDownload}
              style={buttonStyle}
            >
              Download Video
            </button>
            
            <button 
              onClick={handleAudioDownload}
              style={ttsAudioUrl ? buttonStyle : disabledButtonStyle}
              disabled={!ttsAudioUrl}
            >
              Save Audio
            </button>
          </div>
          {!ttsAudioUrl && (
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
              Audio narration is not yet available for download
            </p>
          )}
        </>
      ) : (
        <p>Waiting for merged video...</p>
      )}
    </div>
  );
}

export default ResultPage; 