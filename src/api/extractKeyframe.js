/**
 * extractKeyframe.js
 * 
 * This utility script is designed to:
 * 1. Download a video from Google Cloud Storage using gsutil
 * 2. Extract a representative keyframe from the video using ffmpeg
 * 
 * The extracted keyframe can be used as a thumbnail or preview image
 * for the video content in the SoraSpeak application.
 * 
 * Requirements:
 * - gsutil (Google Cloud Storage CLI tool)
 * - ffmpeg (Video processing library)
 */

const { exec } = require('child_process');

// Function to download video from Google Cloud Storage
function downloadVideo() {
  console.log('Starting video download...');
  
  const command = 'gsutil cp gs://soraspeak-video-bucket/Sam2.mp4 ./Sam2.mp4';
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error downloading video:', error.message);
      return;
    }
    
    if (stderr) {
      console.error('gsutil stderr:', stderr);
      return;
    }
    
    console.log('Video downloaded successfully!');
    console.log('Output:', stdout);
    
    // After successful download, extract the keyframe
    extractKeyframe();
  });
}

// Function to extract keyframe using ffmpeg
function extractKeyframe() {
  console.log('Extracting keyframe...');
  
  const command = 'ffmpeg -ss 00:00:01 -i Sam2.mp4 -frames:v 1 keyframe.jpg';
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error extracting keyframe:', error.message);
      return;
    }
    
    // ffmpeg typically outputs to stderr even on success
    if (stderr && !stderr.includes('video:')) {
      console.error('ffmpeg stderr:', stderr);
      return;
    }
    
    console.log('Keyframe extracted successfully!');
  });
}

// Execute the download
downloadVideo(); 