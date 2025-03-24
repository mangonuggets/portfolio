/**
 * This script installs the necessary middleware for Live Server to support clean URLs.
 * 
 * The middleware allows Live Server to automatically add .html extensions to URLs
 * that don't have a file extension, enabling clean URL navigation.
 * 
 * Usage:
 * 1. Run this script with Node.js: node install-live-server-middleware.js
 * 2. Restart VS Code after installation
 * 3. Use Live Server as usual, but now with clean URL support
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

// Define the middleware code
const middlewareCode = `
/**
 * Clean URLs middleware for Live Server
 * 
 * This middleware automatically adds .html extensions to URLs that don't have a file extension,
 * enabling clean URL navigation (e.g., /portfolio instead of /portfolio.html).
 */
module.exports = function(req, res, next) {
  // Handle root path - redirect to /home
  if (req.url === '/' || req.url === '') {
    req.url = '/home.html';
    return next();
  }
  
  // Skip if URL already has an extension or ends with a slash
  if (req.url.match(/\\.[a-zA-Z0-9]+$/) || req.url.endsWith('/')) {
    return next();
  }
  
  // Skip for API requests or other special paths
  if (req.url.startsWith('/api/') || req.url.includes('socket.io')) {
    return next();
  }
  
  // Add .html extension to the URL
  req.url = req.url + '.html';
  
  // Continue to the next middleware
  next();
};
`;

// Function to find the Live Server middleware directory
function findLiveServerMiddlewareDir() {
  try {
    // Try to find the global npm directory
    const npmGlobalDir = execSync("npm root -g").toString().trim();
    
    // Check if live-server is installed globally
    const liveServerPath = path.join(npmGlobalDir, "live-server");
    
    if (fs.existsSync(liveServerPath)) {
      const middlewarePath = path.join(liveServerPath, "middleware");
      
      // Create middleware directory if it doesn't exist
      if (!fs.existsSync(middlewarePath)) {
        fs.mkdirSync(middlewarePath, { recursive: true });
      }
      
      return middlewarePath;
    }
    
    // If not found globally, check in VS Code extensions
    const homeDir = os.homedir();
    const vsCodeExtDir = path.join(homeDir, ".vscode", "extensions");
    
    if (fs.existsSync(vsCodeExtDir)) {
      // Find Live Server extension directory
      const liveServerExtDirs = fs.readdirSync(vsCodeExtDir)
        .filter(dir => dir.toLowerCase().includes("ritwickdey.liveserver"))
        .map(dir => path.join(vsCodeExtDir, dir));
      
      if (liveServerExtDirs.length > 0) {
        // Sort by modification time to get the latest version
        liveServerExtDirs.sort((a, b) => {
          return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
        });
        
        const latestExtDir = liveServerExtDirs[0];
        const nodeModulesDir = path.join(latestExtDir, "node_modules");
        
        if (fs.existsSync(nodeModulesDir)) {
          const liveServerModuleDir = path.join(nodeModulesDir, "live-server");
          
          if (fs.existsSync(liveServerModuleDir)) {
            const middlewarePath = path.join(liveServerModuleDir, "middleware");
            
            // Create middleware directory if it doesn't exist
            if (!fs.existsSync(middlewarePath)) {
              fs.mkdirSync(middlewarePath, { recursive: true });
            }
            
            return middlewarePath;
          }
        }
      }
    }
    
    // If not found in VS Code extensions, check in local node_modules
    const localNodeModules = path.join(process.cwd(), "node_modules");
    const localLiveServer = path.join(localNodeModules, "live-server");
    
    if (fs.existsSync(localLiveServer)) {
      const middlewarePath = path.join(localLiveServer, "middleware");
      
      // Create middleware directory if it doesn't exist
      if (!fs.existsSync(middlewarePath)) {
        fs.mkdirSync(middlewarePath, { recursive: true });
      }
      
      return middlewarePath;
    }
    
    return null;
  } catch (error) {
    console.error("Error finding Live Server middleware directory:", error);
    return null;
  }
}

// Main function
function installMiddleware() {
  console.log("Installing Live Server clean-urls middleware...");
  
  const middlewareDir = findLiveServerMiddlewareDir();
  
  if (!middlewareDir) {
    console.error("Could not find Live Server installation. Please make sure Live Server is installed.");
    console.log("You can install Live Server globally with: npm install -g live-server");
    console.log("Or install the Live Server VS Code extension.");
    return;
  }
  
  const middlewarePath = path.join(middlewareDir, "clean-urls.js");
  
  try {
    fs.writeFileSync(middlewarePath, middlewareCode);
    console.log("Clean URLs middleware installed successfully at:", middlewarePath);
    console.log("Please restart VS Code for the changes to take effect.");
  } catch (error) {
    console.error("Error installing middleware:", error);
  }
}

// Run the installation
installMiddleware();
