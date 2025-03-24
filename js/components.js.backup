/**
 * Components.js
 * 
 * This script loads the web components for the site header and footer.
 * It uses modern web components instead of fetch-based includes for better performance.
 */

// Import the web components
import "./components/header-component.js";
import "./components/footer-component.js";

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM content loaded, initializing components...");
    
    // Check if the components are loaded
    if (customElements.get("site-header") && customElements.get("site-footer")) {
        console.log("Web components registered successfully");
    } else {
        console.error("Web components failed to register");
    }
});

/**
 * Sets up the mobile menu toggle functionality
 * This function adds event listeners to the mobile menu button
 * to toggle the visibility of the mobile menu and close when clicking outside
 */
function setupMobileMenu() {
    console.log("Setting up mobile menu...");
    
    // Try to get the header container
    const headerContainer = document.getElementById("header");
    if (!headerContainer) {
        console.error("Header container not found. Mobile menu setup failed.");
        return;
    }
    
    console.log("Header container found");
    
    // Find the mobile menu button by class if it exists
    const mobileMenuButton = document.querySelector("button.md\\:hidden") || document.getElementById("mobile-menu-button");
    if (!mobileMenuButton) {
        console.error("Mobile menu button not found. Mobile menu setup failed.");
        return;
    }
    
    console.log("Mobile menu button found");
    
    // Try to find the mobile menu by ID or by selector within the header
    let mobileMenu = document.getElementById("mobile-menu");
    
    // If not found by ID, try to find it by class/selector within the header
    if (!mobileMenu) {
        console.log("Mobile menu not found by ID, trying alternative selectors");
        mobileMenu = headerContainer.querySelector(".fixed.inset-x-0.top-16");
        
        if (!mobileMenu) {
            console.error("Mobile menu element not found by any selector");
            
            // Create the mobile menu if it doesn't exist
            console.log("Creating mobile menu element");
            mobileMenu = document.createElement("div");
            mobileMenu.id = "mobile-menu";
            mobileMenu.className = "hidden fixed inset-x-0 top-16 bg-white shadow-lg z-[60] transition-all duration-300 ease-in-out";
            mobileMenu.innerHTML = `
                <nav class="flex flex-col space-y-4 p-4">
                    <a href="home" class="nav-link-mobile font-medium py-2 px-4">Home</a>
                    
                    <div class="relative">
                        <a href="portfolio" class="nav-link-mobile font-medium py-2 px-4 flex items-center justify-between">
                            Portfolio
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </a>
                        <div class="pl-4">
                            <a href="portfolio?category=illustration" class="nav-link-mobile font-medium py-2 px-4 block">Illustration</a>
                            <a href="portfolio?category=chibi" class="nav-link-mobile font-medium py-2 px-4 block">Chibi</a>
                        </div>
                    </div>
                    
                    <a href="commissions" class="nav-link-mobile font-medium py-2 px-4">Commissions</a>
                    <a href="conventions" class="nav-link-mobile font-medium py-2 px-4">Conventions</a>
                </nav>
            `;
            
            // Append to the header container
            headerContainer.appendChild(mobileMenu);
            console.log("Mobile menu created and appended to header");
        } else {
            console.log("Mobile menu found using alternative selector");
        }
    }

    // Get all mobile menu triggers
    const portfolioDropdown = mobileMenu.querySelector(".relative");
    const portfolioToggle = portfolioDropdown?.querySelector("a[href='portfolio']");
    
    console.log("Setting up mobile menu event listeners");
    
    // Set initial ARIA state
    mobileMenuButton.setAttribute("aria-expanded", "false");
    mobileMenuButton.setAttribute("aria-controls", "mobile-menu");
    
    // Remove any existing click event listeners by using a new function
    mobileMenuButton.onclick = null;
    
    /**
     * Closes the mobile menu
     */
    const closeMenu = () => {
        mobileMenuButton.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove('menu-active');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 300);
        console.log("Mobile menu closed");
    };
    
    /**
     * Opens the mobile menu
     */
    const openMenu = () => {
        mobileMenuButton.setAttribute("aria-expanded", "true");
        mobileMenu.classList.remove('hidden');
        requestAnimationFrame(() => {
            mobileMenu.classList.add('menu-active');
        });
        console.log("Mobile menu opened");
    };
    
    /**
     * Handles document clicks to close menu when clicking outside
     * @param {MouseEvent} event - The click event
     */
    const handleDocumentClick = (event) => {
        // Only process if menu is open
        if (mobileMenuButton.getAttribute("aria-expanded") === "true") {
            // Check if click is outside menu and button
            if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
                closeMenu();
            }
        }
    };
    
    // Handle escape key press
    const handleEscapeKey = (event) => {
        if (event.key === "Escape" && mobileMenuButton.getAttribute("aria-expanded") === "true") {
            closeMenu();
        }
    };

    // Clean up existing event listeners
    document.removeEventListener("click", handleDocumentClick);
    document.removeEventListener("keydown", handleEscapeKey);
    
    // Add new listeners
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEscapeKey);
    
    // Add click event listener to toggle button
    mobileMenuButton.addEventListener("click", (event) => {
        console.log("Mobile menu button clicked");
        event.stopPropagation(); // Prevent immediate closing
        
        // Toggle menu visibility
        const isExpanded = mobileMenuButton.getAttribute("aria-expanded") === "true";
        
        if (isExpanded) {
            closeMenu();
        } else {
            openMenu();
        }
        
        console.log("Mobile menu toggled, expanded:", !isExpanded);
    });
    
    console.log("Mobile menu setup complete");
}

