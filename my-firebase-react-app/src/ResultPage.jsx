import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

function ResultPage() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLatestVideo() {
      try {
        // Query the latest video document
        const q = query(
          collection(db, 'videos'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          if (data.mergedVideoUrl) {
            setVideoUrl(data.mergedVideoUrl);
          }
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    }

    fetchLatestVideo();
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
      <h2>Your narrated video is ready!</h2>
      
      {loading ? (
        <p>Loading video...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : videoUrl ? (
        <video 
          src={videoUrl} 
          controls 
          style={{ width: '100%', maxWidth: '600px', marginTop: '20px' }} 
        />
      ) : (
        <p>Waiting for merged video...</p>
      )}
    </div>
  );
}

export default ResultPage; 