// src/api/googleVideoIntelligence.js

const videoIntelligence = require('@google-cloud/video-intelligence');

// Creates a client. Make sure the GOOGLE_APPLICATION_CREDENTIALS environment variable
// is set to the path of your service account key file when you're ready to test.
const client = new videoIntelligence.VideoIntelligenceServiceClient();

/**
 * Annotate a video using label detection.
 * @param {string} gcsUri - The Google Cloud Storage URI of the video (e.g., gs://your-bucket/your-video.mp4)
 */
async function annotateVideo(gcsUri) {
  // Construct request
  const request = {
    inputUri: gcsUri,
    features: ['LABEL_DETECTION'],
  };

  console.log('Starting video annotation request for:', gcsUri);

  try {
    // Make the request to annotate the video
    const [operation] = await client.annotateVideo(request);
    console.log('Operation started... Waiting for results.');

    // Wait for the operation to complete
    const [operationResult] = await operation.promise();
    console.log('Annotation completed.');

    const annotations = operationResult.annotationResults;
    if (annotations && annotations.length > 0) {
      const labels = annotations[0].segmentLabelAnnotations;
      console.log('Detected Labels:');
      labels.forEach(label => {
        console.log(`Description: ${label.entity.description}, Confidence: ${label.segments[0].confidence}`);
      });
    } else {
      console.log('No annotations found.');
    }
  } catch (error) {
    console.error('Error during video annotation:', error);
  }
}

// Export the function for use in other modules
module.exports = { annotateVideo };

// Test the video intelligence API
annotateVideo('gs://soraspeak-video-bucket/SamOG.mp4')
  .then(() => console.log('Test completed.'))
  .catch(console.error);