/**
 * Loads a component into the specified element
 * 
 * @param {string} elementId - The ID of the element to load the component into
 * @param {string} componentPath - The path to the component HTML file
 * @param {Function} [callback] - Optional callback function to execute after component is loaded
 * @returns {Promise<void>} A promise that resolves when the component is loaded
 */
function loadComponent(elementId, componentPath, callback) {
    console.log(`Loading component "${componentPath}" into element with id "${elementId}"...`);
    
    return new Promise((resolve, reject) => {
        const element = document.getElementById(elementId);
        if (!element) {
            const error = `Element with id "${elementId}" not found`;
            console.error(error);
            reject(error);
            return;
        }

        fetch(componentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} when fetching ${componentPath}`);
                }
                return response.text();
            })
            .then(html => {
                element.innerHTML = html;
                console.log(`Component "${componentPath}" loaded successfully`);
                
                // Execute callback if provided
                if (typeof callback === "function") {
                    console.log(`Executing callback for "${componentPath}"`);
                    callback();
                }
                
                resolve();
            })
            .catch(error => {
                console.error(`Failed to load component "${componentPath}":`, error);
                reject(error);
            });
    });
}

/**
 * Highlights the active page in the navigation
 */
function highlightActivePage() {
    // Get the current page path
    const currentPath = window.location.pathname;
    
    // Extract the page name without extension
    let pageName = currentPath.split("/").pop() || "home";
    
    // Remove .html extension if present
    pageName = pageName.replace(/\.html$/, "");
    
    // Map index to home for consistency
    if (pageName === "index") {
        pageName = "home";
    }
    
    // Check if there's a category parameter for portfolio page
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    
    // Highlight the active page in desktop navigation
    const navLinks = {
        "home": document.getElementById("nav-home"),
        "portfolio": document.getElementById("nav-portfolio"),
        "commissions": document.getElementById("nav-commissions"),
        "conventions": document.getElementById("nav-conventions")
    };
    
    // Highlight the active page in mobile navigation
    const mobileNavLinks = {
        "home": document.getElementById("mobile-nav-home"),
        "portfolio": document.getElementById("mobile-nav-portfolio"),
        "commissions": document.getElementById("mobile-nav-commissions"),
        "conventions": document.getElementById("mobile-nav-conventions")
    };
    
    // Remove active class from all links
    Object.values(navLinks).forEach(link => {
        if (link) {
            link.classList.remove("text-pastel-pink-dark", "border-b-2", "border-pastel-pink-dark");
        }
    });
    
    Object.values(mobileNavLinks).forEach(link => {
        if (link) {
            link.classList.remove("text-pastel-pink-dark");
        }
    });
    
    // Add active class to current page link
    if (navLinks[pageName]) {
        navLinks[pageName].classList.add("text-pastel-pink-dark", "border-b-2", "border-pastel-pink-dark");
    }
    
    if (mobileNavLinks[pageName]) {
        mobileNavLinks[pageName].classList.add("text-pastel-pink-dark");
    }
    
    // Mobile menu is now handled by setupMobileMenu()
}

/**
 * Sets the current year in the footer copyright text
 */
function setCurrentYear() {
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}
