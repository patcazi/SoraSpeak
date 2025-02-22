const {ElevenLabsClient} = require("elevenlabs");
const fs = require("fs");
const path = require("path");

/**
 * Generates text-to-speech audio from the provided text
 * @param {string} text - The text to convert to speech
 * @return {Promise<string>} The path to the generated audio file
 */
async function generateTTS(text) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ELEVENLABS_API_KEY not found in environment variables!");
    }

    // Instantiate the ElevenLabs client with our API key
    const client = new ElevenLabsClient({apiKey});

    // The convert() call returns a stream-like object
    // in the latest library versions
    const audioStream = await client.textToSpeech.convert(
        "cnBQHhIu4qkkTEV5m18G", // southern US female voice
        {
          text, // The text we want spoken
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.3,
            similarity_boost: 0.75,
          },
        },
    );

    // Convert the stream to a Buffer
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Write the resulting audio to a temp file
    const tempFilename = `tts_${Date.now()}.mp3`;
    const localFilePath = path.join("/tmp", tempFilename);
    fs.writeFileSync(localFilePath, audioBuffer);

    console.log("Successfully generated TTS audio at:", localFilePath);
    return localFilePath;
  } catch (error) {
    console.error("Error generating TTS:", error);
    throw error;
  }
}

module.exports = {generateTTS};
