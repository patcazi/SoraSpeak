/**
 * mergeVideoAudio.js
 *
 * This module uses fluent-ffmpeg along with ffmpeg-static to merge an original
 * video with generated audio narration into a final output video file.
 */

console.log("DEBUG: mergeVideoAudio.js top-level code loading...");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const os = require("os");
const path = require("path");

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Merge a video file with an audio narration
 * @param {string} videoPath - Path to the input video file in /tmp
 * @param {string} audioPath - Path to the audio narration file in /tmp
 * @return {Promise<string>} Path to the merged output video in /tmp
 */
async function mergeVideoAndAudio(videoPath, audioPath) {
  const outputPath = path.join(os.tmpdir(), `merged-${Date.now()}.mp4`);

  console.log("Starting video/audio merge...");
  console.log("Video path:", videoPath);
  console.log("Audio path:", audioPath);
  console.log("Output path:", outputPath);

  return new Promise((resolve, reject) => {
    ffmpeg()
        .input(videoPath)
        .input(audioPath)
    // Keep original video stream
        .videoCodec("copy")
    // Re-encode audio stream
        .audioCodec("aac")
    // Map both streams to output
        .outputOptions([
          "-map 0:v:0", // First video stream from input
          "-map 1:a:0", // First audio stream from second input
        ])
        .save(outputPath)
        .on("end", () => {
          console.log("Merge completed successfully");
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error("Error during merge:", err);
          reject(err);
        })
        .on("progress", (progress) => {
          console.log("Processing: ", progress.percent, "% done");
        });
  });
}

module.exports = {mergeVideoAndAudio};
