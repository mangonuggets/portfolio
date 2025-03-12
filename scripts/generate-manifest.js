/**
 * Image Manifest Generator
 * 
 * This script scans the images/portfolio directory and generates a JSON manifest
 * of all images organized by category. The manifest is used by the portfolio page
 * to dynamically load images based on the selected category tab.
 */

const fs = require("fs");
const path = require("path");

/**
 * Scans a directory for image files
 * @param {string} dir - Directory path to scan
 * @returns {string[]} - Array of image file paths
 */
function getImageFiles(dir) {
  try {
    // Check if directory exists
    if (!fs.existsSync(dir)) {
      console.warn(`Warning: Directory ${dir} does not exist`);
      return [];
    }

    // Get all files in the directory
    const files = fs.readdirSync(dir);
    
    // Filter for image files (jpg, jpeg, png, gif, webp)
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    return imageFiles;
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

/**
 * Generates image metadata for a file
 * @param {string} categoryDir - Category directory path
 * @param {string} filename - Image filename
 * @returns {Object} - Image metadata object
 */
function generateImageMetadata(categoryDir, filename) {
  const filePath = path.join(categoryDir, filename);
  const stats = fs.statSync(filePath);
  
  // Extract title from filename (remove extension and replace dashes/underscores with spaces)
  const title = path.basename(filename, path.extname(filename))
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  
  return {
    filename: filename,
    path: `images/portfolio/${path.basename(categoryDir)}/${filename}`,
    title: title,
    type: path.basename(categoryDir).charAt(0).toUpperCase() + path.basename(categoryDir).slice(1),
    lastModified: stats.mtime
  };
}

/**
 * Main function to generate the image manifest
 */
function generateManifest() {
  const portfolioDir = path.join(__dirname, "..", "images", "portfolio");
  const manifestPath = path.join(__dirname, "..", "image-manifest.json");
  
  console.log("Scanning portfolio images directory...");
  
  try {
    // Check if portfolio directory exists
    if (!fs.existsSync(portfolioDir)) {
      console.error(`Error: Portfolio directory ${portfolioDir} does not exist`);
      return;
    }
    
    // Get all category directories
    const categories = fs.readdirSync(portfolioDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`Found ${categories.length} categories: ${categories.join(", ")}`);
    
    // Initialize manifest object
    const manifest = {
      categories: {},
      lastUpdated: new Date().toISOString()
    };
    
    // Process each category
    categories.forEach(category => {
      const categoryDir = path.join(portfolioDir, category);
      const imageFiles = getImageFiles(categoryDir);
      
      console.log(`Category "${category}": Found ${imageFiles.length} images`);
      
      // Generate metadata for each image
      const images = imageFiles.map(file => generateImageMetadata(categoryDir, file));
      
      // Add to manifest
      manifest.categories[category] = images;
    });
    
    // Add "all" category with all images
    manifest.categories.all = Object.values(manifest.categories)
      .flat()
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    // Write manifest to file
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`Successfully generated manifest at ${manifestPath}`);
    console.log(`Total images: ${manifest.categories.all.length}`);
  } catch (error) {
    console.error("Error generating manifest:", error);
  }
}

// Run the generator
generateManifest();
