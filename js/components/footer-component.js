/**
 * Footer Web Component
 * 
 * This component encapsulates the site footer.
 * It provides a more efficient way to include the footer across multiple pages
 * without requiring fetch requests.
 */

class SiteFooter extends HTMLElement {
  /**
   * Constructor initializes the component
   */
  constructor() {
    super();
  }

  /**
   * Called when the element is added to the DOM
   */
  connectedCallback() {
    this.render();
    this.setCurrentYear();
  }

  /**
   * Gets the base path for assets based on the current URL
   * @returns {string} The base path prefix
   */
  getBasePath() {
    // Check if we're in a subdirectory
    return window.location.pathname.includes('/conventions/') ||
           window.location.pathname.includes('/portfolio/') ||
           window.location.pathname.includes('/commissions/') ? '../' : '';
  }

  /**
   * Renders the footer HTML
   */
  render() {
    this.innerHTML = `
      <footer class="bg-pastel-pink text-white py-8">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="mb-4 md:mb-0">
              <div class="flex items-center mb-2">
                <img src="${this.getBasePath()}images/logo/emote2.png" alt="Logo" class="h-8 w-auto mr-2">
                <h3 class="text-xl font-bold">yuumocha</h3>
              </div>
              <p class="text-gray-400">Illustrator & Chibi Artist</p>
            </div>
            
            <div class="flex space-x-6 mb-4 md:mb-0">
              <a href="https://x.com/yuumocha" class="text-gray-400 hover:text-white transition duration-300">
                <i class="fab fa-twitter text-xl"></i>
              </a>
              <a href="https://www.instagram.com/mochachinoillust/" class="text-gray-400 hover:text-white transition duration-300">
                <i class="fab fa-instagram text-xl"></i>
              </a>
              <a href="https://www.pixiv.net/en/users/35984610" class="text-gray-400 hover:text-white transition duration-300">
                <i class="fab fa-pixiv text-xl"></i>
              </a>
              <a href="https://www.twitch.tv/mangonuggets" class="text-gray-400 hover:text-white transition duration-300">
                <i class="fab fa-twitch text-xl"></i>
              </a>
              <a href="https://www.tiktok.com/@mochachinoillust" class="text-gray-400 hover:text-white transition duration-300">
                <i class="fab fa-tiktok text-xl"></i>
              </a>
              <a href="https://mochachino.shop/" class="text-gray-400 hover:text-white transition duration-300">
                <i class="fas fa-shopping-bag text-xl"></i>
              </a>
            </div>
            
          </div>
          
          <div class="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400 text-sm">
            &copy; <span id="current-year">2025</span> All rights reserved.
          </div>
        </div>
      </footer>
    `;
  }

  /**
   * Sets the current year in the footer copyright text
   */
  setCurrentYear() {
    const yearElement = this.querySelector("#current-year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }
}

// Register the custom element
customElements.define("site-footer", SiteFooter);
