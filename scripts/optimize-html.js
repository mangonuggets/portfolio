/**
 * HTML Optimization Script
 * 
 * This script optimizes HTML files by removing comments, unnecessary whitespace,
 * and minifying inline CSS and JavaScript for production builds.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Configuration options
 * @type {Object}
 */
const config = {
  // Files to process
  filesToProcess: [
    '*.html',
    'components/**/*.html'
  ],
  
  // Output directory for optimized files
  outputDir: 'dist',
  
  // Whether to create backup files
  createBackups: true,
  
  // Whether to remove HTML comments
  removeComments: true,
  
  // Whether to minify whitespace
  minifyWhitespace: true,
  
  // Whether to minify inline CSS
  minifyInlineCSS: true,
  
  // Whether to minify inline JavaScript
  minifyInlineJS: true,
  
  // Whether to overwrite original files (if false, writes to outputDir)
  overwriteOriginals: false,
  
  // Whether to preserve conditional comments (IE conditionals)
  preserveConditionalComments: true
};

/**
 * Minifies inline CSS content
 * @param {string} css - The CSS content to minify
 * @returns {string} Minified CSS content
 */
function minifyCSS(css) {
  let minified = css;
  
  // Remove comments
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove whitespace
  minified = minified.replace(/\s+/g, ' ');
  minified = minified.replace(/\s*([{}:;,])\s*/g, '$1');
  minified = minified.replace(/;\s*}/g, '}');
  minified = minified.replace(/\s*{\s*/g, '{');
  
  return minified.trim();
}

/**
 * Minifies inline JavaScript content
 * @param {string} js - The JavaScript content to minify
 * @returns {string} Minified JavaScript content
 */
function minifyJS(js) {
  let minified = js;
  
  // Remove comments (both single-line and multi-line)
  minified = minified.replace(/\/\/[^\n]*/g, '');
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove whitespace
  minified = minified.replace(/\s+/g, ' ');
  minified = minified.replace(/\s*([=+\-*/%&|^<>!?:;,{}()])\s*/g, '$1');
  
  return minified.trim();
}

/**
 * Optimizes HTML content
 * @param {string} html - The HTML content to optimize
 * @param {Object} options - Optimization options
 * @returns {string} Optimized HTML content
 */
function optimizeHTML(html, options) {
  let optimized = html;
  
  // Remove HTML comments
  if (options.removeComments) {
    if (options.preserveConditionalComments) {
      // Remove all comments except conditional comments
      optimized = optimized.replace(/<!--(?!\[if)(?!\<!\[endif)[\s\S]*?-->/g, '');
    } else {
      // Remove all comments
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
    }
  }
  
  // Minify inline CSS
  if (options.minifyInlineCSS) {
    // Find and minify <style> tags
    optimized = optimized.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, p1) => {
      return match.replace(p1, minifyCSS(p1));
    });
    
    // Find and minify style attributes
    optimized = optimized.replace(/style="([^"]*)"/gi, (match, p1) => {
      return `style="${minifyCSS(p1)}"`;
    });
  }
  
  // Minify inline JavaScript
  if (options.minifyInlineJS) {
    // Find and minify <script> tags
    optimized = optimized.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, p1) => {
      // Skip if it has a src attribute
      if (match.includes('src=')) {
        return match;
      }
      return match.replace(p1, minifyJS(p1));
    });
    
    // Find and minify event handler attributes
    const eventHandlers = ['onclick', 'onload', 'onchange', 'onsubmit', 'onmouseover', 'onmouseout'];
    for (const handler of eventHandlers) {
      const regex = new RegExp(`${handler}="([^"]*)"`, 'gi');
      optimized = optimized.replace(regex, (match, p1) => {
        return `${handler}="${minifyJS(p1)}"`;
      });
    }
  }
  
  // Minify whitespace
  if (options.minifyWhitespace) {
    // Replace multiple spaces with a single space
    optimized = optimized.replace(/\s{2,}/g, ' ');
    
    // Remove whitespace between tags
    optimized = optimized.replace(/>\s+</g, '><');
    
    // Remove whitespace at the beginning and end of the file
    optimized = optimized.trim();
  }
  
  return optimized;
}

/**
 * Main function to run the HTML optimization
 */
async function main() {
  try {
    // Create output directory if it doesn't exist
    if (!config.overwriteOriginals) {
      fs.mkdirSync(path.resolve(config.outputDir), { recursive: true });
    }
    
    // Get all files to process
    const allFiles = [];
    for (const pattern of config.filesToProcess) {
      const files = await glob(pattern);
      allFiles.push(...files);
    }
    
    console.log(`Found ${allFiles.length} HTML files to optimize`);
    
    // Process each file
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    for (const file of allFiles) {
      const filePath = path.resolve(file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Optimize the content
      const optimized = optimizeHTML(content, {
        removeComments: config.removeComments,
        minifyWhitespace: config.minifyWhitespace,
        minifyInlineCSS: config.minifyInlineCSS,
        minifyInlineJS: config.minifyInlineJS,
        preserveConditionalComments: config.preserveConditionalComments
      });
      
      // Calculate size reduction
      const originalSize = content.length;
      const optimizedSize = optimized.length;
      totalOriginalSize += originalSize;
      totalOptimizedSize += optimizedSize;
      
      // Create backup if needed
      if (config.createBackups) {
        const backupPath = `${filePath}.backup`;
        fs.writeFileSync(backupPath, content);
      }
      
      // Write optimized content
      if (config.overwriteOriginals) {
        fs.writeFileSync(filePath, optimized);
        console.log(`Optimized ${file} (${originalSize} → ${optimizedSize} bytes, ${((originalSize - optimizedSize) / originalSize * 100).toFixed(2)}% reduction)`);
      } else {
        // Determine output path
        const outputPath = path.join(config.outputDir, file);
        
        // Create directory if it doesn't exist
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        
        // Write optimized file
        fs.writeFileSync(outputPath, optimized);
        console.log(`Optimized ${file} → ${outputPath} (${originalSize} → ${optimizedSize} bytes, ${((originalSize - optimizedSize) / originalSize * 100).toFixed(2)}% reduction)`);
      }
    }
    
    // Print summary
    const totalReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(2);
    console.log(`\nOptimization complete!`);
    console.log(`Total original size: ${totalOriginalSize} bytes`);
    console.log(`Total optimized size: ${totalOptimizedSize} bytes`);
    console.log(`Total size reduction: ${totalReduction}% (${totalOriginalSize - totalOptimizedSize} bytes)`);
    
  } catch (error) {
    console.error('Error optimizing HTML:', error);
  }
}

// Run the optimization
main().catch(error => {
  console.error('Unhandled error:', error);
});
