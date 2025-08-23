/**
 * Mobile Performance Optimizer
 * 
 * This script implements comprehensive mobile performance optimizations including:
 * - Critical CSS extraction and inlining
 * - Resource preloading and prefetching
 * - Font optimization
 * - JavaScript bundling and minification
 * - Service worker generation
 * - Mobile-first image optimization
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Configuration for mobile optimization
 */
const config = {
  // Critical CSS viewport dimensions for mobile
  criticalViewport: {
    width: 375,
    height: 667
  },
  
  // Files to optimize
  htmlFiles: ['*.html'],
  cssFiles: ['css/styles.css'],
  jsFiles: ['js/**/*.js'],
  
  // Output directories
  outputDir: 'dist',
  
  // Performance budgets (bytes)
  budgets: {
    criticalCSS: 14000,  // 14KB critical CSS limit
    totalCSS: 50000,     // 50KB total CSS limit
    totalJS: 100000,     // 100KB total JS limit
    images: 500000       // 500KB per image limit
  },
  
  // Font optimization settings
  fontOptimization: {
    preloadFonts: [
      'Montserrat:400,500,600,700',
      'Playfair+Display:400,500,600,700'
    ],
    fontDisplay: 'swap'
  }
};

/**
 * Extracts critical CSS for above-the-fold content
 * @param {string} htmlContent - HTML content to analyze
 * @param {string} cssContent - CSS content to extract from
 * @returns {string} Critical CSS
 */
function extractCriticalCSS(htmlContent, cssContent) {
  const criticalSelectors = new Set();
  
  // Extract classes used in HTML
  const classMatches = htmlContent.match(/class="([^"]*)"/g) || [];
  classMatches.forEach(match => {
    const classes = match.replace(/class="([^"]*)"/, '$1').split(/\s+/);
    classes.forEach(cls => {
      if (cls.trim()) {
        criticalSelectors.add(`.${cls.trim()}`);
      }
    });
  });
  
  // Extract element selectors
  const elementMatches = htmlContent.match(/<(\w+)[^>]*>/g) || [];
  elementMatches.forEach(match => {
    const element = match.replace(/<(\w+)[^>]*>/, '$1').toLowerCase();
    criticalSelectors.add(element);
  });
  
  // Add critical base styles
  const criticalBaseSelectors = [
    '*', '::before', '::after', 'html', 'body',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'a', 'img', 'button', 'input',
    '.container', '.btn-primary', '.nav-link'
  ];
  
  criticalBaseSelectors.forEach(selector => {
    criticalSelectors.add(selector);
  });
  
  // Extract matching CSS rules
  let criticalCSS = '';
  const cssRules = cssContent.split('}');
  
  cssRules.forEach(rule => {
    if (!rule.trim()) return;
    
    const [selector, declarations] = rule.split('{');
    if (!selector || !declarations) return;
    
    const cleanSelector = selector.trim();
    
    // Check if this rule matches any critical selector
    let isCritical = false;
    for (const criticalSelector of criticalSelectors) {
      if (cleanSelector.includes(criticalSelector) || 
          criticalSelector.includes(cleanSelector.split(':')[0])) {
        isCritical = true;
        break;
      }
    }
    
    // Include media queries for mobile
    if (cleanSelector.includes('@media') && 
        (cleanSelector.includes('max-width') || cleanSelector.includes('min-width'))) {
      isCritical = true;
    }
    
    if (isCritical) {
      criticalCSS += `${cleanSelector}{${declarations}}\n`;
    }
  });
  
  return criticalCSS;
}

/**
 * Generates optimized font loading HTML
 * @returns {string} Font preload and CSS HTML
 */
