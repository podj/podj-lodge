const fs = require('fs-extra');
const path = require('path');

// Paths
const COMPRESSED_ASSETS_DIR = path.join(__dirname, '../src/assets-compressed');
const BUILD_ASSETS_DIR = path.join(__dirname, '../build/static/media');

// Copy compressed assets to build directory
async function copyCompressedAssets() {
  try {
    console.log('Copying compressed assets to build directory...');
    
    // Check if build directory exists
    if (!fs.existsSync(BUILD_ASSETS_DIR)) {
      console.error('Build directory does not exist. Run npm run build first.');
      return;
    }
    
    // Create assets directory in build if it doesn't exist
    const buildAssetsDir = path.join(__dirname, '../build/assets');
    await fs.ensureDir(buildAssetsDir);
    
    // Copy compressed assets to build directory
    await fs.copy(COMPRESSED_ASSETS_DIR, path.join(buildAssetsDir, 'assets-compressed'));
    
    console.log('Successfully copied compressed assets to build directory.');
  } catch (err) {
    console.error('Error copying compressed assets:', err);
  }
}

// Run the copy
copyCompressedAssets(); 