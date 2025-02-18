require('dotenv').config();

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a summary of video content based on a keyframe image
 * @param {string} imageInput - URL or Base64 string of the image
 * @returns {Promise<string>} The generated summary
 */
async function generateImageSummary(imageInput) {
  try {
    console.log('Generating summary from image...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Based on this image, generate a warm, upbeat first-person narrative from the perspective of the woman in the video. Focus on the joys and benefits of farm life and small-town living. The tone should be cheerful and personal, highlighting the emotional connection to rural life, community, and nature. Make it sound authentic and heartfelt, as if she\'s sharing her genuine love for this lifestyle.'
            },
            {
              type: 'image_url',
              image_url: { url: imageInput }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const summary = response.choices[0].message.content;
    console.log('Summary generated successfully:');
    console.log(summary);
    
    return summary;

  } catch (error) {
    console.error('Error generating summary:', error.message);
    throw error;
  }
}

async function testGenerateImageSummary() {
  try {
    // Read the keyframe image from disk
    const imagePath = path.resolve(__dirname, '../../keyframe.jpg');
    const imageBuffer = fs.readFileSync(imagePath);
    // Convert the image buffer to a Base64 string
    const base64Image = imageBuffer.toString('base64');
    // Format the Base64 string as a data URL (assuming JPEG format)
    const imageInput = `data:image/jpeg;base64,${base64Image}`;
    
    // Call generateImageSummary with the Base64 image input
    const summary = await generateImageSummary(imageInput);
    console.log('Test summary output:', summary);
  } catch (error) {
    console.error('Error during testGenerateImageSummary:', error);
  }
}

// Execute the test function
testGenerateImageSummary();

module.exports = { generateImageSummary }; 