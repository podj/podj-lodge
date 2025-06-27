const fs = require('fs').promises;
const path = require('path');
const { execFile } = require('child_process');
const sharp = require('sharp');
const ffmpeg = require('ffmpeg-static');

// Configuration
const IMAGE_QUALITY = 50; // 0-100 for JPG, lower means more compression (reduced from 60)
const PNG_COMPRESSION_LEVEL = 9; // 0-9, higher means more compression
const MAX_IMAGE_WIDTH = 1000; // Reduced maximum width for images
const MAX_IMAGE_HEIGHT = 1000; // Added maximum height for images
const VIDEO_CRF = 28; // 0-51 for videos, higher means more compression (23-28 is a good balance)
const VIDEO_PRESET = 'medium'; // ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow
const CREATE_WEBP = true; // Whether to also create WebP versions of images
const WEBP_QUALITY = 60; // 0-100 for WebP, lower means more compression

// Disable Sharp cache
sharp.cache(false);

// Paths
const ASSETS_DIR = path.join(__dirname, '../src/assets');
const COMPRESSED_DIR = path.join(__dirname, '../src/assets-compressed');

// Create compressed directory if it doesn't exist
async function createCompressedDir() {
  try {
    // Remove existing compressed directory to start fresh
    try {
      await fs.rm(COMPRESSED_DIR, { recursive: true, force: true });
      console.log('Removed existing compressed directory');
    } catch (err) {
      // Directory might not exist, which is fine
    }
    
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

// Compress image
async function compressImage(filePath) {
  const relativePath = path.relative(ASSETS_DIR, filePath);
  const outputDir = path.join(COMPRESSED_DIR, path.dirname(relativePath));
  const outputPath = path.join(outputDir, path.basename(filePath));
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });
    
    // Get image metadata
    const metadata = await sharp(filePath).metadata();
    
    // Prepare sharp instance with resizing if needed
    let sharpInstance = sharp(filePath);
    
    // Resize only if image is larger than max dimensions
    if (metadata.width > MAX_IMAGE_WIDTH || metadata.height > MAX_IMAGE_HEIGHT) {
      sharpInstance = sharpInstance.resize({
        width: Math.min(metadata.width, MAX_IMAGE_WIDTH),
        height: Math.min(metadata.height, MAX_IMAGE_HEIGHT),
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Apply format-specific compression
    if (['.jpg', '.jpeg'].includes(ext)) {
      await sharpInstance
        .jpeg({ quality: IMAGE_QUALITY, mozjpeg: true })
        .toFile(outputPath);
    } else if (ext === '.png') {
      await sharpInstance
        .png({ 
          compressionLevel: PNG_COMPRESSION_LEVEL,
          adaptiveFiltering: true,
          palette: true
        })
        .toFile(outputPath);
    } else if (ext === '.gif') {
      // For GIFs, we'll just copy as Sharp doesn't handle GIF animation well
      await fs.copyFile(filePath, outputPath);
    }
    
    // Create WebP version if enabled
    if (CREATE_WEBP && ['.jpg', '.jpeg', '.png'].includes(ext)) {
      const webpOutputPath = outputPath.replace(ext, '.webp');
      await sharpInstance
        .webp({ 
          quality: WEBP_QUALITY,
          effort: 6, // 0-6, higher means better compression but slower
          lossless: false
        })
        .toFile(webpOutputPath);
      console.log(`Created WebP: ${relativePath.replace(ext, '.webp')}`);
    }
    
    // Get file sizes for comparison
    const originalSize = (await fs.stat(filePath)).size;
    const compressedSize = (await fs.stat(outputPath)).size;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
    
    console.log(`Compressed: ${relativePath} (${reduction}% reduction)`);
    return true;
  } catch (err) {
    console.error(`Error compressing ${relativePath}:`, err);
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
    
    // Just copy the video file for now since we're having issues with ffmpeg
    // We'll focus on image optimization which is more critical
    await fs.copyFile(filePath, outputPath);
    console.log(`Copied video: ${relativePath}`);
    return true;
    
    /* Commenting out the ffmpeg code due to issues with odd dimensions
    return new Promise((resolve, reject) => {
      execFile(ffmpeg, [
        '-i', filePath,
        '-c:v', 'libx264',
        '-crf', VIDEO_CRF.toString(),
        '-preset', VIDEO_PRESET,
        '-c:a', 'aac',
        '-b:a', '128k',
        // Add resolution scaling for videos, ensuring width is even
        '-vf', 'scale=\'min(1280,iw)/2*2\':\'min(720,ih)/2*2\':force_original_aspect_ratio=decrease',
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
    */
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
          await compressImage(file);
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