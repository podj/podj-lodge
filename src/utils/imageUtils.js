// Helper functions for image optimization
    
// Check if browser supports WebP
export function supportsWebP() {
  // Return false if not in browser environment
  if (typeof window === 'undefined') return false;
  
  // For iOS Safari and other browsers that might have issues with canvas detection
  // Use a more reliable feature detection approach
  const webpTest = new Image();
  webpTest.onerror = () => false;
  
  // Create a promise-based check
  return new Promise((resolve) => {
    webpTest.onload = () => resolve(webpTest.width === 1);
    webpTest.onerror = () => resolve(false);
    
    // A 1x1 WebP image
    webpTest.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  }).catch(() => false);
}

// Get appropriate image path based on browser support
export function getOptimizedImagePath(path) {
  if (!path) return path;
  
  // Only convert jpg/jpeg/png to webp
  if (!/\.(jpe?g|png)$/i.test(path)) return path;
  
  // If browser supports WebP, use it
  if (supportsWebP()) {
    return path.replace(/\.(jpe?g|png)$/i, '.webp');
  }
  
  return path;
}
