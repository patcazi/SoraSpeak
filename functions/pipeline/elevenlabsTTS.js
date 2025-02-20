console.log("DEBUG: elevenlabsTTS.js top-level code loading...");
const axios = require("axios");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");

/**
 * elevenlabsTTS.js
 *
 * This module integrates with the ElevenLabs Text-to-Speech API to convert text
 * summaries into natural, high-quality audio narration. It uses the
 * ELEVENLABS_API_KEY from the environment for authentication and supports
 * configuration for model selection, voice settings, and output format.
 */

/**
 * Generate audio narration from text using ElevenLabs API
 * @param {string} text - The text to convert to speech
 * @param {string} apiKey - ElevenLabs API key
 * @return {Promise<string>} Path to the generated audio file in /tmp
 */
async function generateAudioNarration(text, apiKey) {
  const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Default voice: Rachel
  const MODEL_ID = "eleven_monolingual_v1";

  const outputPath = path.join(os.tmpdir(), `narration-${Date.now()}.mp3`);

  console.log("Generating audio narration for text:", text);

  try {
    const response = await axios({
      method: "POST",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      data: {
        text: text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      responseType: "arraybuffer",
    });

    // Write the audio buffer to a temporary file
    await fs.writeFile(outputPath, response.data);
    console.log("Audio file saved to:", outputPath);

    return outputPath;
  } catch (error) {
    console.error("Error generating audio:", error.message);
    throw error;
  }
}

module.exports = {generateAudioNarration};
