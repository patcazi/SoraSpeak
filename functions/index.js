console.log("DEBUG: index.js top-level code loading...");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");
// const path = require("path");  // commented out
// const os = require("os");      // commented out

admin.initializeApp();

// Comment out pipeline imports for testing
// const {extractKeyframe} = require("./pipeline/extractKeyframe");
// const {analyzeKeyframe} = require("./pipeline/openaiVision");
// const {generateAudioNarration} = require("./pipeline/elevenlabsTTS");
// const {mergeVideoAndAudio} = require("./pipeline/mergeVideoAudio");

// Define secrets (keep these for now)
const openaiApiKey = defineSecret("OPENAI_API_KEY");
const elevenLabsApiKey = defineSecret("ELEVENLABS_API_KEY");
const googleApiKey = defineSecret("GOOGLE_API_KEY");

// Removed downloadVideoToTmp function
// Removed uploadFileToStorage function

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
