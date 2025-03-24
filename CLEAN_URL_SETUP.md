# Clean URL Setup for Local Development

This document explains how to use the clean URL development server for local development, which mimics Netlify's URL handling behavior.

## Quick Start for Live Preview

For real-time editing with Live Server:

1. Use absolute paths in your HTML links (starting with `/`):
   ```html
   <a href="/home">Home</a>
   <a href="/portfolio">Portfolio</a>
   ```

2. Add a base href tag to your HTML files:
   ```html
   <head>
     <base href="/">
     <!-- other head elements -->
   </head>
   ```

3. Start Live Server and navigate to any page

## What This Solves

When deploying to Netlify, URLs like `/home` and `/portfolio` work without the `.html` extension due to Netlify's redirect rules in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/:splat.html"
  status = 200
```

However, standard local development servers like Live Server don't process these redirect rules, causing navigation issues when clicking links without `.html` extensions.

## Solution: Express Development Server

We've implemented a custom Express server that handles clean URLs locally, just like Netlify does in production.

## How to Use

### Starting the Server

```bash
# Standard start
npm start

# Development mode with auto-restart on file changes
npm run dev
```

### Available URLs

The server automatically serves HTML files without requiring the `.html` extension:

- http://localhost:5500/ → serves home.html (main page)
- http://localhost:5500/portfolio → serves portfolio.html
- http://localhost:5500/commissions → serves commissions.html
- http://localhost:5500/conventions → serves conventions.html

Legacy URLs like `/home` and `/index.html` are redirected to the root URL.

### Legacy Mode

If you prefer to use the original Live Server setup (with `.html` extensions required):

```bash
npm run start:live
# or
npm run dev:live
```

## How It Works

The Express server:

1. Serves static files from the project root
2. Redirects the root path (`/`) to `/home` for consistent navigation
3. For URLs without file extensions (like `/home`), it automatically looks for the corresponding `.html` file
4. Provides a custom 404 page for routes that don't exist
5. Logs all requests to the console for debugging

## Live Server Configuration

The Live Server setup uses a custom middleware that:

1. Automatically adds `.html` extensions to URLs without extensions
2. Works with the `<base href="/">` tag to ensure proper asset loading
3. Supports absolute paths in navigation links (e.g., `/home` instead of `home`)

## Technical Details

The implementation is in `server.js` and uses:

- Express.js for the server framework
- Path module for file path handling
- Regular expressions to match routes without extensions

## Troubleshooting

If you encounter any issues:

1. Check the console output for error messages
2. Verify that all dependencies are installed (`npm install`)
3. Make sure no other server is running on port 5500
4. If needed, change the port in `server.js` and update the npm scripts accordingly

### Common Issues

- **Can't navigate back to home page**: Make sure all links use absolute paths (starting with `/`) and you have a `<base href="/">` tag in your HTML files.
- **Images not loading**: Check that image paths are also absolute (e.g., `/images/logo.png` instead of `images/logo.png`).
- **404 errors**: Verify that the target HTML file exists and the URL is correct.
