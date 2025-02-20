console.log("DEBUG: index.js top-level code loading...");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");
// const path = require("path"); // needed for helper functions
// const os = require("os"); // needed for helper functions

admin.initializeApp();

// Import pipeline modules
const {extractKeyframe} = require("./pipeline/extractKeyframe");
// const {analyzeKeyframe} = require("./pipeline/openaiVision");
// const {generateAudioNarration} = require("./pipeline/elevenlabsTTS");
// const {mergeVideoAndAudio} = require("./pipeline/mergeVideoAudio");

// Define secrets (keep these for now)
const openaiApiKey = defineSecret("OPENAI_API_KEY");
const elevenLabsApiKey = defineSecret("ELEVENLABS_API_KEY");
const googleApiKey = defineSecret("GOOGLE_API_KEY");

/*
 * Downloads a video from Firebase Storage to the /tmp directory
 * @param {string} gcsUrl - The Google Cloud Storage URL (gs://bucket/path/to/video.mp4)
 * @return {Promise<string>} The local path where the video was downloaded
 */
// async function downloadVideoToTmp(gcsUrl) {
//   // Parse the GCS URL to get bucket and file path
//   const matches = gcsUrl.match(/gs:\/\/([^/]+)\/(.+)/);
//   if (!matches) {
//     throw new Error("Invalid GCS URL format");
//   }
//
//   const [, bucketName, filePath] = matches;
//   const fileName = path.basename(filePath);
//   const localPath = path.join(
//       os.tmpdir(),
//       `video-${Date.now()}-${fileName}`,
//   );
//
//   console.log("Downloading video from:", gcsUrl);
//   console.log("To local path:", localPath);
//
//   try {
//     const bucket = admin.storage().bucket(bucketName);
//     await bucket.file(filePath).download({
//       destination: localPath,
//     });
//
//     console.log("Video downloaded successfully");
//     return localPath;
//   } catch (error) {
//     console.error("Error downloading video:", error);
//     throw error;
//   }
// }

/*
 * Uploads a file from /tmp to Firebase Storage
 * @param {string} localPath - Path to file in /tmp
 * @param {string} storagePath - Desired path in Storage
 *     (e.g., 'videos/final/xyz.mp4')
 * @return {Promise<string>} The gs:// URL of the uploaded file
 */
// async function uploadFileToStorage(localPath, storagePath) {
//   console.log("Uploading file to Storage...");
//   console.log("From local path:", localPath);
//   console.log("To storage path:", storagePath);
//
//   try {
//     const bucket = admin.storage().bucket();
//     await bucket.upload(localPath, {
//       destination: storagePath,
//       metadata: {
//         contentType: path.extname(localPath) === ".mp4" ?
//             "video/mp4" :
//             "audio/mpeg",
//       },
//     });
//
//     const gcsUrl = `gs://${bucket.name}/${storagePath}`;
//     console.log("File uploaded successfully to:", gcsUrl);
//     return gcsUrl;
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     throw error;
//   }
// }

exports.onVideoDocCreate = onDocumentCreated(
    {
      secrets: [openaiApiKey, elevenLabsApiKey, googleApiKey],
      memory: "512Mi",
      timeoutSeconds: 540,
    },
    "videos/{docId}",
    async (event) => {
      const snap = event.data;
      const data = snap.data();
      console.log("DEBUG: minimal function triggered!");
      console.log("Document data:", data);

      try {
        // Update document with test status
        await snap.ref.update({
          status: "test_triggered",
          testTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("Document updated with test status");

        console.log("DEBUG: Attempting to extract keyframe...");
        const result = await extractKeyframe("https://firebasestorage.googleapis.com/v0/b/soraspeak-86493.firebasestorage.app/o/videos%2Foutput.mp4?alt=media&token=d11ef25f-3f1c-4117-821d-378fbfae196d");
        console.log("Keyframe extraction result:", result);
      } catch (error) {
        console.error("Error in minimal function:", error);
        await snap.ref.update({
          status: "error",
          error: error.message,
          errorTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    },
);
