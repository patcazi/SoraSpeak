console.log("DEBUG: openaiVision.js top-level code loading...");
require("dotenv").config();
const OpenAI = require("openai");
const fs = require("fs").promises;

/**
 * Generate a summary of video content based on a keyframe image
 * @param {string} localKeyframePath - Path to keyframe image file in /tmp
 * @param {string} apiKey - OpenAI API key
 * @return {Promise<string>} The generated summary
 */
async function analyzeKeyframe(localKeyframePath, apiKey) {
  try {
    // Initialize OpenAI client with provided API key
    const openai = new OpenAI({apiKey});

    console.log("Generating summary from keyframe:", localKeyframePath);

    // Read the image file
    const imageBuffer = await fs.readFile(localKeyframePath);
    // Convert to base64
    const base64Image = imageBuffer.toString("base64");
    // Format as data URL
    const imageInput = `data:image/jpeg;base64,${base64Image}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Generate a brief, first-person narrative from the " +
                  "perspective of a woman on a farm. Keep it to 2–3 " +
                  "sentences and focus on the simple joys of southern, " +
                  "rural life—highlighting natural beauty and the warmth " +
                  "of a close-knit community—in a friendly, upbeat tone. " +
                  "The narrative should be short enough to fit into an " +
                  "8‑second video",
            },
            {
              type: "image_url",
              image_url: {url: imageInput},
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const summary = response.choices[0].message.content;
    console.log("Summary generated successfully:", summary);

    return summary;
  } catch (error) {
    console.error("Error generating summary:", error.message);
    throw error;
  }
}

module.exports = {analyzeKeyframe};
