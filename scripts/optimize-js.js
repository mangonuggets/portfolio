/**
 * JavaScript Optimization Script
 * 
 * This script optimizes JavaScript files by removing console.log statements,
 * unnecessary comments, and whitespace for production builds.
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
    'js/**/*.js',
    '!js/**/*.min.js', // Exclude already minified files
    '!js/vendor/**/*.js', // Exclude vendor files
    '!js/components/**/*.js' // Exclude web components
  ],
  
  // Output directory for optimized files
  outputDir: 'dist/js',
  
  // Whether to create backup files
  createBackups: true,
  
  // Whether to remove console.log statements
  removeConsoleLogs: true,
  
  // Whether to remove comments
  removeComments: true,
  
  // Whether to minify whitespace
  minifyWhitespace: true,
  
  // Whether to overwrite original files (if false, writes to outputDir)
  overwriteOriginals: false,
  
  // Whether to preserve important comments (those starting with /*! or /***)
  preserveImportantComments: true
};

/**
 * Optimizes JavaScript content by removing console.logs, comments, and whitespace
 * @param {string} content - The JavaScript content to optimize
 * @param {Object} options - Optimization options
 * @returns {string} Optimized JavaScript content
 */
function optimizeJavaScript(content, options) {
  let optimized = content;
  
  // Remove console.log statements
  if (options.removeConsoleLogs) {
    // Match console.log statements, including multi-line ones
    const consoleLogRegex = /console\.log\s*\([\s\S]*?\);?/g;
    optimized = optimized.replace(consoleLogRegex, '');
  }
  
  // Remove comments
  if (options.removeComments) {
    if (options.preserveImportantComments) {
      // Remove single-line comments that don't start with ! or ***
      optimized = optimized.replace(/\/\/(?!\s*!|\s*\*\*\*)[^\n]*/g, '');
      
      // Remove multi-line comments that don't start with ! or ***
      optimized = optimized.replace(/\/\*(?!\!|\*\*\*)[\s\S]*?\*\//g, '');
    } else {
      // Remove all single-line comments
      optimized = optimized.replace(/\/\/[^\n]*/g, '');
      
      // Remove all multi-line comments
      optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');
    }
  }
  
  // Minify whitespace
  if (options.minifyWhitespace) {
    // Replace multiple spaces with a single space
    optimized = optimized.replace(/\s{2,}/g, ' ');
    
    // Remove spaces around operators
    optimized = optimized.replace(/\s*([=+\-*/%&|^<>!?:;,])\s*/g, '$1');
    
    // Remove unnecessary semicolons
    optimized = optimized.replace(/;;+/g, ';');
    
    // Remove trailing whitespace
    optimized = optimized.replace(/[ \t]+\n/g, '\n');
    
    // Remove empty lines
    optimized = optimized.replace(/\n\s*\n+/g, '\n');
  }
  
  return optimized;
}

/**
 * Main function to run the JavaScript optimization
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
      const isExclude = pattern.startsWith('!');
      const actualPattern = isExclude ? pattern.slice(1) : pattern;
      
      const files = await glob(actualPattern);
      
      if (isExclude) {
        // Remove excluded files from the list
        for (const file of files) {
          const index = allFiles.indexOf(file);
          if (index !== -1) {
            allFiles.splice(index, 1);
          }
        }
      } else {
        // Add included files to the list
        allFiles.push(...files);
      }
    }
    
    console.log(`Found ${allFiles.length} JavaScript files to optimize`);
    
    // Process each file
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    for (const file of allFiles) {
      const filePath = path.resolve(file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Optimize the content
      const optimized = optimizeJavaScript(content, {
        removeConsoleLogs: config.removeConsoleLogs,
        removeComments: config.removeComments,
        minifyWhitespace: config.minifyWhitespace,
        preserveImportantComments: config.preserveImportantComments
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
        const relativePath = path.relative(path.dirname(filePath), filePath);
        const outputPath = path.join(config.outputDir, relativePath);
        
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
    console.error('Error optimizing JavaScript:', error);
  }
}

// Run the optimization
main().catch(error => {
  console.error('Unhandled error:', error);
});
