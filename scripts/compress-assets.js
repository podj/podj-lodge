const fs = require('fs').promises;
const path = require('path');
const { execFile } = require('child_process');
const sharp = require('sharp');
const ffmpeg = require('ffmpeg-static');

// Configuration
const IMAGE_QUALITY = 70; // 0-100 for JPG, lower means more compression
const PNG_QUALITY = [0.6, 0.8]; // Range for PNG quality
const MAX_IMAGE_WIDTH = 1920; // Maximum width for images
const VIDEO_CRF = 28; // 0-51 for videos, higher means more compression (23-28 is a good balance)
const VIDEO_PRESET = 'medium'; // ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow

// Disable Sharp cache
sharp.cache(false);

// Paths
const ASSETS_DIR = path.join(__dirname, '../src/assets');
const COMPRESSED_DIR = path.join(__dirname, '../src/assets-compressed');

// Create compressed directory if it doesn't exist
async function createCompressedDir() {
  try {
    await fs.mkdir(COMPRESSED_DIR, { recursive: true });
    console.log('Created compressed directory:', COMPRESSED_DIR);
  } catch (err) {
    console.error('Error creating compressed directory:', err);
  }
}

// Get all files recursively
async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map(async (dirent) => {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      return getFiles(res);
    } else {
      return res;
    }
  }));
  return Array.prototype.concat(...files);
}

// Copy image without processing
async function copyImage(filePath) {
  const relativePath = path.relative(ASSETS_DIR, filePath);
  const outputDir = path.join(COMPRESSED_DIR, path.dirname(relativePath));
  const outputPath = path.join(outputDir, path.basename(filePath));
  
  try {
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });
    // Copy file directly
    await fs.copyFile(filePath, outputPath);
    console.log(`Copied: ${relativePath}`);
    return true;
  } catch (err) {
    console.error(`Error copying ${relativePath}:`, err);
    return false;
  }
}

// Compress video
async function compressVideo(filePath) {
  const relativePath = path.relative(ASSETS_DIR, filePath);
  const outputDir = path.join(COMPRESSED_DIR, path.dirname(relativePath));
  const ext = path.extname(filePath).toLowerCase();
  
  // Skip non-video files
  if (!['.mp4', '.mov', '.avi', '.webm'].includes(ext)) {
    return;
  }
  
  try {
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, path.basename(filePath));
    
    return new Promise((resolve, reject) => {
      execFile(ffmpeg, [
        '-i', filePath,
        '-c:v', 'libx264',
        '-crf', VIDEO_CRF.toString(),
        '-preset', VIDEO_PRESET,
        '-c:a', 'aac',
        '-b:a', '128k',
        outputPath
      ], (error) => {
        if (error) {
          console.error(`Error compressing video ${relativePath}:`, error);
          reject(error);
        } else {
          console.log(`Compressed video: ${relativePath}`);
          resolve();
        }
      });
    });
  } catch (err) {
    console.error(`Error compressing video ${relativePath}:`, err);
  }
}

// Main function
async function compressAssets() {
  try {
    await createCompressedDir();
    
    // Get all files
    const files = await getFiles(ASSETS_DIR);
    
    // Process files in batches to avoid memory issues
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(batch.map(async (file) => {
        const ext = path.extname(file).toLowerCase();
        
        // Skip .DS_Store and other hidden files
        if (path.basename(file).startsWith('.')) {
          return;
        }
        
        if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
          await copyImage(file);
        } else if (['.mp4', '.mov', '.avi', '.webm'].includes(ext)) {
          await compressVideo(file);
        }
      }));
      
      console.log(`Processed ${Math.min(i + batchSize, files.length)} of ${files.length} files`);
    }
    
    console.log('Asset compression complete!');
    console.log(`Original assets directory: ${ASSETS_DIR}`);
    console.log(`Compressed assets directory: ${COMPRESSED_DIR}`);
  } catch (err) {
    console.error('Error during compression:', err);
  }
}

// Run the compression
compressAssets(); 