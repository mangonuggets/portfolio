/**
 * AI Utilities
 * 
 * This module provides AI-powered utilities for enhancing the portfolio website.
 * It includes functions for generating alt text, analyzing images, and more.
 */

/**
 * Generates alt text for an image using AI
 * 
 * @param {string} imageUrl - URL of the image to analyze
 * @param {Function} callback - Callback function to receive the generated alt text
 * @param {Function} errorCallback - Callback function for error handling
 */
async function generateAltText(imageUrl, callback, errorCallback) {
  try {
    // Ensure the image URL is absolute
    const absoluteUrl = new URL(imageUrl, window.location.origin).toString();
    
    // Call the Netlify function
    const response = await fetch('/.netlify/functions/generate-alt-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl: absoluteUrl })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate alt text');
    }
    
    const data = await response.json();
    
    if (callback && typeof callback === 'function') {
      callback(data.altText);
    }
    
    return data.altText;
  } catch (error) {
    console.error('Error generating alt text:', error);
    
    if (errorCallback && typeof errorCallback === 'function') {
      errorCallback(error);
    }
    
    return null;
  }
}

/**
 * Enhances all images on the page with AI-generated alt text
 * Only processes images that don't already have meaningful alt text
 * 
 * @param {string} selector - CSS selector for images to enhance
 * @param {Object} options - Configuration options
 * @param {boolean} [options.force=false] - Whether to force generation even if alt text exists
 * @param {boolean} [options.async=true] - Whether to process images asynchronously
 * @param {Function} [options.onComplete] - Callback when all images are processed
 */
function enhanceImagesWithAltText(selector = 'img:not([data-no-ai-alt])', options = {}) {
  const defaultOptions = {
    force: false,
    async: true,
    onComplete: null
  };
  
  const settings = { ...defaultOptions, ...options };
  const images = document.querySelectorAll(selector);
  let processedCount = 0;
  
  if (images.length === 0) {
    if (settings.onComplete) {
      settings.onComplete(0);
    }
    return;
  }
  
  // Process each image
  images.forEach(img => {
    // Skip images that already have meaningful alt text
    if (!settings.force && img.alt && img.alt.length > 5 && img.alt !== img.src) {
      processedCount++;
      if (processedCount === images.length && settings.onComplete) {
        settings.onComplete(processedCount);
      }
      return;
    }
    
    // Skip images without src
    if (!img.src) {
      processedCount++;
      if (processedCount === images.length && settings.onComplete) {
        settings.onComplete(processedCount);
      }
      return;
    }
    
    // Add loading indicator
    img.classList.add('ai-alt-processing');
    
    // Generate alt text
    generateAltText(
      img.src,
      (altText) => {
        // Update alt text
        img.alt = altText;
        img.setAttribute('data-ai-alt', 'true');
        img.classList.remove('ai-alt-processing');
        
        // Track progress
        processedCount++;
        if (processedCount === images.length && settings.onComplete) {
          settings.onComplete(processedCount);
        }
      },
      (error) => {
        // Handle error
        console.warn(`Failed to generate alt text for ${img.src}:`, error);
        img.classList.remove('ai-alt-processing');
        
        // Track progress
        processedCount++;
        if (processedCount === images.length && settings.onComplete) {
          settings.onComplete(processedCount);
        }
      }
    );
  });
}

/**
 * Analyzes an image and returns information about its content
 * 
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeImage(imageUrl) {
  try {
    // This is a placeholder for future implementation
    // Could use AI services to analyze image content, colors, style, etc.
    console.warn('Image analysis not yet implemented');
    return {
      success: false,
      message: 'Image analysis not yet implemented'
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Finds visually similar images in the portfolio
 * 
 * @param {string} imageUrl - URL of the reference image
 * @param {number} [limit=5] - Maximum number of similar images to return
 * @returns {Promise<Array>} - Array of similar image URLs
 */
async function findSimilarImages(imageUrl, limit = 5) {
  try {
    // This is a placeholder for future implementation
    // Could use AI services to find visually similar images
    console.warn('Similar image search not yet implemented');
    return {
      success: false,
      message: 'Similar image search not yet implemented'
    };
  } catch (error) {
    console.error('Error finding similar images:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export functions for use in other scripts
window.aiUtilities = {
  generateAltText,
  enhanceImagesWithAltText,
  analyzeImage,
  findSimilarImages
};

// Add CSS for AI processing indicators
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .ai-alt-processing {
      position: relative;
    }
    .ai-alt-processing::after {
      content: "AI";
      position: absolute;
      bottom: 5px;
      right: 5px;
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      font-size: 10px;
      padding: 2px 4px;
      border-radius: 3px;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
});
