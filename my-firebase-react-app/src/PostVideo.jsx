import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, db, auth } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './PostVideo.css';

function PostVideo() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Create a reference to the file in Firebase Storage
    const fileRef = ref(storage, 'videos/' + selectedFile.name);

    // Start the upload
    const uploadTask = uploadBytesResumable(fileRef, selectedFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Track upload progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error('Upload error:', error);
        // TODO: Add error handling UI
      },
      async () => {
        try {
          // Get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Store metadata in Firestore
          await addDoc(collection(db, 'videos'), {
            url: downloadURL,
            prompt: userPrompt,
            createdAt: serverTimestamp(),
            status: 'uploaded',
            userId: auth.currentUser?.uid, // Store user ID if available
            fileName: selectedFile.name
          });

          console.log('Upload complete and metadata stored!');
          navigate('/processing');
        } catch (error) {
          console.error('Error storing video metadata:', error);
          // TODO: Add error handling UI
        }
      }
    );
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
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span className="progress-text">{Math.round(uploadProgress)}%</span>
            </div>
          )}
          
          <div className="textarea-container">
            <textarea
              placeholder="Add context for your video (optional)"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows="4"
              className="prompt-textarea"
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={!selectedFile || uploadProgress > 0}
          >
            Generate Narration
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostVideo; 