const fs = require('fs').promises;
const path = require('path');

// Paths
const SRC_DIR = path.join(__dirname, '../src');
const COMPRESSED_DIR = path.join(__dirname, '../src/assets-compressed');

// Check if browser supports WebP
function supportsWebP() {
  // This is a simplified check - in a real app, you'd use feature detection
  // For now, we'll use WebP for all modern browsers
  return true;
}

// Find all JS and JSX files
async function findJsFiles(dir) {
  const allFiles = [];
  
  async function traverse(currentDir) {
    const files = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(currentDir, file.name);
      
      if (file.isDirectory()) {
        await traverse(fullPath);
      } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
        allFiles.push(fullPath);
      }
    }
  }
  
  await traverse(dir);
  return allFiles;
}

// Check if WebP version exists
async function webpExists(imagePath) {
  const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  try {
    await fs.access(webpPath);
    return true;
  } catch {
    return false;
  }
}

// Update imports in a file
async function updateImports(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Look for import statements with assets
    const originalContent = content;
    
    // Replace import paths for images
    content = content.replace(
      /from\s+['"]\.\.\/assets\/images\/(.*?)['"]/g,
      'from "../assets-compressed/images/$1"'
    );
    
    content = content.replace(
      /from\s+['"]\.\/assets\/images\/(.*?)['"]/g,
      'from "./assets-compressed/images/$1"'
    );
    
    content = content.replace(
      /import\s+['"]\.\.\/assets\/images\/(.*?)['"]/g,
      'import "../assets-compressed/images/$1"'
    );
    
    content = content.replace(
      /import\s+['"]\.\/assets\/images\/(.*?)['"]/g,
      'import "./assets-compressed/images/$1"'
    );
    
    // Replace require statements
    content = content.replace(
      /require\(['"]\.\.\/assets\/images\/(.*?)['"]\)/g,
      "require('../assets-compressed/images/$1')"
    );
    
    content = content.replace(
      /require\(['"]\.\/assets\/images\/(.*?)['"]\)/g,
      "require('./assets-compressed/images/$1')"
    );
    
    // Replace string literals in JSX attributes
    content = content.replace(
      /(['"])\.\.\/assets\/images\/(.*?)(['"])/g,
      "$1../assets-compressed/images/$2$3"
    );
    
    content = content.replace(
      /(['"])\.\/assets\/images\/(.*?)(['"])/g,
      "$1./assets-compressed/images/$2$3"
    );
    
    // If content changed, write it back
    if (content !== originalContent) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`Updated imports in: ${path.relative(SRC_DIR, filePath)}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error updating imports in ${filePath}:`, err);
    return false;
  }
}

// Create a helper file for WebP support
async function createWebPHelper() {
  const helperPath = path.join(SRC_DIR, 'utils', 'imageUtils.js');
  const helperDir = path.dirname(helperPath);
  
  try {
    // Create directory if it doesn't exist
    await fs.mkdir(helperDir, { recursive: true });
    
    const helperContent = `// Helper functions for image optimization
    
// Check if browser supports WebP
export function supportsWebP() {
  if (typeof window === 'undefined') return false;
  
  // Basic feature detection
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : {};
  if (canvas.getContext && canvas.getContext('2d')) {
    // Check for WebP support
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

// Get appropriate image path based on browser support
export function getOptimizedImagePath(path) {
  if (!path) return path;
  
  // Only convert jpg/jpeg/png to webp
  if (!/\\.(jpe?g|png)$/i.test(path)) return path;
  
  // If browser supports WebP, use it
  if (supportsWebP()) {
    return path.replace(/\\.(jpe?g|png)$/i, '.webp');
  }
  
  return path;
}
`;

    await fs.writeFile(helperPath, helperContent, 'utf-8');
    console.log(`Created WebP helper at: ${path.relative(SRC_DIR, helperPath)}`);
    return true;
  } catch (err) {
    console.error(`Error creating WebP helper:`, err);
    return false;
  }
}

// Main function
async function updateAllImports() {
  try {
    console.log('Finding JS/JSX files...');
    const jsFiles = await findJsFiles(SRC_DIR);
    console.log(`Found ${jsFiles.length} JS/JSX files`);
    
    // Create WebP helper
    await createWebPHelper();
    
    let updatedCount = 0;
    
    for (const file of jsFiles) {
      const updated = await updateImports(file);
      if (updated) updatedCount++;
    }
    
    console.log(`\nUpdated imports in ${updatedCount} files`);
    console.log('\nNOTE: To use WebP images where supported, import the getOptimizedImagePath function:');
    console.log('import { getOptimizedImagePath } from \'../utils/imageUtils\';');
    console.log('Then use it in your image tags: <img src={getOptimizedImagePath(imagePath)} alt="..." />');
    
  } catch (err) {
    console.error('Error during import updates:', err);
  }
}

// Run the update
updateAllImports(); 