/**
 * Conventions Manager
 * 
 * This module handles loading, categorizing, and displaying convention data.
 * It automatically determines which conventions are current, upcoming, or past
 * based on their dates, and provides functions to access conventions by category.
 * 
 * @module conventions-manager
 */

/**
 * Represents the different categories of conventions
 * @typedef {"current" | "upcoming" | "past"} ConventionCategory
 */

/**
 * Represents a convention with all its details
 * @typedef {Object} Convention
 * @property {string} id - Unique identifier for the convention
 * @property {string} name - Name of the convention
 * @property {string} location - Location of the convention
 * @property {Object} dates - Start and end dates of the convention
 * @property {string} dates.start - Start date in YYYY-MM-DD format
 * @property {string} dates.end - End date in YYYY-MM-DD format
 * @property {string} [venue] - Venue of the convention (for current/upcoming)
 * @property {string} [address] - Address of the venue (for current/upcoming)
 * @property {string} [area] - Specific area within the venue (for current/upcoming)
 * @property {string} [description] - Description of the convention (for current/upcoming)
 * @property {string} [booth] - Booth number (for current/upcoming)
 * @property {string[]} [artistAlleyHours] - Artist alley hours (for current)
 * @property {string} [mapImage] - Path to the artist alley map image (for current)
 * @property {Object[]} [stampRallies] - Stamp rallies for the convention (for current)
 * @property {Object[]} [catalogueImages] - Catalogue images for the convention (for current)
 * @property {string} [eventRecap] - Recap of the event (for past)
 * @property {string} [image] - Path to the convention image (for past)
 */

class ConventionsManager {
  /**
   * Creates a new ConventionsManager instance
   */
  constructor() {
    /** @type {Convention[]} */
    this.conventions = [];
    
    /** @type {Convention[]} */
    this.currentConventions = [];
    
    /** @type {Convention[]} */
    this.upcomingConventions = [];
    
    /** @type {Convention[]} */
    this.pastConventions = [];
  }

  /**
   * Loads convention data from the JSON file
   * @returns {Promise<void>}
   */
  async loadConventions() {
    try {
      const response = await fetch("/data/conventions.json");
      if (!response.ok) {
        throw new Error(`Failed to load conventions data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      this.conventions = data.conventions || [];
      
      // Categorize conventions
      this.categorizeConventions();
    } catch (error) {
      console.error("Error loading conventions:", error);
      this.conventions = [];
    }
  }

  /**
   * Categorizes conventions as current, upcoming, or past based on their dates
   * @private
   */
  categorizeConventions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    this.currentConventions = [];
    this.upcomingConventions = [];
    this.pastConventions = [];
    
    this.conventions.forEach(convention => {
      const startDate = new Date(convention.dates.start);
      const endDate = new Date(convention.dates.end);
      endDate.setHours(23, 59, 59, 999); // Set to end of day for accurate comparison
      
      if (today >= startDate && today <= endDate) {
        // Convention is happening now
        this.currentConventions.push(convention);
      } else if (today < startDate) {
        // Convention is in the future
        this.upcomingConventions.push(convention);
      } else {
        // Convention is in the past
        this.pastConventions.push(convention);
      }
    });
    
    // Sort upcoming conventions by start date (ascending)
    this.upcomingConventions.sort((a, b) => 
      new Date(a.dates.start) - new Date(b.dates.start)
    );
    
    // Sort past conventions by start date (descending)
    this.pastConventions.sort((a, b) => 
      new Date(b.dates.start) - new Date(a.dates.start)
    );
  }

  /**
   * Gets conventions by category
   * @param {ConventionCategory} category - The category to get conventions for
   * @returns {Convention[]} Array of conventions in the specified category
   */
  getConventionsByCategory(category) {
    switch (category) {
      case "current":
        return this.currentConventions;
      case "upcoming":
        return this.upcomingConventions;
      case "past":
        return this.pastConventions;
      default:
        return [];
    }
  }

  /**
   * Gets conventions to display for the "current" tab
   * If there are no current conventions, returns the next upcoming convention
   * @returns {Convention[]} Conventions to display in the current tab
   */
  getConventionsForCurrentTab() {
    if (this.currentConventions.length > 0) {
      return this.currentConventions;
    } else if (this.upcomingConventions.length > 0) {
      // Return the next upcoming convention if there are no current ones
      return [this.upcomingConventions[0]];
    }
    return [];
  }

  /**
   * Gets conventions to display for the "next" tab
   * @returns {Convention[]} Conventions to display in the next tab
   */
  getConventionsForNextTab() {
    if (this.currentConventions.length > 0 && this.upcomingConventions.length > 0) {
      // If there are current conventions, show all upcoming
      return this.upcomingConventions;
    } else if (this.upcomingConventions.length > 1) {
      // If there are no current conventions but multiple upcoming ones,
      // exclude the first one (which is shown in the current tab)
      return this.upcomingConventions.slice(1);
    }
    return [];
  }

  /**
   * Checks if a convention is current
   * @param {Convention} convention - The convention to check
   * @returns {boolean} True if the convention is current
   */
  isCurrentConvention(convention) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(convention.dates.start);
    const endDate = new Date(convention.dates.end);
    endDate.setHours(23, 59, 59, 999);
    
    return today >= startDate && today <= endDate;
  }

  /**
   * Formats a date range for display
   * @param {string} startDateStr - Start date in YYYY-MM-DD format
   * @param {string} endDateStr - End date in YYYY-MM-DD format
   * @returns {string} Formatted date range
   */
  formatDateRange(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    const options = { month: "long", day: "numeric", year: "numeric" };
    
    if (startDateStr === endDateStr) {
      // Single day event
      return startDate.toLocaleDateString("en-US", options);
    } else if (
      startDate.getMonth() === endDate.getMonth() && 
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      // Same month and year
      return `${startDate.toLocaleDateString("en-US", { day: "numeric" })}-${endDate.toLocaleDateString("en-US", options)}`;
    } else if (startDate.getFullYear() === endDate.getFullYear()) {
      // Same year, different months
      return `${startDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}-${endDate.toLocaleDateString("en-US", options)}`;
    } else {
      // Different years
      return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`;
    }
  }
}

// Create and export a singleton instance
const conventionsManager = new ConventionsManager();
export default conventionsManager;
