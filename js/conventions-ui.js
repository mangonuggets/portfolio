/**
 * Conventions UI
 * 
 * This module handles the UI for the conventions page, including tab switching,
 * rendering convention content, and handling user interactions.
 * 
 * @module conventions-ui
 */

import conventionsManager from "./conventions-manager.js";

/**
 * Initializes the conventions UI
 */
async function initConventionsUI() {
  // Load conventions data
  await conventionsManager.loadConventions();
  
  // Set up tab switching
  setupTabSwitching();
  
  // Render initial content (current tab)
  renderCurrentTab();
}

/**
 * Sets up tab switching functionality
 */
function setupTabSwitching() {
  const tabs = document.querySelectorAll(".convention-tab");
  
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      tabs.forEach(t => {
        t.classList.remove("active", "bg-pastel-pink");
        t.classList.add("bg-white");
      });
      
      // Add active class to clicked tab
      tab.classList.add("active", "bg-pastel-pink");
      tab.classList.remove("bg-white");
      
      // Show the selected content section
      const tabName = tab.dataset.tab;
      
      // Hide all content sections
      document.querySelectorAll(".convention-content").forEach(content => {
        content.classList.add("hidden");
      });
      
      // Show the selected content section
      if (tabName === "current") {
        renderCurrentTab();
      } else if (tabName === "next") {
        renderNextTab();
      } else if (tabName === "past") {
        renderPastTab();
      }
    });
  });
  
  // Set up rally tab switching
  setupRallyTabSwitching();
  
  // Set up convention details expand/collapse
  setupConventionExpand();
}

/**
 * Sets up stamp rally tab switching
 */
function setupRallyTabSwitching() {
  const rallyTabs = document.querySelectorAll(".rally-tab");
  
  rallyTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      rallyTabs.forEach(t => {
        t.classList.remove("active", "bg-pastel-pink");
        t.classList.add("bg-white");
      });
      
      // Add active class to clicked tab
      tab.classList.add("active", "bg-pastel-pink");
      tab.classList.remove("bg-white");
      
      // Filter rallies based on selected tab
      const rallyType = tab.dataset.rallyTab;
      filterRallies(rallyType);
    });
  });
}

/**
 * Filters stamp rally cards based on the selected tab
 * @param {string} rallyType - The type of rally to show ('all' or specific rally type)
 */
