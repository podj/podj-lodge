// Helper functions for image optimization
    
// Check if browser supports WebP
export function supportsWebP() {
  // Return false if not in browser environment
  if (typeof window === 'undefined') return Promise.resolve(false);
  
  // Create a promise-based check with timeout
  return new Promise((resolve) => {
    const webpTest = new Image();
    let resolved = false;
    
    // Set a timeout to prevent hanging on mobile
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false); // Default to false if detection takes too long
      }
    }, 1000); // 1 second timeout
    
    webpTest.onload = function() {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(webpTest.width === 1 && webpTest.height === 1);
      }
    };
    
    webpTest.onerror = function() {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(false);
      }
    };
    
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
