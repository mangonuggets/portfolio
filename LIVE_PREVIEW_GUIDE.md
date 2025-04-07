# Live Preview Guide

This guide explains how to set up and use Live Server with clean URLs for local development.

## Setting Up Live Server with Clean URLs

The website uses clean URLs (without .html extensions) in production. To ensure a consistent experience during local development, we've configured Live Server to support clean URLs as well.

### Prerequisites

- VS Code with the Live Server extension installed
- Node.js installed on your system

### Installation Steps

1. Run the middleware installation script:

```bash
node install-live-server-middleware.js
```

This script installs a custom middleware for Live Server that handles clean URLs by rewriting them internally.

2. Verify that your `.vscode/live-server.json` file contains the middleware configuration:

```json
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
```

### How It Works

The clean-urls middleware performs the following operations:

1. Intercepts requests without file extensions (e.g., `/portfolio`)
2. Checks if a corresponding HTML file exists (e.g., `portfolio.html`)
3. If found, rewrites the request internally to include the .html extension
4. Special handling for `/index` to redirect to the root URL (`/`)

This allows you to use clean URLs like `/portfolio` and `/commissions` in your local development environment, just like in production.

## Using Live Server

### Starting the Server

You can start Live Server in VS Code by:

1. Right-clicking on `index.html` and selecting "Open with Live Server"
2. Clicking the "Go Live" button in the status bar
3. Using the keyboard shortcut (Alt+L Alt+O)

### Testing Clean URLs

Once Live Server is running, you can test clean URLs by navigating to:

- http://localhost:5501/ (home page)
- http://localhost:5501/portfolio (portfolio page)
- http://localhost:5501/commissions (commissions page)
- http://localhost:5501/conventions (conventions page)

### Troubleshooting

If clean URLs aren't working:

1. Verify that the middleware is installed correctly by checking for the file at:
   `%APPDATA%\npm\node_modules\live-server\middleware\clean-urls.js`

2. Restart Live Server after making any configuration changes

3. Check the terminal output for any error messages from the middleware

4. If you're still having issues, you can temporarily revert to using .html extensions in your links during development
