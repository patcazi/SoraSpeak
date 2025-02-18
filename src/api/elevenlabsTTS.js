require('dotenv').config();

/**
 * elevenlabsTTS.js
 *
 * This module integrates with the ElevenLabs Text-to-Speech API to convert text summaries
 * into natural, high-quality audio narration. It uses the ELEVENLABS_API_KEY from the environment
 * for authentication and supports configuration for model selection, voice settings, and output format.
 */

const axios = require('axios');
const fs = require('fs').promises;

/**
 * Generate audio narration from text using ElevenLabs TTS API
 * @param {string} text - The text to convert to speech
 * @param {Object} options - Optional parameters for voice settings
 * @param {string} options.voiceId - The ID of the voice to use (defaults to 'cnBQHhIu4qkkTEV5m18G')
 * @param {string} options.modelId - The ID of the model to use (defaults to 'eleven_multilingual_v2')
 * @returns {Promise<string>} Path to the generated audio file
 */
async function generateAudioNarration(text, options = {}) {
  const {
    voiceId = 'cnBQHhIu4qkkTEV5m18G', // Custom voice
    modelId = 'eleven_multilingual_v2'
  } = options;

  console.log('Generating audio narration...');

  try {
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      responseType: 'arraybuffer'
    });

    // Save the audio file
    const outputPath = './output.mp3';
    await fs.writeFile(outputPath, response.data);
    
    console.log('Audio narration generated successfully!');
    console.log('Saved to:', outputPath);
    
    return outputPath;

  } catch (error) {
    console.error('Error generating audio narration:', 
      error.response?.data ? JSON.stringify(error.response.data) : error.message);
    throw error;
  }
}

// Test the audio generation with a sample video summary
const sampleSummary = `Hey y'all, it's a beautiful day on the farm! I love the warm sun on my skin, the gentle chirping of birds, and the sense of community that makes every day an adventure. Waking up to roosters crowing and the soft hum of the tractor reminds me how blessed I am to call this place home.`;

console.log('Starting test with sample summary:', sampleSummary);

generateAudioNarration(sampleSummary, {
  modelId: 'eleven_multilingual_v2',
  voiceId: 'cnBQHhIu4qkkTEV5m18G' // Custom voice
})
  .then(outputPath => {
    console.log('Test completed successfully. Audio file saved at:', outputPath);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });

module.exports = { generateAudioNarration }; 