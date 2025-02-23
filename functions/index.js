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
const {analyzeKeyframe} = require("./pipeline/openaiVision");
const {generateTTS} = require("./pipeline/elevenlabsTTS");
const {mergeAudioVideo} = require("./pipeline/mergeAudioVideo");

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
    {
      document: "videos/{docId}",
      secrets: [openaiApiKey, elevenLabsApiKey],
      region: "us-central1",
      cpu: 1,
      memory: "1GiB", // Standard memory allocation
    },
    /**
     * Processes a new video document creation event
     * @param {Object} event - The Firestore event object
     * @return {Promise<void>} A promise that resolves when processing completes
     */
    async (event) => {
      console.log("DEBUG: Received event:", JSON.stringify(event, null, 2));
      console.log("Function sees doc ID:", event.data.id);

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
        console.log("DEBUG: About to update document with test_triggered status");
        console.log("About to update doc ID:", event.data.id);

        // Update document with test status using the document reference
        const ref = event.data.ref;
        console.log("DEBUG: Document reference:", ref);

        await ref.update({
          status: "test_triggered",
          testTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("Updated doc ID:", event.data.id);
        console.log("Document updated with test status");

        // Extract video URL from document data
        const videoUrl = data.url;
        if (!videoUrl) {
          console.error("No valid video URL found in doc");
          return;
        }
        console.log("DEBUG: Using video URL from document:", videoUrl);

        try {
          // Convert Firebase Storage URL to GCS format
          const urlObj = new URL(videoUrl);
          const pathWithQuery = urlObj.pathname.split("/o/")[1];
          if (!pathWithQuery) {
            console.error("Invalid Firebase Storage URL format");
            return;
          }
          const filePath = decodeURIComponent(pathWithQuery.split("?")[0]);
          const bucketName = "soraspeak-86493.firebasestorage.app";
          const gcsUrl = `gs://${bucketName}/${filePath}`;
          console.log("DEBUG: Converted to GCS URL:", gcsUrl);

          // Download the video to /tmp
          const localVideoPath = await downloadVideoToTmp(gcsUrl);
          console.log("DEBUG: Downloaded video to:", localVideoPath);

          console.log("DEBUG: Attempting to extract keyframe using URL:", videoUrl);
          const result = await extractKeyframe(bucketName, filePath);
          console.log("DEBUG: Result from extractKeyframe is:", result);

          // Use OpenAI to analyze the keyframe and generate a narrative
          if (result && result.localPath) {
            console.log("DEBUG: Attempting to analyze keyframe with OpenAI");
            const userContext = data.context || "";
            console.log("DEBUG: User context:", userContext);
            const narrative = await analyzeKeyframe(result.localPath, process.env.OPENAI_API_KEY, userContext);
            console.log("DEBUG: Generated narrative from OpenAI:", narrative);

            // Update Firestore with the narrative text
            await ref.update({
              openAI_narrative: narrative,
              openAI_narrative_timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log("DEBUG: Updated document with OpenAI narrative");

            // Generate TTS from the narrative
            try {
              console.log("Generating TTS for:", narrative);
              const localAudioPath = await generateTTS(narrative);
              console.log("Local TTS file path:", localAudioPath);

              // Merge video (localVideoPath) with the TTS audio (localAudioPath)
              const mergedVideoPath = await mergeAudioVideo(localVideoPath, localAudioPath);
              console.log("DEBUG: Merged video path:", mergedVideoPath);

              try {
                console.log("Uploading merged video to storage...");
                await uploadFileToStorage(mergedVideoPath, "videos/merged/finalMerged.mp4");
                console.log("Uploaded merged video to storage successfully!");

                // Generate a signed URL for the merged video
                const bucket = admin.storage().bucket();
                const mergedFile = bucket.file("videos/merged/finalMerged.mp4");
                const [signedUrl] = await mergedFile.getSignedUrl({
                  action: "read",
                  expires: Date.now() + (1000 * 60 * 60 * 24), // valid for 24 hours
                });
                console.log("Merged video signed URL:", signedUrl);

                await ref.update({
                  mergedVideoUrl: signedUrl,
                  mergedVideoTimestamp: admin.firestore.FieldValue.serverTimestamp(),
                });
                console.log("Updated document with merged video URL");
              } catch (err) {
                console.error("Error uploading merged video to storage:", err);
              }

              try {
                // Store this file in a folder named 'ttsAudio' in our bucket
                await uploadFileToStorage(localAudioPath, "ttsAudio/finalNarration.mp3");
                console.log("TTS file uploaded successfully");
              } catch (err) {
                console.error("Failed to upload TTS file:", err);
              }
            } catch (ttsError) {
              console.error("Error generating TTS:", ttsError);
              // Optionally update Firestore with error info
            }
          } else {
            console.error("No valid keyframe path found in extractKeyframe result");
          }
        } catch (error) {
          console.error("Error in extractKeyframe or OpenAI analysis:", error);
        }
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
