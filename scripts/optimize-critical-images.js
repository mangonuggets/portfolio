#!/usr/bin/env node

/**
 * Critical Image Optimizer
 * 
 * This script directly optimizes the images that are currently being loaded on the site
 * for better mobile and desktop performance. It creates multiple sizes and formats
 * (WebP and AVIF) for each image.
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration for image optimization
const OPTIMIZATION_CONFIG = {
  // Sizes to generate for responsive images
  sizes: [320, 640, 960, 1280, 1920],
  
  // Formats to generate
  formats: ['webp', 'avif'],
  
  // Quality settings
  quality: {
    webp: 85,
    avif: 80,
    jpeg: 85
  },
  
  // Output directory
  outputDir: 'images/optimized'
};

// Critical images that need optimization (currently loaded on the site)
const CRITICAL_IMAGES = [
  // Profile image (index.html)
  {
    input: 'images/profile/profile.jpg',
    name: 'profile',
    priority: 'high',
    sizes: [300, 400, 600] // Smaller sizes for profile
  },
  
  // Featured images (index.html)
  {
    input: 'images/portfolio/illustration/iky.jpg',
    name: 'iky',
    priority: 'high'
  },
  {
    input: 'images/featured/Illustration.jpg',
    name: 'featured-illustration',
    priority: 'high'
  },
  {
    input: 'images/portfolio/illustration/sana.jpg',
    name: 'sana',
    priority: 'high'
  },
  {
    input: 'images/portfolio/illustration/nyfuuka.jpg',
    name: 'nyfuuka',
    priority: 'high'
  },
  
  // Logo/favicon
  {
    input: 'images/logo/emote2.png',
    name: 'logo',
    priority: 'high',
    sizes: [16, 32, 64, 128, 256] // Icon sizes
  },
  
  // Large convention images that need optimization
  {
    input: 'images/conventions/current/stamp-rally/20250109_091246.jpg',
    name: '20250109_091246',
    priority: 'medium'
  },
  {
    input: 'images/conventions/past/akimatsuri2024.jpg',
    name: 'akimatsuri2024',
    priority: 'medium'
  },
  {
    input: 'images/conventions/past/ala2025.jpg',
    name: 'ala2025',
    priority: 'medium'
  },
  {
    input: 'images/conventions/past/anirevo2024.jpg',
    name: 'anirevo2024',
    priority: 'medium'
  }
];

// Images that have empty optimization objects in the manifest
const MISSING_OPTIMIZED_IMAGES = [
  'images/portfolio/chibi/aro.png',
  'images/portfolio/chibi/doki.png',
  'images/portfolio/chibi/fri.png',
  'images/portfolio/chibi/Illustration.png',
  'images/portfolio/chibi/kaz.png',
  'images/portfolio/chibi/mao.png',
  'images/portfolio/chibi/mari.png',
  'images/portfolio/chibi/pla.png',
  'images/portfolio/chibi/reisa.png',
  'images/portfolio/emotes/0777.png'
];

/**
 * Ensures the output directory exists
 */
async function ensureOutputDir() {
  try {
    await fs.access(OPTIMIZATION_CONFIG.outputDir);
  } catch {
    await fs.mkdir(OPTIMIZATION_CONFIG.outputDir, { recursive: true });
  }
}

/**
 * Gets image metadata
 */
async function getImageMetadata(inputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: (await fs.stat(inputPath)).size
    };
  } catch (error) {
    console.error(`Error getting metadata for ${inputPath}:`, error.message);
    return null;
  }
}

/**
 * Optimizes a single image to multiple formats and sizes
 */
async function optimizeImage(imageConfig) {
  const { input, name, sizes: customSizes } = imageConfig;
  
  console.log(`\n🖼️  Optimizing: ${input}`);
  
  try {
    // Check if input file exists
    await fs.access(input);
  } catch {
    console.error(`❌ Input file not found: ${input}`);
    return null;
  }
  
  const metadata = await getImageMetadata(input);
  if (!metadata) return null;
  
  console.log(`   📏 Original: ${metadata.width}x${metadata.height} (${(metadata.size / 1024 / 1024).toFixed(2)}MB)`);
  
  // Use custom sizes if provided, otherwise use default sizes
  const sizesToGenerate = customSizes || OPTIMIZATION_CONFIG.sizes;
  
  // Filter sizes to not exceed original width
  const validSizes = sizesToGenerate.filter(size => size <= metadata.width);
  
  const results = {
    original: input,
    optimized: {},
    metadata
  };
  
  // Generate optimized versions for each format and size
  for (const format of OPTIMIZATION_CONFIG.formats) {
    results.optimized[format] = {};
    
    for (const size of validSizes) {
      const outputFilename = `${name}-${size}.${format}`;
      const outputPath = path.join(OPTIMIZATION_CONFIG.outputDir, outputFilename);
      
      try {
        let sharpInstance = sharp(input)
          .resize(size, null, {
            withoutEnlargement: true,
            fit: 'inside'
          });
        
        // Apply format-specific optimization
        if (format === 'webp') {
          sharpInstance = sharpInstance.webp({
            quality: OPTIMIZATION_CONFIG.quality.webp,
            effort: 6
          });
        } else if (format === 'avif') {
          sharpInstance = sharpInstance.avif({
            quality: OPTIMIZATION_CONFIG.quality.avif,
            effort: 9
          });
        }
        
        await sharpInstance.toFile(outputPath);
        
        // Get file size
        const stats = await fs.stat(outputPath);
        results.optimized[format][size] = {
          path: `images/optimized/${outputFilename}`,
          size: stats.size
        };
        
        const compressionRatio = ((metadata.size - stats.size) / metadata.size * 100).toFixed(1);
        console.log(`   ✅ ${format.toUpperCase()} ${size}px: ${(stats.size / 1024).toFixed(1)}KB (${compressionRatio}% smaller)`);
        
      } catch (error) {
        console.error(`   ❌ Failed to create ${format} ${size}px:`, error.message);
      }
    }
  }
  
  return results;
}