function generateOptimizedFontLoading() {
  const fontPreloads = config.fontOptimization.preloadFonts.map(font => {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${font}&display=${config.fontOptimization.fontDisplay}`;
    return `<link rel="preload" href="${fontUrl}" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="${fontUrl}"></noscript>`;
  }).join('\n');
  
  return fontPreloads;
}

/**
 * Generates resource hints for better loading performance
 * @returns {string} Resource hints HTML
 */
function generateResourceHints() {
  return `
<!-- DNS prefetch for external resources -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//fonts.gstatic.com">
<link rel="dns-prefetch" href="//cdnjs.cloudflare.com">
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">
<link rel="dns-prefetch" href="//unpkg.com">

<!-- Preconnect to critical origins -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Preload critical resources -->
<link rel="preload" href="/css/styles.css" as="style">
<link rel="preload" href="/js/components.js" as="script">
<link rel="preload" href="/js/image-optimizer.js" as="script">`;
}

/**
 * Optimizes JavaScript loading with async/defer attributes
 * @param {string} htmlContent - HTML content to optimize
 * @returns {string} Optimized HTML content
 */
function optimizeJavaScriptLoading(htmlContent) {
  // Move non-critical scripts to defer
  let optimizedHTML = htmlContent;
  
  // Defer Google Analytics (non-critical)
  optimizedHTML = optimizedHTML.replace(
    /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-VED2NDYE7M"><\/script>/,
    '<script defer src="https://www.googletagmanager.com/gtag/js?id=G-VED2NDYE7M"></script>'
  );
  
  // Defer external libraries
  optimizedHTML = optimizedHTML.replace(
    /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/lightgallery@2\.7\.1\/lightgallery\.min\.js"><\/script>/,
    '<script defer src="https://cdn.jsdelivr.net/npm/lightgallery@2.7.1/lightgallery.min.js"></script>'
  );
  
  optimizedHTML = optimizedHTML.replace(
    /<script src="https:\/\/unpkg\.com\/masonry-layout@4\.2\.2\/dist\/masonry\.pkgd\.min\.js"><\/script>/,
    '<script defer src="https://unpkg.com/masonry-layout@4.2.2/dist/masonry.pkgd.min.js"></script>'
  );
  
  optimizedHTML = optimizedHTML.replace(
    /<script src="https:\/\/unpkg\.com\/imagesloaded@5\/imagesloaded\.pkgd\.min\.js"><\/script>/,
    '<script defer src="https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js"></script>'
  );
  
  return optimizedHTML;
}

/**
 * Generates a service worker for caching
 * @returns {string} Service worker content
 */
function generateServiceWorker() {
  return `
// Mobile-optimized service worker
const CACHE_NAME = 'portfolio-mobile-v1';
const CRITICAL_RESOURCES = [
  '/',
  '/css/styles.css',
  '/js/components.js',
  '/js/image-optimizer.js',
  '/images/logo/emote2.png'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CRITICAL_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then(fetchResponse => {
          // Cache successful responses
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));
          }
          return fetchResponse;
        });
      })
      .catch(() => {
        // Return offline fallback for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return new Response(
            '<h1>Offline</h1><p>Please check your internet connection.</p>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })
  );
});
`;
}

/**
 * Optimizes HTML file for mobile performance
 * @param {string} filePath - Path to HTML file
 */
async function optimizeHTMLFile(filePath) {
  try {
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const cssContent = fs.readFileSync('css/styles.css', 'utf8');
    
    // Extract critical CSS
    const criticalCSS = extractCriticalCSS(htmlContent, cssContent);
    
    // Check critical CSS size
    if (criticalCSS.length > config.budgets.criticalCSS) {
      console.warn(`Critical CSS exceeds budget: ${criticalCSS.length} bytes > ${config.budgets.criticalCSS} bytes`);
    }
    
    let optimizedHTML = htmlContent;
    
    // Add resource hints after <title>
    const titleMatch = optimizedHTML.match(/<title>.*?<\/title>/);
    if (titleMatch) {
      optimizedHTML = optimizedHTML.replace(
        titleMatch[0],
        titleMatch[0] + '\n' + generateResourceHints()
      );
    }
    
    // Replace Google Fonts with optimized loading
    optimizedHTML = optimizedHTML.replace(
      /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Montserrat:wght@300;400;500;600;700&family=Playfair\+Display:wght@400;500;600;700&display=swap" rel="stylesheet">/,
      generateOptimizedFontLoading()
    );
    
    // Inline critical CSS
    const criticalCSSTag = `<style id="critical-css">${criticalCSS}</style>`;
    optimizedHTML = optimizedHTML.replace(
      '<link rel="stylesheet" href="css/styles.css">',
      criticalCSSTag + '\n<link rel="preload" href="css/styles.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n<noscript><link rel="stylesheet" href="css/styles.css"></noscript>'
    );
    
    // Optimize JavaScript loading
    optimizedHTML = optimizeJavaScriptLoading(optimizedHTML);
    
    // Add service worker registration
    const serviceWorkerScript = `
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.log('SW registration failed'));
  });
}
</script>`;
    
    optimizedHTML = optimizedHTML.replace('</body>', serviceWorkerScript + '\n</body>');
    
    // Create output directory
    const outputDir = path.join(config.outputDir, 'mobile');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write optimized HTML
    const outputPath = path.join(outputDir, path.basename(filePath));
    fs.writeFileSync(outputPath, optimizedHTML);
    
    console.log(`Optimized ${filePath} for mobile -> ${outputPath}`);
    console.log(`Critical CSS size: ${criticalCSS.length} bytes`);
    
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error);
  }
}

/**
 * Main optimization function
 */
async function optimizeMobile() {
  try {
    console.log('Starting mobile optimization...');
    
    // Create output directory
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Generate service worker
    const serviceWorkerContent = generateServiceWorker();
    fs.writeFileSync('sw.js', serviceWorkerContent);
    console.log('Generated service worker: sw.js');
    
    // Get all HTML files
    const htmlFiles = await glob(config.htmlFiles[0]);
    
    // Optimize each HTML file
    for (const htmlFile of htmlFiles) {
      await optimizeHTMLFile(htmlFile);
    }
    
    console.log('Mobile optimization complete!');
    console.log(`Optimized ${htmlFiles.length} HTML files`);
    
  } catch (error) {
    console.error('Error during mobile optimization:', error);
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeMobile();
}

module.exports = {
  optimizeMobile,
  extractCriticalCSS,
  generateOptimizedFontLoading,
  generateResourceHints
};
