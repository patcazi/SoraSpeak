// src/api/googleVideoIntelligence.js

console.log("DEBUG: googleVideoIntelligence.js top-level code loading...");
const videoIntelligence = require("@google-cloud/video-intelligence");

/**
 * This module integrates with the Google Cloud Video Intelligence API
 * to analyze video content and extract meaningful insights about the
 * video's content.
 */

/**
 * Annotate a video using label detection.
 * @param {string} gcsUri - The Google Cloud Storage URI of the video
 * @param {string} apiKey - Google Cloud API key
 * @return {Promise<Object>} The video analysis results
 */
async function annotateVideo(gcsUri, apiKey) {
  // Create client with provided API key
  const client = new videoIntelligence.VideoIntelligenceServiceClient({
    credentials: {apiKey},
  });

  // Construct request
  const request = {
    inputUri: gcsUri,
    features: ["LABEL_DETECTION"],
  };

  console.log("Starting video annotation request for:", gcsUri);

  try {
    // Make the request to annotate the video
    const [operation] = await client.annotateVideo(request);
    console.log("Operation started... Waiting for results.");

    // Wait for the operation to complete
    const [operationResult] = await operation.promise();
    console.log("Annotation completed.");

    return operationResult.annotationResults[0];
  } catch (error) {
    console.error("Error during video annotation:", error);
    throw error;
  }
}

// Export the function for use in other modules
module.exports = {annotateVideo};
