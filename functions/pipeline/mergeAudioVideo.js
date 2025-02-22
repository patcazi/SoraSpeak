const {spawn} = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");

/**
 * Merges a silent video with an audio track using ffmpeg.
 * @param {string} videoPath - Path to the original video file in /tmp
 * @param {string} audioPath - Path to the audio track in /tmp
 * @return {Promise<string>} - The local path of the merged output file
 */
async function mergeAudioVideo(videoPath, audioPath) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join("/tmp", `merged_${Date.now()}.mp4`);
    const args = [
      "-i", videoPath,
      "-i", audioPath,
      "-c:v", "copy", // copy video track
      "-c:a", "aac", // encode audio as AAC
      "-shortest", // stop at the shortest track
      outputPath,
    ];

    console.log("Spawning ffmpeg with args:", args);

    const ffmpegProcess = spawn(ffmpegPath, args);

    ffmpegProcess.stderr.on("data", (data) => {
      // ffmpeg logs to stderr by default, so we console.log it
      console.log(`ffmpeg stderr: ${data}`);
    });

    ffmpegProcess.on("error", (error) => {
      console.error("FFmpeg process error:", error);
      reject(error);
    });

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        console.log("Merging successful:", outputPath);
        if (fs.existsSync(outputPath)) {
          resolve(outputPath);
        } else {
          reject(new Error("Merged file not found"));
        }
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}

module.exports = {mergeAudioVideo};
