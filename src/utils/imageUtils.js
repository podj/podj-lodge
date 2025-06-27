// Helper functions for image optimization
    
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
  if (!/\.(jpe?g|png)$/i.test(path)) return path;
  
  // If browser supports WebP, use it
  if (supportsWebP()) {
    return path.replace(/\.(jpe?g|png)$/i, '.webp');
  }
  
  return path;
}
