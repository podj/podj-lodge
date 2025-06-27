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
  // If no path or not a string, return as is
  if (!path || typeof path !== 'string') return path;
  
  // Don't try to convert paths that are already processed by webpack (contain hash)
  if (path.includes('static/media/') || path.includes('.webp')) {
    return path;
  }
  
  // Only convert jpg/jpeg/png to webp
  if (!/\.(jpe?g|png)$/i.test(path)) return path;
  
  // For production builds, we need to handle paths differently
  // since webpack processes the imports
  if (process.env.NODE_ENV === 'production') {
    return path; // In production, let webpack handle it
  }
  
  // For development, use the WebP version if supported
  if (supportsWebP()) {
    return path.replace(/\.(jpe?g|png)$/i, '.webp');
  }
  
  return path;
}
