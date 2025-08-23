/**
 * Live Server Clean URLs Middleware
 * 
 * This script installs a middleware for Live Server that enables clean URLs
 * (URLs without .html extensions) during local development.
 * 
 * Usage:
 * 1. Install the middleware: node install-live-server-middleware.js
 * 2. Configure Live Server to use the middleware in .vscode/live-server.json
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

// Path to the Live Server middleware directory
// Try multiple possible locations for Live Server installation
const possiblePaths = [
  path.join(os.homedir(), "AppData", "Roaming", "npm", "node_modules", "live-server", "middleware"),
  path.join(os.homedir(), "AppData", "Local", "npm", "node_modules", "live-server", "middleware"),
  path.join(process.env.APPDATA || "", "npm", "node_modules", "live-server", "middleware"),
  path.join(process.env.LOCALAPPDATA || "", "npm", "node_modules", "live-server", "middleware")
];

let liveServerPath = null;

// Find the correct Live Server installation path
for (const testPath of possiblePaths) {
  const liveServerMainPath = path.dirname(testPath); // Remove 'middleware' to check main directory
  if (fs.existsSync(liveServerMainPath)) {
    liveServerPath = testPath;
    console.log(`Found Live Server at: ${liveServerMainPath}`);
    break;
  }
}

if (!liveServerPath) {
  console.error("Live Server installation not found. Please install Live Server first:");
  console.error("npm install -g live-server");
  process.exit(1);
}

// Clean URLs middleware implementation
const cleanUrlsMiddleware = `
/**
 * Clean URLs Middleware for Live Server
 * 
 * This middleware enables clean URLs (without .html extensions) during local development.
 * It rewrites URLs like /portfolio to /portfolio.html internally.
 */
module.exports = function(req, res, next) {
  // Skip for asset requests (CSS, JS, images, etc.)
  if (/\\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|eot)$/.test(req.url)) {
    return next();
  }
  
  // Skip if URL already has an extension
  if (path.extname(req.url) !== "") {
    return next();
  }
  
  // Skip for root URL
  if (req.url === "/") {
    return next();
  }
  
  // Remove trailing slash if present
  let url = req.url;
  if (url.endsWith("/") && url !== "/") {
    url = url.slice(0, -1);
  }
  
  // Special case for /index
  if (url === "/index") {
    res.writeHead(301, { "Location": "/" });
    return res.end();
  }
  
  // Check if the HTML file exists
  const htmlFile = path.join(process.cwd(), url + ".html");
  
  if (fs.existsSync(htmlFile)) {
    // Rewrite the URL to include .html
    req.url = url + ".html";
    console.log(\`[clean-urls] Rewriting \${url} to \${req.url}\`);
  }
  
  next();
};
`;

// Create the middleware directory if it doesn't exist
if (!fs.existsSync(liveServerPath)) {
  console.log(`Creating directory: ${liveServerPath}`);
  fs.mkdirSync(liveServerPath, { recursive: true });
}

// Write the middleware file
const middlewarePath = path.join(liveServerPath, "clean-urls.js");
fs.writeFileSync(middlewarePath, cleanUrlsMiddleware);

console.log(`Clean URLs middleware installed at: ${middlewarePath}`);
console.log("To use this middleware, add the following to your .vscode/live-server.json file:");
console.log(`
{
  "port": 5501,
  "host": "localhost",
  "open": false,
  "file": "index.html",
  "wait": 1000,
  "mount": [],
  "proxy": [],
  "middleware": [
    {
      "route": "/",
      "handle": {
        "middleware": "clean-urls"
      }
    }
  ],
  "https": null
}
`);
