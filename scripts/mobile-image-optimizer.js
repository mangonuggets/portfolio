/**
 * Mobile-First Image Optimization Script
 * 
 * This script enhances the existing image optimization system with mobile-specific optimizations:
 * - Mobile-first responsive image generation
 * - WebP and AVIF format optimization
 * - Lazy loading implementation
 * - Critical image preloading
 * - Bandwidth-aware image serving
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { glob } = require('glob');

/**
 * Mobile optimization configuration
 */
const config = {
  // Mobile-first breakpoints (mobile-first approach)
  breakpoints: [
    { name: 'mobile', width: 320, quality: 75 },
    { name: 'mobile-lg', width: 480, quality: 80 },
    { name: 'tablet', width: 768, quality: 85 },
    { name: 'desktop', width: 1024, quality: 85 },
    { name: 'desktop-lg', width: 1280, quality: 90 }
  ],
  
  // Output formats (prioritized for mobile)
  formats: [
    { ext: 'avif', quality: 75, options: { effort: 4 } },
    { ext: 'webp', quality: 80, options: { effort: 4 } },
    { ext: 'jpg', quality: 85, options: { mozjpeg: true } }
  ],
  
  // Directories
  inputDir: 'images',
  outputDir: 'images/mobile-optimized',
  
  // Critical images (above-the-fold)
  criticalImages: [
    'profile/profile.jpg',
    'logo/emote2.png',
    'featured/Illustration.jpg'
  ],
  
  // Performance budgets
  budgets: {
    mobile: 150000,    // 150KB max for mobile
    tablet: 300000,    // 300KB max for tablet
    desktop: 500000    // 500KB max for desktop
  }
};

/**
 * Generates mobile-optimized images for a single source image
 * @param {string} inputPath - Path to source image
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Optimization results
 */
async function optimizeImageForMobile(inputPath, outputDir) {
  const results = {
    original: inputPath,
    optimized: {},
    sizes: {},
    critical: config.criticalImages.some(critical => inputPath.includes(critical))
  };
  
  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    const originalSize = fs.statSync(inputPath).size;
    
    console.log(`Optimizing ${inputPath} (${metadata.width}x${metadata.height}, ${originalSize} bytes)`);
    
    // Create output directory
    const imageOutputDir = path.join(outputDir, path.dirname(inputPath.replace(config.inputDir, '')));
    if (!fs.existsSync(imageOutputDir)) {
      fs.mkdirSync(imageOutputDir, { recursive: true });
    }
    
    const baseName = path.basename(inputPath, path.extname(inputPath));
    
    // Generate images for each breakpoint and format
    for (const breakpoint of config.breakpoints) {
      results.optimized[breakpoint.name] = {};
      
      // Skip if original is smaller than breakpoint
      if (metadata.width < breakpoint.width) continue;
      
      for (const format of config.formats) {
        const outputFileName = `${baseName}-${breakpoint.width}.${format.ext}`;
        const outputPath = path.join(imageOutputDir, outputFileName);
        
        let sharpInstance = sharp(inputPath)
          .resize(breakpoint.width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          });
        
        // Apply format-specific optimizations
        switch (format.ext) {
          case 'avif':
            sharpInstance = sharpInstance.avif({
              quality: format.quality,
              effort: format.options.effort
            });
            break;
          case 'webp':
            sharpInstance = sharpInstance.webp({
              quality: format.quality,
              effort: format.options.effort
            });
            break;
          case 'jpg':
            sharpInstance = sharpInstance.jpeg({
              quality: format.quality,
              mozjpeg: format.options.mozjpeg
            });
            break;
        }
        
        // Generate optimized image
        await sharpInstance.toFile(outputPath);
        
        // Check file size and quality
        const optimizedSize = fs.statSync(outputPath).size;
        const budget = config.budgets[breakpoint.name] || config.budgets.desktop;
        
        if (optimizedSize > budget) {
          console.warn(`${outputPath} exceeds budget: ${optimizedSize} > ${budget} bytes`);
        }
        
        results.optimized[breakpoint.name][format.ext] = {
          path: outputPath.replace(/\\/g, '/'),
          size: optimizedSize,
          width: breakpoint.width,
          quality: format.quality
        };
        
        console.log(`  Generated ${breakpoint.name} ${format.ext}: ${optimizedSize} bytes`);
      }
    }
    
    // Generate sizes attribute for responsive images
    results.sizes = generateSizesAttribute(metadata.width);
    
    return results;
    
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error);
    return null;
  }
}

