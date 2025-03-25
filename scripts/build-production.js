/**
 * Production Build Script
 * 
 * This script creates a production-ready build by:
 * 1. Running optimization scripts for CSS, JS, HTML, and images
 * 2. Copying all necessary files to the root directory
 * 3. Creating a production-ready structure
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const { execSync } = require('child_process');

/**
 * Configuration options
 * @type {Object}
 */
const config = {
  // Source directory (project root)
  sourceDir: '.',
  
  // Output directory for production build
  outputDir: 'dist',
  
  // Files and directories to copy directly
  filesToCopy: [
    'images/**/*',
    'favicon.ico',
    'robots.txt',
    'sitemap.xml',
    'netlify.toml',
    'image-manifest.json',
    'image-order.json'
  ],
  
  // Files to process with optimization scripts
  filesToProcess: {
    html: ['*.html', 'components/**/*.html'],
    css: ['css/styles.css'],
    js: ['js/**/*.js', '!js/**/*.min.js', '!js/vendor/**/*.js']
  },
  
  // Whether to run npm scripts for optimization
  runOptimizationScripts: true,
  
  // Whether to minify files
  minify: true
};

/**
 * Creates a directory if it doesn't exist
 * @param {string} dirPath - The directory path to create
 */
function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Copies a file from source to destination
 * @param {string} source - The source file path
 * @param {string} destination - The destination file path
 */
function copyFile(source, destination) {
  // Create the destination directory if it doesn't exist
  const destDir = path.dirname(destination);
  createDirectoryIfNotExists(destDir);
  
  // Copy the file
  fs.copyFileSync(source, destination);
  console.log(`Copied: ${source} → ${destination}`);
}

/**
 * Runs a command and returns its output
 * @param {string} command - The command to run
 * @returns {string} The command output
 */
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return '';
  }
}

/**
 * Main function to run the production build
 */
async function main() {
  try {
    const startTime = Date.now();
    
    // Create output directory
    const outputPath = path.resolve(config.outputDir);
    
    // Clean existing dist directory if it exists
    if (fs.existsSync(config.outputDir)) {
      fs.rmSync(config.outputDir, { recursive: true, force: true });
      console.log(`Cleaned: ${config.outputDir}`);
    }
    
    // Run optimization scripts if enabled
    if (config.runOptimizationScripts) {
      console.log('\n--- Running Optimization Scripts ---');
      
      // Run CSS optimization
      runCommand('npm run optimize-css');
      
      // Run JS optimization
      runCommand('npm run optimize-js');
      
      // Run HTML optimization
      runCommand('npm run optimize-html');
      
      // Run image optimization
      runCommand('npm run optimize-images');
    }
    
    // Copy files
    console.log('\n--- Copying Files ---');
    
    // Copy direct files
    for (const pattern of config.filesToCopy) {
      const files = await glob(pattern);
      
      for (const file of files) {
        const sourcePath = path.resolve(file);
        const destPath = path.resolve(path.join(config.outputDir, file.replace(/^\.\//, '')));
        
        copyFile(sourcePath, destPath);
      }
    }
    
    // Copy optimized files
    
    // CSS files
    if (fs.existsSync('css/styles.optimized.css')) {
      copyFile(
        path.resolve('css/styles.optimized.css'),
        path.resolve(path.join(config.outputDir, 'css/styles.css'))
      );
    } else {
      // Copy original CSS files
      for (const pattern of config.filesToProcess.css) {
        const files = await glob(pattern);
        
        for (const file of files) {
          const sourcePath = path.resolve(file);
          const destPath = path.resolve(path.join(config.outputDir, file));
          
          copyFile(sourcePath, destPath);
        }
      }
    }
    
    // JS files
    // Copy original JS files
    for (const pattern of config.filesToProcess.js) {
      if (pattern.startsWith('!')) continue;
      
      const files = await glob(pattern);
      
      for (const file of files) {
        const sourcePath = path.resolve(file);
        const destPath = path.resolve(path.join(config.outputDir, file));
        
        copyFile(sourcePath, destPath);
      }
    }
    
    // HTML files
    // Copy original HTML files
    for (const pattern of config.filesToProcess.html) {
      const files = await glob(pattern);
      
      for (const file of files) {
        const sourcePath = path.resolve(file);
        const destPath = path.resolve(path.join(config.outputDir, file));
        
        copyFile(sourcePath, destPath);
      }
    }
    
    // Calculate build time
    const endTime = Date.now();
    const buildTime = (endTime - startTime) / 1000;
    
    console.log(`\nProduction build completed in ${buildTime.toFixed(2)} seconds`);
    console.log(`Output directory: ${outputPath}`);
    
  } catch (error) {
    console.error('Error creating production build:', error);
  }
}

// Run the production build
main().catch(error => {
  console.error('Unhandled error:', error);
});
