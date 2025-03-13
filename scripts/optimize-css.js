/**
 * CSS Optimization Script
 * 
 * This script analyzes HTML files to identify used CSS classes and removes unused styles
 * from the CSS file. It helps reduce CSS file size and improve page load performance.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Configuration options
 * @type {Object}
 */
const config = {
  // Input CSS file to optimize
  cssFile: 'css/styles.css',
  
  // Output optimized CSS file
  outputCssFile: 'css/styles.optimized.css',
  
  // Files to scan for CSS class usage
  filesToScan: [
    '*.html',
    'components/**/*.html',
    'js/**/*.js',
    'js/components/**/*.js'
  ],
  
  // CSS classes to always keep (even if not found in HTML)
  preserveClasses: [
    // Dynamically added classes
    'active', 'hidden', 'menu-active', 'open', 'opacity-0', 'opacity-100',
    'invisible', 'visible', 'pointer-events-none', 'portfolio-item--wide',
    
    // Animation classes
    'transition', 'duration-300', 'ease-in-out',
    
    // State classes
    'hover:', 'focus:', 'active:', 'group-hover:', 'focus-visible:',
    
    // Responsive classes
    'sm:', 'md:', 'lg:', 'xl:', '2xl:'
  ]
};

/**
 * Extracts all CSS class names from a CSS file
 * @param {string} cssContent - The CSS file content
 * @returns {Set<string>} Set of CSS class names
 */
function extractCssClasses(cssContent) {
  const classSet = new Set();
  
  // Match all class selectors in the CSS
  const classRegex = /\.([a-zA-Z0-9_-]+)(?![^{]*\{[^}]*content:)/g;
  let match;
  
  while ((match = classRegex.exec(cssContent)) !== null) {
    // Add the class name to the set
    classSet.add(match[1]);
  }
  
  return classSet;
}

/**
 * Extracts all CSS class names used in HTML and JS files
 * @param {Array<string>} files - List of files to scan
 * @returns {Set<string>} Set of CSS class names used in the files
 */
function extractUsedClasses(files) {
  const usedClasses = new Set();
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Extract classes from class="..." attributes
    const classAttributeRegex = /class="([^"]*)"/g;
    let match;
    
    while ((match = classAttributeRegex.exec(content)) !== null) {
      const classes = match[1].split(/\s+/);
      classes.forEach(cls => {
        if (cls.trim()) {
          // Handle conditional classes like: ${isActive ? 'active' : ''}
          if (cls.includes('${')) {
            // Extract potential class names from template literals
            const templateMatches = cls.match(/['"]([^'"]*)['"]/g);
            if (templateMatches) {
              templateMatches.forEach(tm => {
                const cleanClass = tm.replace(/['"]/g, '').trim();
                if (cleanClass) usedClasses.add(cleanClass);
              });
            }
          } else {
            usedClasses.add(cls.trim());
          }
        }
      });
    }
    
    // Extract classes from classList.add/remove/toggle calls
    const classListRegex = /classList\.(add|remove|toggle)\(['"]([^'"]*)['"]\)/g;
    while ((match = classListRegex.exec(content)) !== null) {
      const classes = match[2].split(/\s+/);
      classes.forEach(cls => {
        if (cls.trim()) usedClasses.add(cls.trim());
      });
    }
    
    // Extract classes from string literals that might be used for classes
    const stringLiteralRegex = /['"]([a-zA-Z0-9_-]+)['"].*\bclass/g;
    while ((match = stringLiteralRegex.exec(content)) !== null) {
      if (match[1].trim()) usedClasses.add(match[1].trim());
    }
  });
  
  return usedClasses;
}

/**
 * Optimizes CSS by removing unused classes
 * @param {string} cssContent - The original CSS content
 * @param {Set<string>} usedClasses - Set of used CSS class names
 * @param {Array<string>} preserveClasses - List of class patterns to always preserve
 * @returns {string} Optimized CSS content
 */
function optimizeCss(cssContent, usedClasses, preserveClasses) {
  const allCssClasses = extractCssClasses(cssContent);
  const unusedClasses = new Set();
  
  // Identify unused classes
  for (const cssClass of allCssClasses) {
    let shouldPreserve = false;
    
    // Check if class is used directly
    if (usedClasses.has(cssClass)) {
      shouldPreserve = true;
    } else {
      // Check if class matches any preserve patterns
      for (const pattern of preserveClasses) {
        if (cssClass.includes(pattern) || 
            (pattern.endsWith(':') && cssClass.startsWith(pattern.slice(0, -1)))) {
          shouldPreserve = true;
          break;
        }
      }
    }
    
    if (!shouldPreserve) {
      unusedClasses.add(cssClass);
    }
  }
  
  console.log(`Found ${allCssClasses.size} total CSS classes`);
  console.log(`Found ${usedClasses.size} used CSS classes`);
  console.log(`Identified ${unusedClasses.size} unused CSS classes`);
  
  // Remove unused classes from CSS
  let optimizedCss = cssContent;
  
  for (const unusedClass of unusedClasses) {
    // Create a regex to match the class selector and its rules
    const classRegex = new RegExp(`\\.${unusedClass}[^{]*\\{[^}]*\\}`, 'g');
    optimizedCss = optimizedCss.replace(classRegex, '');
  }
  
  // Clean up any empty media queries or other empty blocks
  optimizedCss = optimizedCss.replace(/@media[^{]*\{\s*\}/g, '');
  optimizedCss = optimizedCss.replace(/\s{2,}/g, ' ');
  
  return optimizedCss;
}

/**
 * Main function to run the CSS optimization
 */
async function main() {
  try {
    // Read the CSS file
    const cssPath = path.resolve(config.cssFile);
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Get all files to scan
    const filesToScan = [];
    for (const pattern of config.filesToScan) {
      const files = await glob(pattern);
      filesToScan.push(...files);
    }
    
    console.log(`Scanning ${filesToScan.length} files for CSS class usage...`);
    
    // Extract used classes
    const usedClasses = extractUsedClasses(filesToScan);
    
    // Optimize CSS
    const optimizedCss = optimizeCss(cssContent, usedClasses, config.preserveClasses);
    
    // Calculate size reduction
    const originalSize = cssContent.length;
    const optimizedSize = optimizedCss.length;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    console.log(`Original CSS size: ${originalSize} bytes`);
    console.log(`Optimized CSS size: ${optimizedSize} bytes`);
    console.log(`Size reduction: ${reduction}% (${originalSize - optimizedSize} bytes)`);
    
    // Write optimized CSS to output file
    const outputPath = path.resolve(config.outputCssFile);
    fs.writeFileSync(outputPath, optimizedCss);
    
    console.log(`Optimized CSS written to ${config.outputCssFile}`);
    
    // Create a backup of the original CSS file
    const backupPath = path.resolve(`${config.cssFile}.backup`);
    fs.copyFileSync(cssPath, backupPath);
    console.log(`Original CSS backed up to ${config.cssFile}.backup`);
    
  } catch (error) {
    console.error('Error optimizing CSS:', error);
  }
}

// Run the optimization
main().catch(error => {
  console.error('Unhandled error:', error);
});
