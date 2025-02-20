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

console.log("DEBUG: extractKeyframe.js top-level code loading...");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const os = require("os");
const path = require("path");
const admin = require("firebase-admin");

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Extract a keyframe from a video stored in Firebase Storage
 * @param {string} bucketName - The Storage bucket name
 * @param {string} videoFilePath - Path to video in Storage
 *     (e.g., 'videos/example.mp4')
 * @return {Promise<string>} Path to extracted keyframe in /tmp
 */
async function extractKeyframe(bucketName, videoFilePath) {
  // Create unique local file paths in /tmp
  const localVideoPath = path.join(
      os.tmpdir(),
      `video-${Date.now()}.mp4`,
  );
  const localKeyframePath = path.join(
      os.tmpdir(),
      `keyframe-${Date.now()}.jpg`,
  );

  console.log("Starting keyframe extraction...");
  console.log("Video path:", videoFilePath);

  try {
    // Get bucket reference
    const bucket = admin.storage().bucket(bucketName);

    // Download video to tmp
    console.log("Downloading video to:", localVideoPath);
    await bucket.file(videoFilePath).download({
      destination: localVideoPath,
    });

    // Extract keyframe using ffmpeg
    console.log("Extracting keyframe...");
    await new Promise((resolve, reject) => {
      ffmpeg(localVideoPath)
          .screenshots({
            timestamps: ["1"],
            filename: path.basename(localKeyframePath),
            folder: path.dirname(localKeyframePath),
            size: "1280x720",
          })
          .on("end", () => {
            console.log("Keyframe extracted successfully");
            resolve();
          })
          .on("error", (err) => {
            console.error("Error extracting keyframe:", err);
            reject(err);
          });
    });

    console.log("Keyframe saved at:", localKeyframePath);
    return localKeyframePath;
  } catch (error) {
    console.error("Error in extractKeyframe:", error);
    throw error;
  }
}

module.exports = {extractKeyframe};
