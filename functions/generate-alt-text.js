/**
 * AI-Powered Alt Text Generator
 * 
 * This Netlify function uses AI to generate descriptive alt text for images.
 * It can be called from the client side to enhance accessibility and SEO.
 * 
 * Environment variables required:
 * - OPENAI_API_KEY: API key for OpenAI
 */

const fetch = require('node-fetch');

/**
 * Generates alt text for an image using OpenAI's Vision API
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Promise<string>} - Generated alt text
 */
async function generateAltTextWithOpenAI(imageUrl) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Generate a concise, descriptive alt text for this image. Focus on the main subject, style, colors, and mood. Keep it under 100 characters. Don't use phrases like 'an image of' or 'a picture of'."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 100
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating alt text:', error);
    throw error;
  }
}

/**
 * Netlify function handler
 */
exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { imageUrl } = body;
    
    if (!imageUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing imageUrl parameter' })
      };
    }
    
    // Generate alt text
    const altText = await generateAltTextWithOpenAI(imageUrl);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ altText })
    };
  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
