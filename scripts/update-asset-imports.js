const fs = require('fs').promises;
const path = require('path');

// Paths
const SRC_DIR = path.join(__dirname, '../src');

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
    
    // Replace WebP extensions if necessary
    // This is more complex and might need manual review
    
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

// Main function
async function updateAllImports() {
  try {
    console.log('Finding JS/JSX files...');
    const jsFiles = await findJsFiles(SRC_DIR);
    console.log(`Found ${jsFiles.length} JS/JSX files`);
    
    let updatedCount = 0;
    
    for (const file of jsFiles) {
      const updated = await updateImports(file);
      if (updated) updatedCount++;
    }
    
    console.log(`\nUpdated imports in ${updatedCount} files`);
    console.log('\nNOTE: You may need to manually update some imports, especially for WebP images.');
    console.log('Review your code and make any necessary adjustments.');
    
  } catch (err) {
    console.error('Error during import updates:', err);
  }
}

// Run the update
updateAllImports(); 