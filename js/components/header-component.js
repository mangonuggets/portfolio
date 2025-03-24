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
            <a href="home.html" class="flex items-center">
              <img src="images/logo/emote2.png" alt="Logo" class="h-10 w-auto">
            </a>
            
            <!-- Navigation Links -->
            <div class="hidden md:flex space-x-8">
              <!-- Home -->
              <a href="home.html" class="nav-link font-medium" id="nav-home">Home</a>
              
              <!-- Portfolio Dropdown -->
              <div class="relative group">
                <a href="portfolio.html" class="nav-link font-medium flex items-center" id="nav-portfolio">
                  Portfolio
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <div class="dropdown w-48 absolute top-full">
                  <div class="py-2">
                    <a href="portfolio.html?category=illustration" class="dropdown-item">Illustration</a>
                    <a href="portfolio.html?category=chibi" class="dropdown-item">Chibi</a>
                  </div>
                </div>
              </div>
              
              <!-- Commissions -->
              <a href="commissions.html" class="nav-link font-medium" id="nav-commissions">Commissions</a>
              
              <!-- Conventions -->
              <a href="conventions.html" class="nav-link font-medium" id="nav-conventions">Conventions</a>
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
              <a href="home.html" class="nav-link-mobile font-medium py-2 px-4" id="mobile-nav-home">Home</a>
              
              <div class="relative">
                <a href="portfolio.html" class="nav-link-mobile font-medium py-2 px-4 flex items-center justify-between" id="mobile-nav-portfolio">
                  Portfolio
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <div class="pl-4">
                  <a href="portfolio.html?category=illustration" class="nav-link-mobile font-medium py-2 px-4 block">Illustration</a>
                  <a href="portfolio.html?category=chibi" class="nav-link-mobile font-medium py-2 px-4 block">Chibi</a>
                </div>
              </div>
              
              <a href="commissions.html" class="nav-link-mobile font-medium py-2 px-4" id="mobile-nav-commissions">Commissions</a>
              <a href="conventions.html" class="nav-link-mobile font-medium py-2 px-4" id="mobile-nav-conventions">Conventions</a>
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
   * Highlights the active page in the navigation
   */
  highlightActivePage() {
    // Get the current page filename
    const currentPage = window.location.pathname.split("/").pop();
    
    // Default to home.html if no filename is found
    const activePage = currentPage || "home.html";
    
    // Check if there's a category parameter for portfolio page
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    
    // Highlight the active page in desktop navigation
    const navLinks = {
      "home.html": this.querySelector("#nav-home"),
      "portfolio.html": this.querySelector("#nav-portfolio"),
      "commissions.html": this.querySelector("#nav-commissions"),
      "conventions.html": this.querySelector("#nav-conventions")
    };
    
    // Highlight the active page in mobile navigation
    const mobileNavLinks = {
      "home.html": this.querySelector("#mobile-nav-home"),
      "portfolio.html": this.querySelector("#mobile-nav-portfolio"),
      "commissions.html": this.querySelector("#mobile-nav-commissions"),
      "conventions.html": this.querySelector("#mobile-nav-conventions")
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
  }
}

// Register the custom element
customElements.define("site-header", SiteHeader);
