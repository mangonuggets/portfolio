/**
 * Regenerate Manifest Script
 * 
 * This script is used to regenerate the image manifest from the browser.
 * It's a simple wrapper around the generate-manifest.js script.
 */

// Import the Node.js child_process module to execute commands
const { exec } = require('child_process');
const path = require('path');

// Get the path to the generate-manifest.js script
const generateManifestPath = path.join(__dirname, 'scripts', 'generate-manifest.js');

// Execute the generate-manifest.js script
console.log('Regenerating image manifest...');
exec(`node "${generateManifestPath}"`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log(stdout);
  console.log('Manifest regenerated successfully!');
});