function filterRallies(rallyType) {
  const rallyCards = document.querySelectorAll("[data-rally-type]");
  
  rallyCards.forEach(card => {
    if (rallyType === "all" || card.dataset.rallyType === rallyType) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

/**
 * Sets up convention details expand/collapse functionality
 */
function setupConventionExpand() {
  const conventionExpands = document.querySelectorAll(".convention-expand");
  
  conventionExpands.forEach(button => {
    button.addEventListener("click", () => {
      const detailsId = button.dataset.id;
      const detailsElement = document.getElementById(detailsId);
      
      detailsElement.classList.toggle("hidden");
      
      // Change the icon
      const svg = button.querySelector("svg");
      if (detailsElement.classList.contains("hidden")) {
        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />';
      } else {
        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />';
      }
    });
  });
}

/**
 * Initializes lightGallery for image galleries
 */
function initLightGallery() {
  // Initialize lightGallery for catalogue
  if (document.getElementById("catalogue-gallery")) {
    lightGallery(document.getElementById("catalogue-gallery"), {
      selector: "a",
      speed: 500,
      download: false
    });
  }
  
  // Initialize lightGallery for each stamp rally gallery
  document.querySelectorAll(".stamp-rally-gallery").forEach(gallery => {
    lightGallery(gallery, {
      selector: "a",
      speed: 500,
      download: false
    });
  });

  // Initialize lightGallery for map images
  document.querySelectorAll(".map-gallery").forEach(gallery => {
    lightGallery(gallery, {
      selector: "a",
      speed: 500,
      download: false
    });
  });
}

/**
 * Renders the current tab content
 */
function renderCurrentTab() {
  const currentConventions = conventionsManager.getConventionsForCurrentTab();
  const currentSection = document.getElementById("current-convention");
  
  currentSection.classList.remove("hidden");
  
  if (currentConventions.length === 0) {
    currentSection.innerHTML = `
    <div class="container mx-auto px-4 max-w-5xl">
          <div class="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 class="text-2xl font-serif font-bold text-gray-800 mb-4">No Current Conventions</h2>
            <p class="text-gray-700">There are no conventions happening right now.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  // Get the first convention (either current or next upcoming)
  const convention = currentConventions[0];
  
  // Check if this is actually a current convention or a fallback to upcoming
  const isCurrent = convention.statusLock === "current" || 
                   (convention.statusLock !== "upcoming" && 
                    convention.statusLock !== "past" && 
                    conventionsManager.isCurrentConvention(convention));
  
  let html = `
    <div class="container mx-auto px-4">
      <div class="max-w-5xl mx-auto">
        <!-- Convention Info - 3-Panel Design -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-10">
          <!-- Top Panel - Convention Name and Date -->
          <div class="bg-pastel-pink-light p-6">
            <div class="text-center">
              <h2 class="text-2xl font-serif font-bold text-gray-800 mb-2">${convention.name}</h2>
              <p class="text-gray-700 mb-1">${convention.location}</p>
              <p class="text-gray-800 font-medium">${conventionsManager.formatDateRange(convention.dates.start, convention.dates.end)}</p>
              ${!isCurrent ? '<span class="inline-block mt-2 bg-pastel-blue text-gray-800 text-sm font-medium px-3 py-1 rounded-full">Upcoming Convention</span>' : ''}
            </div>
          </div>
          
          <!-- Image Section - Two Images Side by Side -->
          <div class="bg-gray-50 p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Image -->
              <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="h-64 flex items-center justify-center overflow-hidden">
                  ${convention.mapImage ? 
                    `<div class="map-gallery w-full h-full">
                      <a href="${convention.mapImage}" class="block">
                        <div class="relative w-full h-full">
                          <img src="${convention.mapImage}" alt="Artist Alley Map" class="w-full h-full object-contain rounded-lg max-w-full max-h-full">
                          <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition duration-300 flex items-center justify-center">
                            <div class="text-white bg-black bg-opacity-70 px-4 py-2 rounded-md">
                              <i class="fas fa-search-plus mr-2"></i>View
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>` : 
                    `<p class="text-gray-500 text-sm">Artist Alley Map</p>`
                  }
                </div>
              </div>
              
              <!-- Right Image -->
             <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="h-64 flex items-center justify-center overflow-hidden">
                  ${convention.mapImage2 ? 
                    `<div class="map-gallery w-full h-full">
                      <a href="${convention.mapImage2}" class="block">
                        <div class="relative w-full h-full">
                          <img src="${convention.mapImage2}" alt="Artist Alley Map" class="w-full h-full object-contain rounded-lg max-w-full max-h-full">
                          <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition duration-300 flex items-center justify-center">
                            <div class="text-white bg-black bg-opacity-70 px-4 py-2 rounded-md">
                              <i class="fas fa-search-plus mr-2"></i>View
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>` : 
                    `<p class="text-gray-500 text-sm">Artist Alley Map</p>`
                  }
                </div>
              </div>
            </div>
          </div>
          
          <!-- Details Section -->
          <div class="p-6">
              <div class="mb-4">
                <h3 class="text-xl font-medium text-gray-800 mb-2">Event Details</h3>
                <p class="text-gray-700 mb-2">
                  ${convention.description}
                </p>
                <p class="text-gray-700 font-medium">Booth: <span class="text-pastel-pink-dark">${convention.booth}</span></p>
              </div>
              
              <div class="mb-4">
                <h3 class="text-xl font-medium text-gray-800 mb-2">Location</h3>
                <p class="text-gray-700 mb-1">${convention.venue || ''}</p>
                <p class="text-gray-700 mb-1">${convention.address || ''}</p>
                <p class="text-gray-700">${convention.area || ''}</p>
              </div>
              
              ${convention.artistAlleyHours ? `
                <div>
                  <h3 class="text-xl font-medium text-gray-800 mb-2">Artist Alley Hours</h3>
                  <ul class="text-gray-700">
                    ${convention.artistAlleyHours.map(hour => `<li>${hour}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
  `;
  
  // Only show stamp rallies and catalogue for current conventions
  if (isCurrent && convention.stampRallies && convention.stampRallies.length > 0) {
    html += `
      <!-- Stamp Rallies -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-10 max-w-5xl mx-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-serif font-bold text-gray-800">Stamp Rallies</h2>
            <span class="bg-pastel-pink text-gray-800 text-sm font-medium px-3 py-1 rounded-full">${convention.stampRallies.length} Active</span>
          </div>
          <p class="text-gray-700 mb-6">
            Collect stamps from participating booths and win exclusive prizes! Check out our current stamp rallies below.
          </p>
          
          <!-- Stamp Rally Tabs -->
          <div class="flex justify-center mb-6">
            <div class="inline-flex rounded-md shadow-sm" role="group">
              <button type="button" class="rally-tab active px-6 py-2 text-sm font-medium bg-pastel-pink text-gray-800 border border-pastel-pink rounded-l-lg" data-rally-tab="all">
                All
              </button>
              ${convention.stampRallies.map((rally, index) => `
                <button type="button" class="rally-tab px-6 py-2 text-sm font-medium bg-white text-gray-800 border border-pastel-pink ${index === convention.stampRallies.length - 1 ? 'rounded-r-lg' : ''}" data-rally-tab="${rally.type}">
                  ${rally.title.split(' ')[0]}
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Stamp Rally Cards Container -->
          <div class="space-y-8">
            ${convention.stampRallies.map(rally => `
              <!-- Stamp Rally -->
              <div class="border-2 border-pastel-pink rounded-lg overflow-hidden" data-rally-type="${rally.type}">
                <!-- Rally Header -->
                <div class="bg-pastel-pink-light p-4">
                  <h3 class="text-xl font-bold text-gray-800 mb-1">${rally.title}</h3>
                  <p class="text-gray-700 text-sm">Participating Booths: ${rally.participatingBooths}</p>
                </div>
                
                <!-- Rally Content -->
                <div class="p-4">
                  <div class="mb-4">
                    <p class="text-gray-700 mb-2">
                      ${rally.description}
                    </p>
                    <p class="text-gray-700 font-medium">
                      Prize: ${rally.prize}
                    </p>
                  </div>
                  
                  <!-- Rally Images -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 h-full stamp-rally-gallery" id="${rally.type}-rally">
                    ${rally.images.map(image => `
                      <div class="overflow-hidden rounded-lg shadow-sm">
                        <a href="${image.src}" class="block">
                          <div class="relative">
                            <img src="${image.src}" alt="${image.alt}" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition duration-300 flex items-center justify-center">
                              <div class="text-white bg-black bg-opacity-70 px-4 py-2 rounded-md">
                                <i class="fas fa-search-plus mr-2"></i>View
                              </div>
                            </div>
                          </div>
                          <div class="bg-gray-100 p-2">
                            <p class="text-sm text-gray-700 text-center">${image.caption}</p>
                          </div>
                        </a>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
  
  // Add catalogue section for current conventions (or manually set as current)
  if ((isCurrent || convention.statusLock === "current") && convention.catalogueImages && convention.catalogueImages.length > 0) {
    html += `
      <!-- Catalogue -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden max-w-5xl mx-auto">
        <div class="p-6">
          <h2 class="text-2xl font-serif font-bold text-gray-800 mb-4">Convention Catalogue</h2>
          <p class="text-gray-700 mb-6">
            Here's what I'm currently selling at my booth. Stop by to see these items in person!
          </p>
          
          <div id="catalogue-gallery" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${convention.catalogueImages.map(image => `
              <div class="overflow-hidden rounded-lg shadow-sm">
                <a href="${image.src}" class="block">
                  <div class="relative">
                    <img src="${image.src}" alt="${image.alt}" class="w-full h-auto object-cover">
                    <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <div class="text-white bg-black bg-opacity-70 px-4 py-2 rounded-md">
                        <i class="fas fa-search-plus mr-2"></i>View
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
  
  html += `
      </div>
    </div>
  `;
  
  currentSection.innerHTML = html;
  
  // Initialize lightGallery
  initLightGallery();
  
  // Set up rally tab switching
  setupRallyTabSwitching();
}

/**
 * Renders the next tab content
 */
function renderNextTab() {
  const upcomingConventions = conventionsManager.getConventionsForNextTab();
  const nextSection = document.getElementById("next-convention");
  
  nextSection.classList.remove("hidden");
  
  if (upcomingConventions.length === 0) {
    nextSection.innerHTML = `
      <div class="container mx-auto px-4">
        <div class="max-w-5xl mx-auto">
          <div class="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 class="text-2xl font-serif font-bold text-gray-800 mb-4">No Upcoming Conventions</h2>
            <p class="text-gray-700">There are no upcoming conventions scheduled at this time.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  let html = `
    <div class="container mx-auto px-4">
      <div class="max-w-5xl mx-auto">
  `;
  
  // Render each upcoming convention
  upcomingConventions.forEach(convention => {
    html += `
      <!-- Next Convention Info - 3-Panel Design -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-10">
        <!-- Top Panel - Convention Name and Date -->
        <div class="bg-pastel-pink-light p-6">
          <div class="text-center">
            <h2 class="text-2xl font-serif font-bold text-gray-800 mb-2">${convention.name}</h2>
            <p class="text-gray-700 mb-1">${convention.location}</p>
            <p class="text-gray-800 font-medium">${conventionsManager.formatDateRange(convention.dates.start, convention.dates.end)}</p>
          </div>
        </div>
        
        <!-- Image Section - Two Images Side by Side -->
        <div class="bg-gray-50 p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Image -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
              <div class="h-64 flex items-center justify-center overflow-hidden">
                ${convention.mapImage ? 
                  `<img src="${convention.mapImage}" alt="Artist Alley Map" class="w-full h-full object-contain rounded-lg max-w-full max-h-full">` : 
                  `<p class="text-gray-500 text-sm">Artist Alley Map</p>`
                }
              </div>
            </div>
            
            <!-- Right Image -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
              <div class="h-64 flex items-center justify-center overflow-hidden">
                ${convention.stampRallies && convention.stampRallies.length > 0 ? 
                  `<img src="${convention.stampRallies[0].images[0].src}" alt="Stamp Rally Preview" class="w-full h-full object-contain rounded-lg max-w-full max-h-full">` : 
                  `<p class="text-gray-500 text-sm">Convention Preview</p>`
                }
              </div>
            </div>
          </div>
        </div>
        
        <!-- Details Section -->
        <div class="p-6">
            <div class="mb-4">
              <h3 class="text-xl font-medium text-gray-800 mb-2">Event Details</h3>
              <p class="text-gray-700 mb-2">
                ${convention.description}
              </p>
              <p class="text-gray-700 font-medium">Booth: <span class="text-pastel-pink-dark">${convention.booth}</span></p>
            </div>
            
            <div class="mb-4">
              <h3 class="text-xl font-medium text-gray-800 mb-2">Location</h3>
              <p class="text-gray-700 mb-1">${convention.venue || ''}</p>
              <p class="text-gray-700 mb-1">${convention.address || ''}</p>
              <p class="text-gray-700">${convention.area || ''}</p>
            </div>
          </div>
        </div>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  nextSection.innerHTML = html;
}

/**
 * Renders the past tab content
 */
function renderPastTab() {
  const pastConventions = conventionsManager.getConventionsByCategory("past");
  const pastSection = document.getElementById("past-conventions");
  
  pastSection.classList.remove("hidden");
  
  if (pastConventions.length === 0) {
    pastSection.innerHTML = `
      <div class="container mx-auto px-4">
        <div class="max-w-5xl mx-auto">
          <div class="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 class="text-2xl font-serif font-bold text-gray-800 mb-4">No Past Conventions</h2>
            <p class="text-gray-700">There are no past conventions to display.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  let html = `
    <div class="container mx-auto px-4">
      <div class="max-w-5xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  `;
  
  // Render each past convention
  pastConventions.forEach((convention, index) => {
    html += `
      <!-- Past Convention ${index + 1} -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="relative h-58">
          <img src="${convention.image}" alt="${convention.name}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div class="text-center">
              <h3 class="text-white text-xl font-bold">${convention.name}</h3>
              <p class="text-white">${convention.location}</p>
            </div>
          </div>
        </div>
        <div class="p-4">
          <p class="text-gray-600 text-sm mb-2">${conventionsManager.formatDateRange(convention.dates.start, convention.dates.end)}</p>
          <button class="text-pastel-pink-dark hover:text-pastel-pink font-medium flex items-center convention-expand" data-id="past-${index + 1}">
            <span>View Details</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <!-- Expanded Content (Hidden by default) -->
          <div id="past-${index + 1}" class="convention-details mt-4 hidden">
            <div class="border-t pt-4">
              <h4 class="font-medium text-gray-800 mb-2">Event Recap</h4>
              <p class="text-gray-700 mb-4">
                ${convention.eventRecap}
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += `
        </div>
      </div>
    </div>
  `;
  
  pastSection.innerHTML = html;
  
  // Set up convention details expand/collapse
  setupConventionExpand();
}

// Initialize the UI when the DOM is loaded
document.addEventListener("DOMContentLoaded", initConventionsUI);
