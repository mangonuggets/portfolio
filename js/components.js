/**
 * Components.js
 * 
 * This script loads the web components for the site header and footer.
 * It uses modern web components instead of fetch-based includes for better performance.
 */

// Import the web components
import "./components/header-component.js";
import "./components/footer-component.js";

// Initialize components when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM content loaded, initializing components...");
    
    // Check if the components are loaded
    if (customElements.get("site-header") && customElements.get("site-footer")) {
        console.log("Web components registered successfully");
    } else {
        console.error("Web components failed to register");
        
        // Fallback: Try to re-import the components
        import("./components/header-component.js").catch(err => console.error("Failed to load header component:", err));
        import("./components/footer-component.js").catch(err => console.error("Failed to load footer component:", err));
    }
});
/**
 * Adds CSS styles needed for the components
 * This ensures that component-specific styles are available even if they're not in the main CSS
 */
function addComponentStyles() {
    // Check if styles are already added
    if (document.getElementById("component-styles")) {
        return;
    }
    
    // Create style element
    const style = document.createElement("style");
    style.id = "component-styles";
    style.textContent = `
        /* Menu animation styles */
        .menu-active {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Navigation link styles */
        .nav-link {
            position: relative;
            padding-bottom: 0.25rem;
            transition: color 0.3s ease;
        }
        
        .nav-link:hover {
            color: #f472b6;
        }
        
        /* Dropdown styles */
        .dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            background-color: white;
            border-radius: 0.375rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
            z-index: 50;
        }
        
        .group:hover .dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .dropdown-item {
            display: block;
            padding: 0.5rem 1rem;
            color: #4b5563;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        .dropdown-item:hover {
            background-color: #f9fafb;
            color: #f472b6;
        }
    `;
    
    // Add to document head
    document.head.appendChild(style);
    console.log("Component styles added to document");
}

// Add component styles when DOM is loaded
document.addEventListener("DOMContentLoaded", addComponentStyles);

/**
 * Debug utility to check component registration status
 * This helps diagnose issues with web components not being properly registered
 */
function debugComponentStatus() {
    console.group("Web Component Status Check");
    
    // Check if the components are defined
    const headerDefined = customElements.get("site-header") !== undefined;
    const footerDefined = customElements.get("site-footer") !== undefined;
    
    console.log(`site-header defined: ${headerDefined}`);
    console.log(`site-footer defined: ${footerDefined}`);
    
    // Check if the components are in the DOM
    const headerElements = document.querySelectorAll("site-header");
    const footerElements = document.querySelectorAll("site-footer");
    
    console.log(`site-header elements found: ${headerElements.length}`);
    console.log(`site-footer elements found: ${footerElements.length}`);
    
    // Check for any errors in component rendering
    if (headerElements.length > 0 && headerElements[0].innerHTML === "") {
        console.warn("site-header is empty - render method may have failed");
    }
    
    if (footerElements.length > 0 && footerElements[0].innerHTML === "") {
        console.warn("site-footer is empty - render method may have failed");
    }
    
    console.groupEnd();
}

// Run debug check after a delay to ensure components have had time to render
setTimeout(debugComponentStatus, 1000);
