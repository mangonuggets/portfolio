/**
 * Image Optimizer Utility
 * 
 * This utility provides functions to optimize images using Netlify's image transformation parameters.
 * It allows for automatic resizing, format conversion, and quality adjustments for images.
 */

/**
 * Adds Netlify image transformation parameters to an image URL
 * 
 * @param {string} url - The original image URL
 * @param {Object} options - Configuration options for the transformation
 * @param {number} [options.width] - The desired width of the image
 * @param {number} [options.height] - The desired height of the image
 * @param {string} [options.fit="cover"] - The fit mode: "cover", "contain", "fill", "inside", or "outside"
 * @param {number} [options.quality=85] - The quality of the image (1-100)
 * @param {string} [options.format="auto"] - The desired format: "auto", "webp", "avif", or "original"
 * @returns {string} - The transformed image URL
 */
function optimizeImage(url, options = {}) {
  // Skip optimization for external URLs or SVGs
  if (!url || url.startsWith("http") || url.startsWith("data:") || url.endsWith(".svg")) {
    return url;
  }

  // Check if we have a pre-optimized version from the build process
  if (window.optimizedImageManifest && window.optimizedImageManifest.images) {
    // Normalize the URL for matching
    let normalizedUrl = url.replace(/\\/g, "/");
    
    // Remove leading slash if present for matching
    if (normalizedUrl.startsWith("/")) {
      normalizedUrl = normalizedUrl.substring(1);
    }
    
    // Try to find a match in the optimization manifest
    let optimizedData = null;
    
    // First try exact match
    for (const [key, data] of Object.entries(window.optimizedImageManifest.images)) {
      const normalizedKey = key.replace(/\\/g, "/");
      if (normalizedKey.includes(normalizedUrl) || normalizedUrl.includes(normalizedKey.split("/").pop())) {
        optimizedData = data;
        break;
      }
    }
    
    if (optimizedData && optimizedData.optimized) {
      // Determine best format based on browser support
      const format = supportsAvif() ? "avif" : (supportsWebP() ? "webp" : "original");
      
      // Find the closest size match
      const targetWidth = options.width || 640; // Default to 640 if no width specified
      const availableSizes = optimizedData.optimized[format] ? 
                            Object.keys(optimizedData.optimized[format]).map(Number) : 
                            [];
      
      if (availableSizes.length > 0) {
        // Find the best size match
        const bestSize = availableSizes.reduce((prev, curr) => {
          return (Math.abs(curr - targetWidth) < Math.abs(prev - targetWidth)) ? curr : prev;
        });
        
        const optimizedPath = optimizedData.optimized[format][bestSize].path;
        console.log(`Using optimized image: ${optimizedPath} (${format}, ${bestSize}px) for ${url}`);
        return "/" + optimizedPath; // Ensure leading slash for web paths
      }
    }
  }

  // Default options
  const defaults = {
    width: null,
    height: null,
    fit: "cover",
    quality: 85,
    format: "auto"
  };

  // Merge defaults with provided options
  const settings = { ...defaults, ...options };
  
  // Start building the query parameters
  const params = [];
  
  // Add width parameter if specified
  if (settings.width) {
    params.push(`nf_resize=fit&w=${settings.width}`);
  }
  
  // Add height parameter if specified
  if (settings.height) {
    params.push(`h=${settings.height}`);
  }
  
  // Add fit parameter if it's not the default
  if (settings.fit !== "cover") {
    params.push(`fit=${settings.fit}`);
  }
  
  // Add quality parameter if it's not the default
  if (settings.quality !== 85) {
    params.push(`q=${settings.quality}`);
  }
  
  // Determine best format based on browser support
  if (settings.format === "auto") {
    if (supportsAvif()) {
      settings.format = "avif";
    } else if (supportsWebP()) {
      settings.format = "webp";
    } else {
      settings.format = "original";
    }
  }
  
  // Add format parameter if it's not the default
  if (settings.format !== "auto") {
    params.push(`fm=${settings.format}`);
  }
  
  // Construct the final URL with parameters
  const separator = url.includes("?") ? "&" : "?";
  return params.length > 0 ? `${url}${separator}${params.join("&")}` : url;
}

/**
 * Detects WebP support in the browser
 * @returns {boolean} - Whether the browser supports WebP
 */
function supportsWebP() {
  // Use cached result if available
  if (typeof window._supportsWebP !== 'undefined') {
    return window._supportsWebP;
  }
  
  // Check for WebP support
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    // Chrome added WebP support in version 23
    window._supportsWebP = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    return window._supportsWebP;
  }
  
  // Canvas not supported
  window._supportsWebP = false;
  return false;
}

/**
 * Detects AVIF support in the browser
 * @returns {boolean} - Whether the browser supports AVIF
 */
function supportsAvif() {
  // Use cached result if available
  if (typeof window._supportsAvif !== 'undefined') {
    return window._supportsAvif;
  }
  
  // Feature detection for AVIF
  const img = new Image();
  img.onload = function() {
    window._supportsAvif = img.width > 0 && img.height > 0;
  };
  img.onerror = function() {
    window._supportsAvif = false;
  };
  // Base64 representation of a 1x1 AVIF image
  img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  
  // Default to false until we know for sure
  window._supportsAvif = false;
  return false;
}

