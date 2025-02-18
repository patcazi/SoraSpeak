/**
 * mergeVideoAudio.js
 *
 * This module uses fluent-ffmpeg along with ffmpeg-static to merge an original video
 * (SamOG.mp4) with generated audio narration (output.mp3) into a final output video file (finalOutput.mp4).
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

// Set the ffmpeg path to the precompiled binary provided by ffmpeg-static
ffmpeg.setFfmpegPath(ffmpegPath);

// Define input and output file paths
const videoPath = path.resolve('/Users/patriceazi/iCloud Drive/Desktop/Samantha/SamOG.mp4');
const audioPath = path.resolve(__dirname, '../../output.mp3');
const outputPath = path.resolve(__dirname, '../../finalOutput.mp4');

/**
 * Merge video and audio files into a single output video
 * @returns {Promise<string>} Path to the merged output file
 */
function mergeVideoAndAudio() {
  console.log('Starting video and audio merge process...');
  console.log('Video path:', videoPath);
  console.log('Audio path:', audioPath);
  
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      // Preserve video codec, encode audio to AAC
      .outputOptions([
        '-c:v copy',
        '-c:a aac',
        '-strict experimental',
        '-map 0:v:0',  // take video from first input
        '-map 1:a:0'   // take audio from second input
      ])
      .save(outputPath)
      .on('progress', (progress) => {
        console.log('Processing: ', progress.percent ? `${Math.floor(progress.percent)}%` : 'Starting...');
      })
      .on('end', () => {
        console.log('Merging completed successfully!');
        console.log('Final output saved at:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Error during merging:', err.message);
        reject(err);
      });
  });
}

// Execute the merge process
mergeVideoAndAudio()
  .then(outputPath => {
    console.log('Process completed. Output file:', outputPath);
  })
  .catch(error => {
    console.error('Process failed:', error);
    process.exit(1);
  });

module.exports = { mergeVideoAndAudio }; 