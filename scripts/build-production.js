/**
 * Production Build Script
 * 
 * This script creates a production-ready build by:
 * 1. Creating a clean dist directory
 * 2. Running optimization scripts for CSS, JS, HTML, and images
 * 3. Copying all necessary files to the dist directory
 * 4. Creating a production-ready structure
 */

const fs = require('fs-extra');
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
    'functions/**/*',
    'data/**/*'
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
 * Copies a file or directory from source to destination
 * @param {string} source - The source file or directory path
 * @param {string} destination - The destination file or directory path
 * @returns {Promise<void>}
 */
async function copyFile(source, destination) {
  try {
    // Create the destination directory if it doesn't exist
    const destDir = path.dirname(destination);
    await fs.ensureDir(destDir);
    
    // Check if source is a directory
    const stats = await fs.stat(source);
    
    if (stats.isDirectory()) {
      // Copy directory recursively
      await fs.copy(source, destination);
      console.log(`Copied directory: ${source} → ${destination}`);
    } else {
      // Copy file
      await fs.copy(source, destination);
      console.log(`Copied file: ${source} → ${destination}`);
    }
  } catch (error) {
    console.error(`Error copying ${source} to ${destination}:`, error);
  }
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
    
    // Clean output directory if it exists
    if (fs.existsSync(outputPath)) {
      console.log(`Cleaning output directory: ${outputPath}`);
      fs.rmSync(outputPath, { recursive: true, force: true });
    }
    
    // Create output directory
    createDirectoryIfNotExists(outputPath);
    
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
        const destPath = path.resolve(path.join(config.outputDir, file));
        
        await copyFile(sourcePath, destPath);
      }
    }
    
    // Copy optimized files if they exist
    
    // CSS files
    if (fs.existsSync('css/styles.optimized.css')) {
      await copyFile(
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
          
          await copyFile(sourcePath, destPath);
        }
      }
    }
    
    // JS files
    if (fs.existsSync('dist/js')) {
      // Copy optimized JS files
      const jsFiles = await glob('dist/js/**/*.js');
      
      for (const file of jsFiles) {
        const relativePath = path.relative('dist/js', file);
        const destPath = path.resolve(path.join(config.outputDir, 'js', relativePath));
        
        await copyFile(path.resolve(file), destPath);
      }
    } else {
      // Copy original JS files
      for (const pattern of config.filesToProcess.js) {
        if (pattern.startsWith('!')) continue;
        
        const files = await glob(pattern);
        
        for (const file of files) {
          const sourcePath = path.resolve(file);
          const destPath = path.resolve(path.join(config.outputDir, file));
          
          await copyFile(sourcePath, destPath);
        }
      }
    }
    
    // HTML files
    if (fs.existsSync('dist/index.html')) {
      // Copy optimized HTML files
      const htmlFiles = await glob('dist/**/*.html');
      
      for (const file of htmlFiles) {
        const relativePath = path.relative('dist', file);
        const destPath = path.resolve(path.join(config.outputDir, relativePath));
        
        await copyFile(path.resolve(file), destPath);
      }
    } else {
      // Copy original HTML files
      for (const pattern of config.filesToProcess.html) {
        const files = await glob(pattern);
        
        for (const file of files) {
          const sourcePath = path.resolve(file);
          const destPath = path.resolve(path.join(config.outputDir, file));
          
          await copyFile(sourcePath, destPath);
        }
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
