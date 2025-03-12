/**
 * Components.js
 * 
 * This script loads the header and footer components into each page
 * and adds logic to highlight the active page with an underline.
 */

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM content loaded, loading components...");
    
    Promise.all([
        loadComponent("header", "components/header.html"),
        loadComponent("footer", "components/footer.html")
    ]).then(() => {
        console.log("Components loaded successfully");
        highlightActivePage();
        setCurrentYear();
        
        // Increase the delay to ensure DOM is fully updated before setting up mobile menu
        console.log("Waiting for DOM to update before setting up mobile menu...");
        setTimeout(() => {
            setupMobileMenu();
        }, 300); // Increased from 100ms to 300ms
    }).catch(error => {
        console.error('Failed to load components:', error);
    });
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
    
    // Check if mobile menu exists, if not create it
    let mobileMenu = document.getElementById("mobile-menu");
    
    if (!mobileMenu) {
        console.log("Mobile menu not found, creating it");
        
        // Create the mobile menu element
        mobileMenu = document.createElement("div");
        mobileMenu.id = "mobile-menu";
        mobileMenu.className = "hidden fixed left-0 right-0 w-full bg-white shadow-lg z-40 transition-all duration-300 ease-in-out";
        
        // Create the inner content
        const menuContent = document.createElement("div");
        menuContent.className = "flex flex-col space-y-4 py-6 px-4";
        
        // Add menu items
        const menuItems = [
            { href: "index.html", id: "mobile-nav-home", text: "Home" },
            { href: "portfolio.html", id: "mobile-nav-portfolio", text: "Portfolio" },
            { href: "portfolio.html?category=illustration", text: "- Illustration", className: "pl-4" },
            { href: "portfolio.html?category=chibi", text: "- Chibi", className: "pl-4" },
            { href: "commissions.html", id: "mobile-nav-commissions", text: "Commissions" },
            { href: "conventions.html", id: "mobile-nav-conventions", text: "Conventions" }
        ];
        
        menuItems.forEach(item => {
            const link = document.createElement("a");
            link.href = item.href;
            link.className = `nav-link font-medium ${item.className || ""}`;
            if (item.id) link.id = item.id;
            link.textContent = item.text;
            menuContent.appendChild(link);
        });
        
        mobileMenu.appendChild(menuContent);
        
        // Add the mobile menu to the header container
        const headerElement = headerContainer.querySelector("header");
        if (headerElement) {
            const navContainer = headerElement.querySelector(".container");
            if (navContainer) {
                navContainer.appendChild(mobileMenu);
                console.log("Mobile menu added to the DOM");
            } else {
                console.error("Navigation container not found in header");
                return;
            }
        } else {
            console.error("Header element not found in header container");
            return;
        }
    }
    
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
    
    // Clean up any existing document click handlers
    document.removeEventListener("click", handleDocumentClick);
    
    // Add document click handler for outside clicks
    document.addEventListener("click", handleDocumentClick);
    
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
 */
function loadComponent(elementId, componentPath) {
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
    // Get the current page filename
    const currentPage = window.location.pathname.split("/").pop();
    
    // Default to index.html if no filename is found
    const activePage = currentPage || "index.html";
    
    // Check if there's a category parameter for portfolio page
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    
    // Highlight the active page in desktop navigation
    const navLinks = {
        "index.html": document.getElementById("nav-home"),
        "portfolio.html": document.getElementById("nav-portfolio"),
        "commissions.html": document.getElementById("nav-commissions"),
        "conventions.html": document.getElementById("nav-conventions")
    };
    
    // Highlight the active page in mobile navigation
    const mobileNavLinks = {
        "index.html": document.getElementById("mobile-nav-home"),
        "portfolio.html": document.getElementById("mobile-nav-portfolio"),
        "commissions.html": document.getElementById("mobile-nav-commissions"),
        "conventions.html": document.getElementById("mobile-nav-conventions")
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
    if (navLinks[activePage]) {
        navLinks[activePage].classList.add("text-pastel-pink-dark", "border-b-2", "border-pastel-pink-dark");
    }
    
    if (mobileNavLinks[activePage]) {
        mobileNavLinks[activePage].classList.add("text-pastel-pink-dark");
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
