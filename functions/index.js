console.log("DEBUG: index.js top-level code loading...");
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");
const path = require("path"); // needed for helper functions
const os = require("os"); // needed for helper functions

// Initialize Firebase Admin SDK without explicit credentials
// When deployed, it will use the default service account
admin.initializeApp();

// Import pipeline modules
const {extractKeyframe} = require("./pipeline/extractKeyframe");
// const {analyzeKeyframe} = require("./pipeline/openaiVision");
// const {generateAudioNarration} = require("./pipeline/elevenlabsTTS");
// const {mergeVideoAndAudio} = require("./pipeline/mergeVideoAudio");

// Define secrets (keep these for now)
// eslint-disable-next-line no-unused-vars
const openaiApiKey = defineSecret("OPENAI_API_KEY");
// eslint-disable-next-line no-unused-vars
const elevenLabsApiKey = defineSecret("ELEVENLABS_API_KEY");
// eslint-disable-next-line no-unused-vars
const googleApiKey = defineSecret("GOOGLE_API_KEY");

/**
 * Downloads a video from Firebase Storage to the /tmp directory
 * @param {string} gcsUrl - The Google Cloud Storage URL
 * @return {Promise<string>} The local path where the video was downloaded
 */
// eslint-disable-next-line no-unused-vars
async function downloadVideoToTmp(gcsUrl) {
  // Parse the GCS URL to get bucket and file path
  const matches = gcsUrl.match(/gs:\/\/([^/]+)\/(.+)/);
  if (!matches) {
    throw new Error("Invalid GCS URL format");
  }

  const [, bucketName, filePath] = matches;
  const fileName = path.basename(filePath);
  const localPath = path.join(
      os.tmpdir(),
      `video-${Date.now()}-${fileName}`,
  );

  console.log("Downloading video from:", gcsUrl);
  console.log("To local path:", localPath);

  try {
    const bucket = admin.storage().bucket(bucketName);
    await bucket.file(filePath).download({
      destination: localPath,
    });

    console.log("Video downloaded successfully");
    return localPath;
  } catch (error) {
    console.error("Error downloading video:", error);
    throw error;
  }
}

/**
 * Uploads a file from /tmp to Firebase Storage
 * @param {string} localPath - Path to file in /tmp
 * @param {string} storagePath - Desired path in Storage
 * @return {Promise<string>} The gs:// URL of the uploaded file
 */
// eslint-disable-next-line no-unused-vars
async function uploadFileToStorage(localPath, storagePath) {
  console.log("Uploading file to Storage...");
  console.log("From local path:", localPath);
  console.log("To storage path:", storagePath);

  try {
    const bucket = admin.storage().bucket();
    await bucket.upload(localPath, {
      destination: storagePath,
      metadata: {
        contentType: path.extname(localPath) === ".mp4" ?
            "video/mp4" :
            "audio/mpeg",
      },
    });

    const gcsUrl = `gs://${bucket.name}/${storagePath}`;
    console.log("File uploaded successfully to:", gcsUrl);
    return gcsUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Handles the creation of a new video document in Firestore
 * @param {Object} event - The Firestore event object
 * @return {Promise<void>} A promise that resolves when the function completes
 */
exports.onVideoDocCreateNew = onDocumentCreated(
    "videos/{docId}",
    /**
     * Processes a new video document creation event
     * @param {Object} event - The Firestore event object
     * @return {Promise<void>} A promise that resolves when processing completes
     */
    async (event) => {
      console.log("DEBUG: Received event:", JSON.stringify(event, null, 2));

      try {
        // In v2, we need to access the data through event.data
        if (!event) {
          console.log("Event object is undefined");
          return;
        }

        if (!event.data) {
          console.log("Event data is undefined");
          return;
        }

        if (!event.data.data || typeof event.data.data !== "function") {
          console.log("Event data.data is not a function");
          return;
        }

        if (!event.data.ref) {
          console.log("Event data.ref is undefined");
          return;
        }

        const data = event.data.data();
        console.log("DEBUG: Document data:", data);
        console.log(
            "DEBUG: About to update document with test_triggered status",
        );

        // Update document with test status using the document reference
        const ref = event.data.ref;
        console.log("DEBUG: Document reference:", ref);

        await ref.update({
          status: "test_triggered",
          testTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("Document updated with test status");

        // Extract video URL from document data
        const videoUrl = data.url;
        if (!videoUrl) {
          console.error("No valid video URL found in doc");
          return;
        }
        console.log("DEBUG: Using video URL from document:", videoUrl);

        try {
          console.log("DEBUG: Attempting to extract keyframe using URL:", videoUrl);
          // Parse the Firebase Storage URL to get the file path
          const urlObj = new URL(videoUrl);
          const pathWithQuery = urlObj.pathname.split("/o/")[1];
          if (!pathWithQuery) {
            console.error("Invalid Firebase Storage URL format");
            return;
          }
          const filePath = decodeURIComponent(pathWithQuery.split("?")[0]);
          const bucketName = "soraspeak-86493.firebasestorage.app";

          console.log("DEBUG: Parsed file path:", filePath);
          const result = await extractKeyframe(bucketName, filePath);
          console.log("DEBUG: Result from extractKeyframe is:", result);
        } catch (error) {
          console.error("Error in extractKeyframe call:", error);
        }

        console.log(
            "DEBUG: Skipping extractKeyframe for minimal function test.",
        );
      } catch (error) {
        console.error("Error in minimal function:", error);
        console.error("Full stack trace:", error.stack);

        try {
          // Use event.data.ref for error updates
          if (event && event.data && event.data.ref) {
            console.log("DEBUG: Attempting to update error status");
            const errorRef = event.data.ref;
            await errorRef.update({
              status: "error",
              error: error.message,
              errorTimestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log("DEBUG: Error status updated successfully");
          } else {
            console.error(
                "Cannot update error status: document reference is unavailable",
            );
          }
        } catch (updateError) {
          console.error("Error while updating error status:", updateError);
        }
      }
    },
);
