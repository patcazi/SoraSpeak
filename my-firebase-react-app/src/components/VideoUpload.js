import React, { useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    // Create a storage reference in Firebase Storage (for example, under 'videos/')
    const storageRef = ref(storage, `videos/${file.name}`);
    // Start the file upload
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for state changes, errors, and completion
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Calculate and set the upload progress percentage
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(progress);
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error('Upload error:', error);
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log('File available at', url);
          setDownloadURL(url);
        });
      }
    );
  };

  return (
    <div>
      <h2>Upload Video</h2>
      <div className="upload-container">
        <input 
          type="file" 
          accept="video/*" 
          onChange={handleFileChange}
          className="file-input"
        />
        <button 
          onClick={handleUpload} 
          className="button"
          disabled={!file}
        >
          Upload
        </button>
      </div>
      
      {uploadProgress > 0 && (
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
      
      {downloadURL && (
        <div className="alert alert-success">
          <p>Upload Complete!</p>
          <a href={downloadURL} className="download-link">
            View Uploaded Video
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoUpload; 