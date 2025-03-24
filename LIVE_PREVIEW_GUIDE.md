# Live Preview Guide: Real-Time Editing with Clean URLs

This guide explains how to set up and use Live Server for real-time editing while maintaining clean URLs (without `.html` extensions) in your local development environment.

## Setup Instructions

### 1. Install the Live Server Extension

If you haven't already, install the Live Server extension for VS Code:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "Live Server" by Ritwick Dey
4. Click Install

### 2. Install the Clean URL Middleware

We've provided a script that installs the necessary middleware for Live Server to support clean URLs:

```bash
node install-live-server-middleware.js
```

This script adds a custom middleware to Live Server that automatically appends `.html` to URLs without file extensions.

### 3. Configure Live Server

The `.vscode/live-server.json` file is already configured with the clean URL middleware:

```json
{
  "port": 5501,
  "host": "localhost",
  "open": false,
  "file": "home.html",
  "middleware": [
    {
      "route": "/",
      "handle": {
        "middleware": "clean-urls"
      }
    }
  ]
}
```

### 4. Update Your HTML Files

For clean URLs to work properly, make these changes to your HTML files:

1. **Add a base href tag** to the `<head>` section of each HTML file:

   ```html
   <head>
     <base href="/">
     <!-- other head elements -->
   </head>
   ```

2. **Use absolute paths** for all internal links:

   ```html
   <!-- Correct (with leading slash) -->
   <a href="/home">Home</a>
   <a href="/portfolio">Portfolio</a>

   <!-- Incorrect (without leading slash) -->
   <a href="home">Home</a>
   <a href="portfolio">Portfolio</a>
   ```

3. **Use absolute paths for assets** like images, CSS, and JavaScript:

   ```html
   <!-- Correct -->
   <img src="/images/logo.png">
   <link rel="stylesheet" href="/css/styles.css">

   <!-- Incorrect -->
   <img src="images/logo.png">
   <link rel="stylesheet" href="css/styles.css">
   ```

## Using Live Server

### Starting Live Server

1. Right-click on any HTML file in VS Code
2. Select "Open with Live Server"
3. Your default browser will open with the selected page

Alternatively, click the "Go Live" button in the status bar at the bottom of VS Code.

### Testing Clean URLs

1. Navigate to `http://localhost:5501/live-server-test.html`
2. Click on the navigation links to test if the clean URLs work correctly
3. You should be able to navigate between pages without seeing `.html` in the URL

### Real-Time Editing

1. Make changes to your HTML, CSS, or JavaScript files
2. Save the file
3. Live Server will automatically refresh the browser to show your changes

## Troubleshooting

### Common Issues

1. **Can't navigate back to home page**
   - Make sure all links use absolute paths (starting with `/`)
   - Verify you have a `<base href="/">` tag in your HTML files

2. **Images or assets not loading**
   - Check that asset paths are absolute (e.g., `/images/logo.png`)
   - Verify the file exists at the specified path

3. **404 errors when navigating**
   - Ensure the target HTML file exists
   - Check that the URL is correct and matches your file structure

4. **Live Server not refreshing**
   - Make sure you've saved your files
   - Check if there are any console errors
   - Restart Live Server if needed

### Restarting Live Server

If you encounter issues with Live Server:

1. Click the "Port: 5501" button in the VS Code status bar
2. Select "Stop Server"
3. Start Live Server again as described above

## Differences from Production

While this setup mimics the clean URL behavior of your production environment, there are some differences:

1. **Port number**: Live Server uses port 5501 by default, while the Express server uses port 5500
2. **Middleware implementation**: Live Server uses a custom middleware, while Netlify uses redirect rules
3. **Performance**: Live Server is optimized for development, not production use

For a more production-like environment, use the Express server (`npm start` or `npm run dev`).

## Additional Resources

- [Live Server Extension Documentation](https://github.com/ritwickdey/vscode-live-server)
- [Clean URL Setup Guide](./CLEAN_URL_SETUP.md) for the Express server
- [Netlify Redirects Documentation](https://docs.netlify.com/routing/redirects/)
