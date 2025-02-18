// index.js

// Load environment variables from .env file
require('dotenv').config();

// Log the API keys (for testing purposes; avoid logging in production)
console.log("Google API Key:", process.env.GOOGLE_API_KEY);
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);
console.log("ElevenLabs API Key:", process.env.ELEVENLABS_API_KEY);