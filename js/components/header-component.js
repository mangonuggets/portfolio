/**
 * Header Web Component
 * 
 * This component encapsulates the site header and navigation functionality.
 * It provides a more efficient way to include the header across multiple pages
 * without requiring fetch requests.
 */

class SiteHeader extends HTMLElement {
  /**
   * Constructor initializes the component
   */
  constructor() {
    super();
    this._isMenuOpen = false;
  }

  /**
   * Called when the element is added to the DOM
   */
  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.highlightActivePage();
  }

  /**
   * Renders the header HTML
   */
  render() {
    this.innerHTML = `
      <header class="bg-pastel-pink shadow-sm sticky top-0 z-50">
        <div class="container mx-auto px-4 py-3">
          <nav class="flex items-center justify-between">
            <!-- Logo -->
            <a href="/" class="flex items-center">
              <img src="${this.getBasePath()}images/logo/emote2.png" alt="Logo" class="h-10 w-auto">
            </a>
            
            <!-- Navigation Links -->
            <div class="hidden md:flex space-x-8">
              <!-- Home -->
              <a href="/" class="nav-link font-medium" id="nav-home">Home</a>
              
              <!-- Portfolio Dropdown -->
              <div class="relative group">
                <a href="${this.getBasePath()}portfolio" class="nav-link font-medium flex items-center" id="nav-portfolio">
                  Portfolio
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <div class="dropdown w-48 absolute top-full">
                  <div class="py-2">
                    <a href="${this.getBasePath()}portfolio?category=illustration" class="dropdown-item">Illustration</a>
                    <a href="${this.getBasePath()}portfolio?category=chibi" class="dropdown-item">Chibi</a>
                  </div>
                </div>
              </div>
              
              <!-- Commissions -->
              <a href="${this.getBasePath()}commissions" class="nav-link font-medium" id="nav-commissions">Commissions</a>
              
              <!-- Conventions -->
              <a href="${this.getBasePath()}conventions" class="nav-link font-medium" id="nav-conventions">Conventions</a>
            </div>
            
            <!-- Mobile Menu Button -->
            <button type="button" class="md:hidden focus:outline-none cursor-pointer" id="mobile-menu-button" aria-label="Toggle mobile menu" aria-expanded="false" aria-controls="mobile-menu">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>
          
          <!-- Mobile Menu (Hidden by default) -->
          <div id="mobile-menu" class="hidden fixed inset-x-0 top-16 bg-white shadow-lg z-[60] transition-all duration-300 ease-in-out">
            <nav class="flex flex-col space-y-4 p-4">
              <a href="/" class="nav-link-mobile font-medium py-2 px-4" id="mobile-nav-home">Home</a>
              
              <div class="relative">
                <a href="${this.getBasePath()}portfolio" class="nav-link-mobile font-medium py-2 px-4 flex items-center justify-between" id="mobile-nav-portfolio">
                  Portfolio
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <div class="pl-4">
                  <a href="${this.getBasePath()}portfolio?category=illustration" class="nav-link-mobile font-medium py-2 px-4 block">Illustration</a>
                  <a href="${this.getBasePath()}portfolio?category=chibi" class="nav-link-mobile font-medium py-2 px-4 block">Chibi</a>
                </div>
              </div>
              
              <a href="${this.getBasePath()}commissions" class="nav-link-mobile font-medium py-2 px-4" id="mobile-nav-commissions">Commissions</a>
              <a href="${this.getBasePath()}conventions" class="nav-link-mobile font-medium py-2 px-4" id="mobile-nav-conventions">Conventions</a>
            </nav>
          </div>
        </div>
      </header>
    `;
  }

  /**
   * Sets up event listeners for the mobile menu
   */
  setupEventListeners() {
    const mobileMenuButton = this.querySelector("#mobile-menu-button");
    const mobileMenu = this.querySelector("#mobile-menu");

    if (!mobileMenuButton || !mobileMenu) {
      console.error("Mobile menu elements not found");
      return;
    }

    // Toggle menu when button is clicked
    mobileMenuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this._isMenuOpen = !this._isMenuOpen;
      
      mobileMenuButton.setAttribute("aria-expanded", this._isMenuOpen.toString());
      
      if (this._isMenuOpen) {
        mobileMenu.classList.remove("hidden");
        requestAnimationFrame(() => {
          mobileMenu.classList.add("menu-active");
        });
      } else {
        mobileMenu.classList.remove("menu-active");
        setTimeout(() => {
          mobileMenu.classList.add("hidden");
        }, 300);
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (this._isMenuOpen && !mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
        this._isMenuOpen = false;
        mobileMenuButton.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("menu-active");
        setTimeout(() => {
          mobileMenu.classList.add("hidden");
        }, 300);
      }
    });

    // Close menu on escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this._isMenuOpen) {
        this._isMenuOpen = false;
        mobileMenuButton.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("menu-active");
        setTimeout(() => {
          mobileMenu.classList.add("hidden");
        }, 300);
      }
    });
  }

  /**
   * Gets the base path for assets based on the current URL
   * @returns {string} The base path prefix
   */
  getBasePath() {
    // Get the current path
    const path = window.location.pathname;
    
    // Count directory levels
    // Remove leading and trailing slashes, then count remaining slashes
    const normalizedPath = path.replace(/^\/|\/$/g, '');
    
    // If we're at root or there's no path, return empty string
    if (!normalizedPath) {
      return '';
    }
    
    // Count slashes to determine directory depth
    const slashCount = (normalizedPath.match(/\//g) || []).length;
    
    // If we're in a subdirectory (has at least one slash)
    if (slashCount >= 1) {
      // For each directory level, add "../"
      return '../'.repeat(slashCount + 1);
    }
    
    // If we're in a top-level page (no slashes)
    return '';
  }

  /**
   * Highlights the active page in the navigation
   */
  highlightActivePage() {
    // Get the current page path
    const currentPath = window.location.pathname;
    
    // Extract the page name without extension
    let pageName = currentPath.split("/").pop() || "home";
    
    // Handle root path specially
    if (currentPath === "/" || currentPath === "") {
      pageName = "home";
    }
    
    // Remove .html extension if present
    pageName = pageName.replace(/\.html$/, "");
    
    // Check if there's a category parameter for portfolio page
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    
    // Map page names to their corresponding navigation elements
    const navLinks = {
      "home": this.querySelector("#nav-home"),
      "portfolio": this.querySelector("#nav-portfolio"),
      "commissions": this.querySelector("#nav-commissions"),
      "conventions": this.querySelector("#nav-conventions")
    };
    
    // Map page names to their corresponding mobile navigation elements
    const mobileNavLinks = {
      "home": this.querySelector("#mobile-nav-home"),
      "portfolio": this.querySelector("#mobile-nav-portfolio"),
      "commissions": this.querySelector("#mobile-nav-commissions"),
      "conventions": this.querySelector("#mobile-nav-conventions")
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
  }
}

// Register the custom element
customElements.define("site-header", SiteHeader);
