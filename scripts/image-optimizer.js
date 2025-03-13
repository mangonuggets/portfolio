/**
 * Build-time Image Optimizer
 * 
 * This script optimizes images in the portfolio by:
 * 1. Converting images to modern formats (WebP, AVIF)
 * 2. Generating responsive sizes for different devices
 * 3. Compressing images for faster loading
 * 
 * Run with: node scripts/image-optimizer.js
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp"); // Requires: npm install sharp

// Configuration
const config = {
  // Source directories to process
  sourceDirs: [
    "images/portfolio",
    "images/commissions",
    "images/conventions",
    "images/featured"
  ],
  // Output directory for optimized images
  outputDir: "images/optimized",
  // Sizes to generate for responsive images
  sizes: [320, 640, 960, 1280, 1920],
  // Image formats to generate
  formats: ["webp", "avif"],
  // Quality settings (0-100)
  quality: {
    webp: 80,
    avif: 65,
    jpeg: 85
  },
  // Skip files matching these patterns
  skipPatterns: [/\.svg$/, /\.gif$/]
};

/**
 * Ensures a directory exists, creating it if necessary
 * @param {string} dir - Directory path
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

/**
 * Processes a single image file
 * @param {string} filePath - Path to the image file
 * @param {string} outputDir - Directory to save optimized images
 * @returns {Promise<Object>} - Object containing paths to optimized images
 */
async function processImage(filePath, outputDir) {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath).toLowerCase();
  const fileNameWithoutExt = path.basename(fileName, fileExt);
  
  // Skip files matching patterns in config.skipPatterns
  if (config.skipPatterns.some(pattern => pattern.test(filePath))) {
    console.log(`Skipping: ${filePath} (matched skip pattern)`);
    return null;
  }
  
  // Get relative path from source directory
  const sourceDirName = path.dirname(filePath).split(path.sep).pop();
  const relativeDir = path.dirname(filePath).split("images/")[1] || "";
  
  // Create output directory
  const imageOutputDir = path.join(outputDir, relativeDir);
  ensureDirectoryExists(imageOutputDir);
  
  // Load image with sharp
  const image = sharp(filePath);
  const metadata = await image.metadata();
  
  // Results object to track generated files
  const results = {
    original: filePath,
    optimized: {},
    metadata: {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: fs.statSync(filePath).size
    }
  };
  
  // Process each size
  for (const size of config.sizes) {
    // Skip sizes larger than the original image
    if (size > metadata.width) continue;
    
    // Calculate height to maintain aspect ratio
    const height = Math.round((size / metadata.width) * metadata.height);
    
    // Resize image
    const resized = image.clone().resize(size, height, {
      fit: "inside",
      withoutEnlargement: true
    });
    
    // Generate each format
    for (const format of config.formats) {
      const outputFileName = `${fileNameWithoutExt}-${size}.${format}`;
      const outputPath = path.join(imageOutputDir, outputFileName);
      
      try {
        // Convert and save
        await resized.toFormat(format, {
          quality: config.quality[format] || 80
        }).toFile(outputPath);
        
        // Track result
        if (!results.optimized[format]) {
          results.optimized[format] = {};
        }
        results.optimized[format][size] = {
          path: outputPath.replace(/\\/g, "/"), // Normalize path for web
          size: fs.statSync(outputPath).size
        };
        
        console.log(`Generated: ${outputPath}`);
      } catch (error) {
        console.error(`Error processing ${filePath} to ${format} at size ${size}:`, error);
      }
    }
  }
  
  return results;
}

/**
 * Recursively finds all image files in a directory
 * @param {string} dir - Directory to scan
 * @returns {string[]} - Array of image file paths
 */
function findImageFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Warning: Directory ${dir} does not exist`);
    return [];
  }
  
  const imageExtensions = [".jpg", ".jpeg", ".png"];
  let results = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Recursively scan subdirectories
      results = results.concat(findImageFiles(itemPath));
    } else if (item.isFile()) {
      // Check if file is an image
      const ext = path.extname(item.name).toLowerCase();
      if (imageExtensions.includes(ext)) {
        results.push(itemPath);
      }
    }
  }
  
  return results;
}

/**
 * Generates a manifest of optimized images
 * @param {Object[]} processedImages - Array of processed image results
 * @param {string} outputPath - Path to save the manifest
 */
function generateManifest(processedImages, outputPath) {
  const manifest = {
    generated: new Date().toISOString(),
    count: processedImages.length,
    images: processedImages.reduce((acc, img) => {
      if (img) {
        // Use the original path as the key
        const key = img.original.replace(/\\/g, "/");
        acc[key] = img;
      }
      return acc;
    }, {})
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`Generated manifest: ${outputPath}`);
}

/**
 * Main function to optimize all images
 */
async function optimizeImages() {
  console.log("Starting image optimization...");
  
  // Ensure output directory exists
  ensureDirectoryExists(config.outputDir);
  
  // Find all images in source directories
  let allImages = [];
  for (const sourceDir of config.sourceDirs) {
    const dirPath = path.join(process.cwd(), sourceDir);
    console.log(`Scanning directory: ${dirPath}`);
    const images = findImageFiles(dirPath);
    console.log(`Found ${images.length} images in ${sourceDir}`);
    allImages = allImages.concat(images);
  }
  
  console.log(`Total images to process: ${allImages.length}`);
  
  // Process all images
  const processedImages = [];
  for (let i = 0; i < allImages.length; i++) {
    const imagePath = allImages[i];
    console.log(`Processing image ${i + 1}/${allImages.length}: ${imagePath}`);
    
    try {
      const result = await processImage(imagePath, config.outputDir);
      if (result) {
        processedImages.push(result);
      }
    } catch (error) {
      console.error(`Error processing ${imagePath}:`, error);
    }
  }
  
  // Generate manifest
  const manifestPath = path.join(process.cwd(), "image-optimization-manifest.json");
  generateManifest(processedImages, manifestPath);
  
  console.log("Image optimization complete!");
  console.log(`Processed ${processedImages.length} images`);
}

// Run the optimizer
optimizeImages().catch(error => {
  console.error("Error in image optimization process:", error);
  process.exit(1);
});