/**
 * Optimizes images that have missing optimization data
 */
async function optimizeMissingImages() {
  console.log('\n📋 Optimizing images with missing optimization data...');
  
  const results = [];
  
  for (const imagePath of MISSING_OPTIMIZED_IMAGES) {
    try {
      await fs.access(imagePath);
      
      const filename = path.basename(imagePath, path.extname(imagePath));
      const imageConfig = {
        input: imagePath,
        name: filename,
        priority: 'low'
      };
      
      const result = await optimizeImage(imageConfig);
      if (result) {
        results.push(result);
      }
    } catch {
      console.log(`   ⚠️  Skipping missing file: ${imagePath}`);
    }
  }
  
  return results;
}

/**
 * Updates the optimization manifest with new data
 */
async function updateOptimizationManifest(optimizedImages) {
  console.log('\n📝 Updating optimization manifest...');
  
  let manifest = { images: {} };
  
  // Try to load existing manifest
  try {
    const existingManifest = await fs.readFile('image-optimization-manifest.json', 'utf8');
    manifest = JSON.parse(existingManifest);
  } catch {
    console.log('   Creating new optimization manifest...');
  }
  
  // Add new optimized images to manifest
  for (const imageData of optimizedImages) {
    if (imageData) {
      // Convert path to Windows format for manifest key (to match existing format)
      const manifestKey = path.resolve(imageData.original).replace(/\//g, '\\');
      manifest.images[manifestKey] = imageData;
    }
  }
  
  // Update manifest metadata
  manifest.generated = new Date().toISOString();
  manifest.count = Object.keys(manifest.images).length;
  
  // Write updated manifest
  await fs.writeFile('image-optimization-manifest.json', JSON.stringify(manifest, null, 2));
  console.log(`   ✅ Updated manifest with ${optimizedImages.length} new entries`);
}

/**
 * Main optimization function
 */
async function main() {
  console.log('🚀 Starting critical image optimization...');
  console.log(`📁 Output directory: ${OPTIMIZATION_CONFIG.outputDir}`);
  
  // Ensure output directory exists
  await ensureOutputDir();
  
  const allOptimizedImages = [];
  
  // Optimize critical images
  console.log('\n🎯 Optimizing critical images...');
  for (const imageConfig of CRITICAL_IMAGES) {
    const result = await optimizeImage(imageConfig);
    if (result) {
      allOptimizedImages.push(result);
    }
  }
  
  // Optimize missing images
  const missingResults = await optimizeMissingImages();
  allOptimizedImages.push(...missingResults);
  
  // Update manifest
  if (allOptimizedImages.length > 0) {
    await updateOptimizationManifest(allOptimizedImages);
  }
  
  // Summary
  console.log('\n📊 Optimization Summary:');
  console.log(`   ✅ Successfully optimized: ${allOptimizedImages.length} images`);
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const imageData of allOptimizedImages) {
    if (imageData && imageData.metadata) {
      totalOriginalSize += imageData.metadata.size;
      
      // Calculate total optimized size (sum of all formats and sizes)
      for (const format of Object.keys(imageData.optimized)) {
        for (const size of Object.keys(imageData.optimized[format])) {
          totalOptimizedSize += imageData.optimized[format][size].size;
        }
      }
    }
  }
  
  if (totalOriginalSize > 0) {
    const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
    console.log(`   💾 Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   🗜️  Total optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   📉 Total savings: ${totalSavings}%`);
  }
  
  console.log('\n🎉 Image optimization complete!');
  console.log('\n💡 Next steps:');
  console.log('   1. Test your site to verify images load correctly');
  console.log('   2. Check mobile performance improvements');
  console.log('   3. Monitor loading times on different devices');
}

// Run the optimization
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  });
}

module.exports = { optimizeImage, CRITICAL_IMAGES };