/**
 * Generates the sizes attribute for responsive images
 * @param {number} originalWidth - Original image width
 * @returns {string} Sizes attribute value
 */
function generateSizesAttribute(originalWidth) {
  // Mobile-first sizes attribute
  const sizes = [
    '(max-width: 480px) 100vw',
    '(max-width: 768px) 50vw',
    '(max-width: 1024px) 33vw',
    '25vw'
  ];
  
  return sizes.join(', ');
}

/**
 * Generates srcset attribute for responsive images
 * @param {Object} optimizedImages - Optimized image data
 * @param {string} format - Image format (avif, webp, jpg)
 * @returns {string} Srcset attribute value
 */
function generateSrcSet(optimizedImages, format = 'webp') {
  const srcsetEntries = [];
  
  for (const [breakpoint, formats] of Object.entries(optimizedImages)) {
    if (formats[format]) {
      const relativePath = formats[format].path.replace(/^.*?\/images\//, '/images/');
      srcsetEntries.push(`${relativePath} ${formats[format].width}w`);
    }
  }
  
  return srcsetEntries.join(', ');
}

/**
 * Generates picture element HTML for maximum compatibility
 * @param {Object} optimizedImages - Optimized image data
 * @param {string} alt - Alt text
 * @param {string} sizes - Sizes attribute
 * @returns {string} Picture element HTML
 */
function generatePictureElement(optimizedImages, alt, sizes) {
  const avifSrcset = generateSrcSet(optimizedImages, 'avif');
  const webpSrcset = generateSrcSet(optimizedImages, 'webp');
  const jpgSrcset = generateSrcSet(optimizedImages, 'jpg');
  
  // Get fallback image (smallest jpg)
  let fallbackSrc = '';
  for (const [breakpoint, formats] of Object.entries(optimizedImages)) {
    if (formats.jpg) {
      fallbackSrc = formats.jpg.path.replace(/^.*?\/images\//, '/images/');
      break;
    }
  }
  
  return `
<picture>
  <source srcset="${avifSrcset}" sizes="${sizes}" type="image/avif">
  <source srcset="${webpSrcset}" sizes="${sizes}" type="image/webp">
  <img src="${fallbackSrc}" 
       srcset="${jpgSrcset}" 
       sizes="${sizes}"
       alt="${alt}"
       loading="lazy"
       decoding="async">
</picture>`.trim();
}

/**
 * Updates HTML files with optimized image references
 * @param {Array} optimizationResults - Results from image optimization
 */
async function updateHTMLWithOptimizedImages(optimizationResults) {
  const htmlFiles = await glob('*.html');
  
  for (const htmlFile of htmlFiles) {
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    let modified = false;
    
    // Process each optimized image
    for (const result of optimizationResults) {
      if (!result) continue;
      
      const originalPath = result.original.replace(/\\/g, '/');
      const relativePath = '/' + originalPath.replace(/^.*?\/images\//, 'images/');
      
      // Find img tags using this image
      const imgRegex = new RegExp(`<img[^>]*src=["']${relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'g');
      const matches = htmlContent.match(imgRegex);
      
      if (matches) {
        for (const match of matches) {
          // Extract alt text
          const altMatch = match.match(/alt=["']([^"']*)["']/);
          const alt = altMatch ? altMatch[1] : '';
          
          // Generate optimized image HTML
          let optimizedHTML;
          
          if (result.critical) {
            // For critical images, use preload and immediate loading
            const webpSrcset = generateSrcSet(result.optimized, 'webp');
            const jpgSrcset = generateSrcSet(result.optimized, 'jpg');
            
            optimizedHTML = `<img src="${relativePath}" 
                                  srcset="${jpgSrcset}" 
                                  sizes="${result.sizes}"
                                  alt="${alt}"
                                  decoding="async"
                                  fetchpriority="high">`;
          } else {
            // For non-critical images, use lazy loading
            optimizedHTML = generatePictureElement(result.optimized, alt, result.sizes);
          }
          
          htmlContent = htmlContent.replace(match, optimizedHTML);
          modified = true;
        }
      }
    }
    
    // Write updated HTML if modified
    if (modified) {
      fs.writeFileSync(htmlFile, htmlContent);
      console.log(`Updated ${htmlFile} with optimized images`);
    }
  }
}

/**
 * Generates mobile image manifest
 * @param {Array} optimizationResults - Results from image optimization
 */
function generateMobileImageManifest(optimizationResults) {
  const manifest = {
    version: '1.0',
    generated: new Date().toISOString(),
    images: {},
    critical: [],
    formats: config.formats.map(f => f.ext),
    breakpoints: config.breakpoints.map(b => ({ name: b.name, width: b.width }))
  };
  
  for (const result of optimizationResults) {
    if (!result) continue;
    
    const key = result.original.replace(/\\/g, '/');
    manifest.images[key] = {
      original: result.original,
      optimized: result.optimized,
      sizes: result.sizes,
      critical: result.critical
    };
    
    if (result.critical) {
      manifest.critical.push(key);
    }
  }
  
  fs.writeFileSync('mobile-image-manifest.json', JSON.stringify(manifest, null, 2));
  console.log('Generated mobile image manifest: mobile-image-manifest.json');
}

/**
 * Main mobile image optimization function
 */
async function optimizeImagesForMobile() {
  try {
    console.log('Starting mobile image optimization...');
    
    // Create output directory
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Find all images
    const imagePatterns = [
      `${config.inputDir}/**/*.jpg`,
      `${config.inputDir}/**/*.jpeg`,
      `${config.inputDir}/**/*.png`,
      `${config.inputDir}/**/*.webp`
    ];
    
    const allImages = [];
    for (const pattern of imagePatterns) {
      const images = await glob(pattern);
      allImages.push(...images);
    }
    
    console.log(`Found ${allImages.length} images to optimize`);
    
    // Optimize each image
    const optimizationResults = [];
    for (const imagePath of allImages) {
      const result = await optimizeImageForMobile(imagePath, config.outputDir);
      optimizationResults.push(result);
    }
    
    // Generate manifest
    generateMobileImageManifest(optimizationResults);
    
    // Update HTML files
    await updateHTMLWithOptimizedImages(optimizationResults);
    
    console.log('Mobile image optimization complete!');
    
    // Print summary
    const totalOriginalSize = allImages.reduce((sum, img) => {
      return sum + fs.statSync(img).size;
    }, 0);
    
    let totalOptimizedSize = 0;
    optimizationResults.forEach(result => {
      if (result) {
        Object.values(result.optimized).forEach(breakpoint => {
          Object.values(breakpoint).forEach(format => {
            totalOptimizedSize += format.size;
          });
        });
      }
    });
    
    const savings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(2);
    console.log(`Total size reduction: ${savings}% (${totalOriginalSize} -> ${totalOptimizedSize} bytes)`);
    
  } catch (error) {
    console.error('Error during mobile image optimization:', error);
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeImagesForMobile();
}

module.exports = {
  optimizeImagesForMobile,
  optimizeImageForMobile,
  generatePictureElement,
  generateSrcSet
};
