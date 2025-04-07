# Clean URL Setup

This document explains how clean URLs (without .html extensions) are implemented on the website.

## Overview

Clean URLs improve user experience and SEO by making URLs more readable and user-friendly. For example, instead of:
```
https://example.com/portfolio.html
```

The URL becomes:
```
https://example.com/portfolio
```

## Implementation

### 1. Netlify Configuration

The `netlify.toml` file contains redirect rules that handle clean URLs:

```toml
# Redirect /index to root
[[redirects]]
  from = "/index"
  to = "/"
  status = 301
  force = true

# Handle clean URLs (without .html)
[[redirects]]
  from = "/:page"
  to = "/:page.html"
  status = 200
  force = false
```

These rules:
- Redirect `/index` to the root URL (`/`)
- Serve the appropriate HTML file when a clean URL is requested (e.g., `/portfolio` serves `portfolio.html`)

### 2. Internal Links

All internal links in the website have been updated to use clean URLs:

- `/` instead of `index.html` or `home.html`
- `/portfolio` instead of `portfolio.html`
- `/commissions` instead of `commissions.html`
- `/conventions` instead of `conventions.html`

### 3. Navigation Highlighting

The navigation highlighting logic has been updated to work with clean URLs:

```javascript
// Get the current page path
let currentPath = window.location.pathname;

// Remove trailing slash if present
if (currentPath.endsWith("/") && currentPath !== "/") {
    currentPath = currentPath.slice(0, -1);
}

// Default to home if on root path
const activePage = currentPath === "/" ? "home" : currentPath.split("/").pop();
```

## Local Development

For local development with clean URLs, we've set up a custom middleware for Live Server:

1. The `install-live-server-middleware.js` script installs a middleware that handles clean URLs
2. The `.vscode/live-server.json` file is configured to use this middleware

See the [Live Preview Guide](./LIVE_PREVIEW_GUIDE.md) for detailed instructions on setting up and using Live Server with clean URLs.

## Troubleshooting

If you encounter issues with clean URLs:

1. Check that all internal links use the clean URL format
2. Verify the Netlify redirect rules are correctly configured
3. Ensure the navigation highlighting logic correctly identifies the current page
