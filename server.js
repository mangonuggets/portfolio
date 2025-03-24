/**
 * Local Development Server
 * 
 * This Express server mimics Netlify's URL handling behavior for local development.
 * It allows navigation to URLs without .html extensions by automatically serving
 * the corresponding .html file.
 */

const express = require("express");
const path = require("path");
const app = express();
const port = 5500; // Using the same port as in package.json

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

// Root path redirection - redirect / to /home
app.use('/', (req, res, next) => {
  if (req.url === '/') {
    return res.redirect(301, '/home');
  }
  next();
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Netlify-style HTML extension handling for clean URLs
// This handles routes like /home, /portfolio, etc. by serving the corresponding .html file
app.get(/^([^.]+)$/, (req, res, next) => {
  // Skip API routes or other special paths if needed
  if (req.path.startsWith("/api/")) {
    return next();
  }

  const filePath = path.join(__dirname, `${req.path}.html`);
  
  // Send the HTML file, or continue to next middleware if file doesn't exist
  res.sendFile(filePath, (err) => {
    if (err) {
      // If the file doesn't exist, try index.html for the root path
      // or continue to next middleware for other paths
      if (req.path === "/") {
        res.sendFile(path.join(__dirname, "home.html"));
      } else {
        next();
      }
    }
  });
});

// Fallback to 404 page if available, otherwise show a simple error message
app.use((req, res) => {
  const notFoundPath = path.join(__dirname, "404.html");
  
  res.status(404).sendFile(notFoundPath, (err) => {
    if (err) {
      res.status(404).send("Page not found");
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log("\n=== Clean URL Development Server ===");
  console.log(`Server running at http://localhost:${port}`);
  console.log("\nURL Examples:");
  console.log("- / -> serves home.html (main page)");
  console.log("- /portfolio -> serves portfolio.html");
  console.log("- /commissions -> serves commissions.html");
  console.log("- /conventions -> serves conventions.html");
  console.log("\nThis mimics Netlify's clean URL behavior locally.");
  console.log("=================================\n");
});