/**
 * Creates a responsive image URL set for different screen sizes
 * 
 * @param {string} url - The original image URL
 * @param {Array<number>} sizes - Array of widths to generate
 * @param {Object} options - Additional options for the transformation
 * @returns {string} - The srcset attribute value
 */
function createSrcSet(url, sizes = [320, 640, 960, 1280, 1920], options = {}) {
  if (!url) return "";
  
  return sizes
    .map(size => {
      const imgUrl = optimizeImage(url, { ...options, width: size });
      return `${imgUrl} ${size}w`;
    })
    .join(", ");
}

/**
 * Applies responsive image optimization to all images on the page
 * This can be called after the DOM is loaded to automatically optimize all images
 */
function optimizeAllImages() {
  // Load the optimized image manifest if available
  loadOptimizedImageManifest();
  
  // Process regular images
  document.querySelectorAll("img:not([data-no-optimize])").forEach(img => {
    const src = img.getAttribute("src");
    if (!src) return;
    
    // Get width from data-width attribute, natural dimensions, or width attribute
    const dataWidth = img.getAttribute("data-width");
    const width = dataWidth || img.naturalWidth || img.getAttribute("width");
    
    // Create options based on image attributes or defaults
    const options = {
      width: width ? parseInt(width) : null,
      quality: parseInt(img.getAttribute("data-quality") || 85)
    };
    
    // Apply optimization
    const optimizedSrc = optimizeImage(src, options);
    img.setAttribute("src", optimizedSrc);
    
    // Add srcset for responsive images if the image doesn't already have one
    if (!img.hasAttribute("srcset") && !img.hasAttribute("data-no-srcset")) {
      const sizes = [320, 640, 960, 1280];
      const srcSet = createSrcSet(src, sizes, { quality: options.quality });
      img.setAttribute("srcset", srcSet);
      
      // Add sizes attribute if not present
      if (!img.hasAttribute("sizes")) {
        img.setAttribute("sizes", "(max-width: 768px) 100vw, 50vw");
      }
    }
    
    // Add lazy loading if not already specified
    if (!img.hasAttribute("loading") && !img.hasAttribute("data-no-lazy")) {
      img.setAttribute("loading", "lazy");
    }
    
    // Add decoding attribute for better performance
    if (!img.hasAttribute("decoding")) {
      img.setAttribute("decoding", "async");
    }
  });
  
  // Process background images in inline styles
  document.querySelectorAll("[style*='background-image']").forEach(el => {
    const style = el.getAttribute("style");
    const match = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
    
    if (match && match[1]) {
      const url = match[1];
      const optimizedUrl = optimizeImage(url);
      const newStyle = style.replace(url, optimizedUrl);
      el.setAttribute("style", newStyle);
    }
  });
}

/**
 * Loads the optimized image manifest if available
 */
function loadOptimizedImageManifest() {
  if (window.optimizedImageManifest) return Promise.resolve();
  
  return fetch('image-optimization-manifest.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Optimized image manifest not found');
      }
      return response.json();
    })
    .then(data => {
      window.optimizedImageManifest = data;
      console.log('Loaded optimized image manifest with', 
                 Object.keys(data.images || {}).length, 'images');
      return data;
    })
    .catch(error => {
      console.warn('Could not load optimized image manifest:', error);
      window.optimizedImageManifest = { images: {} };
      return { images: {} };
    });
}

// Export functions for use in other scripts
window.imageOptimizer = {
  optimizeImage,
  createSrcSet,
  optimizeAllImages,
  supportsWebP,
  supportsAvif
};

// Automatically optimize images when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Wait a short time to ensure all images are properly loaded in the DOM
  setTimeout(optimizeAllImages, 100);
  
  // Set up intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          
          // Handle data-src attribute if present
          if (lazyImage.dataset.src) {
            lazyImage.src = optimizeImage(lazyImage.dataset.src);
            delete lazyImage.dataset.src;
          }
          
          // Handle data-srcset attribute if present
          if (lazyImage.dataset.srcset) {
            lazyImage.srcset = lazyImage.dataset.srcset;
            delete lazyImage.dataset.srcset;
          }
          
          // Handle data-background attribute if present
          if (lazyImage.dataset.background) {
            lazyImage.style.backgroundImage = `url('${optimizeImage(lazyImage.dataset.background)}')`;
            delete lazyImage.dataset.background;
          }
          
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });
    
    // Observe all elements with lazy class
    document.querySelectorAll('.lazy').forEach(lazyImage => {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    // Load all lazy images immediately
    document.querySelectorAll('.lazy').forEach(lazyImage => {
      if (lazyImage.dataset.src) {
        lazyImage.src = optimizeImage(lazyImage.dataset.src);
      }
      if (lazyImage.dataset.srcset) {
        lazyImage.srcset = lazyImage.dataset.srcset;
      }
      if (lazyImage.dataset.background) {
        lazyImage.style.backgroundImage = `url('${optimizeImage(lazyImage.dataset.background)}')`;
      }
      lazyImage.classList.remove("lazy");
    });
  }
});
