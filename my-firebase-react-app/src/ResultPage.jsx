import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

function ResultPage() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
        </>
      ) : (
        <p>Waiting for merged video...</p>
      )}
    </div>
  );
}

export default ResultPage; 