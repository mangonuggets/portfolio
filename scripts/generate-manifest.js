/**
 * Image Manifest Generator
 * 
 * This script scans the images/portfolio directory and generates a JSON manifest
 * of all images organized by category. The manifest is used by the portfolio page
 * to dynamically load images based on the selected category tab.
 * 
 * It also supports custom ordering of images via the image-order.json file.
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
 * Loads custom order data from image-order.json if available
 * @returns {Object|null} Custom order data or null if not available
 */
function loadCustomOrderData() {
  try {
    const orderPath = path.join(__dirname, "..", "image-order.json");
    
    if (fs.existsSync(orderPath)) {
      console.log("Found custom order file. Loading...");
      const orderData = JSON.parse(fs.readFileSync(orderPath, "utf8"));
      return orderData;
    }
    
    return null;
  } catch (error) {
    console.error("Error loading custom order data:", error);
    return null;
  }
}

/**
 * Applies custom order to images if available
 * @param {Array} images - Array of image metadata objects
 * @param {Array} customOrder - Array of image paths in desired order
 * @returns {Array} - Sorted array of image metadata objects
 */
function applyCustomOrder(images, customOrder) {
  if (!customOrder || !Array.isArray(customOrder) || customOrder.length === 0) {
    return images;
  }
  
  // Create a map of path to order index
  const orderMap = new Map();
  customOrder.forEach((path, index) => {
    orderMap.set(path, index);
  });
  
  // Sort images based on custom order
  return [...images].sort((a, b) => {
    const orderA = orderMap.has(a.path) ? orderMap.get(a.path) : Number.MAX_SAFE_INTEGER;
    const orderB = orderMap.has(b.path) ? orderMap.get(b.path) : Number.MAX_SAFE_INTEGER;
    
    if (orderA === Number.MAX_SAFE_INTEGER && orderB === Number.MAX_SAFE_INTEGER) {
      // If neither image is in the custom order, sort by last modified date (newest first)
      return new Date(b.lastModified) - new Date(a.lastModified);
    }
    
    return orderA - orderB;
  });
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
    
    // Load custom order data if available
    const customOrderData = loadCustomOrderData();
    
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
      let images = imageFiles.map(file => generateImageMetadata(categoryDir, file));
      
      // Apply custom order if available for this category
      if (customOrderData && customOrderData.categories && customOrderData.categories[category]) {
        console.log(`Applying custom order for category "${category}"`);
        images = applyCustomOrder(images, customOrderData.categories[category]);
      } else {
        // Default sort by last modified date (newest first)
        images.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      }
      
      // Add to manifest
      manifest.categories[category] = images;
    });
    
    // Add "all" category with all images
    let allImages = Object.values(manifest.categories).flat();
    
    // Apply custom order for "all" category if available
    if (customOrderData && customOrderData.categories && customOrderData.categories.all) {
      console.log("Applying custom order for 'all' category");
      allImages = applyCustomOrder(allImages, customOrderData.categories.all);
    } else {
      // Default sort by last modified date (newest first)
      allImages.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    }
    
    manifest.categories.all = allImages;
    
    // Write manifest to file
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`Successfully generated manifest at ${manifestPath}`);
    console.log(`Total images: ${manifest.categories.all.length}`);
    
    if (customOrderData) {
      console.log("Custom order applied from image-order.json");
    }
  } catch (error) {
    console.error("Error generating manifest:", error);
  }
}

// Run the generator
generateManifest();
