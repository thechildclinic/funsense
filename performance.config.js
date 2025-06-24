/**
 * Performance optimization configuration for School Health Screening System
 * This file contains settings and utilities for optimizing the application performance
 */

// Image optimization settings
export const IMAGE_OPTIMIZATION = {
  // Maximum image dimensions for different use cases
  MAX_DIMENSIONS: {
    camera_capture: { width: 1920, height: 1080 },
    device_display: { width: 800, height: 600 },
    thumbnail: { width: 200, height: 150 }
  },
  
  // JPEG quality settings (0-1)
  QUALITY: {
    high: 0.9,      // For medical images that need detail
    medium: 0.7,    // For general captures
    low: 0.5        // For thumbnails
  },
  
  // Maximum file sizes (in bytes)
  MAX_FILE_SIZE: {
    image: 2 * 1024 * 1024,      // 2MB for images
    video: 10 * 1024 * 1024      // 10MB for videos
  }
};

// API optimization settings
export const API_OPTIMIZATION = {
  // Request timeout settings (in milliseconds)
  TIMEOUTS: {
    text_generation: 30000,      // 30 seconds
    image_analysis: 45000,       // 45 seconds
    ocr: 20000                   // 20 seconds
  },
  
  // Retry configuration
  RETRY: {
    max_attempts: 3,
    delay_ms: 1000,
    backoff_multiplier: 2
  },
  
  // Request batching (if implemented)
  BATCH_SIZE: 5
};

// LocalStorage optimization
export const STORAGE_OPTIMIZATION = {
  // Maximum storage per student (in bytes)
  MAX_STUDENT_DATA_SIZE: 5 * 1024 * 1024,  // 5MB
  
  // Cleanup thresholds
  CLEANUP_THRESHOLDS: {
    max_students: 50,           // Maximum number of students to keep
    max_age_days: 30           // Maximum age of data in days
  },
  
  // Compression settings
  COMPRESSION: {
    enabled: true,
    level: 6                   // gzip compression level (1-9)
  }
};

// Performance monitoring thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals targets
  CORE_WEB_VITALS: {
    lcp: 2500,                 // Largest Contentful Paint (ms)
    fid: 100,                  // First Input Delay (ms)
    cls: 0.1                   // Cumulative Layout Shift
  },
  
  // Custom metrics
  CUSTOM_METRICS: {
    camera_init_time: 3000,    // Camera initialization (ms)
    ai_response_time: 10000,   // AI API response (ms)
    page_load_time: 5000       // Page load time (ms)
  }
};

// Utility functions for performance optimization
export const PerformanceUtils = {
  /**
   * Compress image to specified quality and dimensions
   */
  compressImage: (file, maxWidth, maxHeight, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Debounce function to limit API calls
   */
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function to limit execution frequency
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Check if localStorage is approaching quota
   */
  checkStorageQuota: () => {
    try {
      const used = new Blob(Object.values(localStorage)).size;
      const quota = 5 * 1024 * 1024; // Assume 5MB quota
      return {
        used,
        quota,
        percentage: (used / quota) * 100,
        nearLimit: (used / quota) > 0.8
      };
    } catch (error) {
      console.warn('Could not check storage quota:', error);
      return null;
    }
  },

  /**
   * Clean up old localStorage data
   */
  cleanupOldData: (maxAge = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('screeningData_v2_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const lastUpdated = new Date(data.lastUpdated);
          if (lastUpdated < cutoffDate) {
            localStorage.removeItem(key);
            console.log(`Cleaned up old data for key: ${key}`);
          }
        } catch (error) {
          // If we can't parse the data, it's probably corrupted, so remove it
          localStorage.removeItem(key);
        }
      }
    });
  },

  /**
   * Monitor performance metrics
   */
  measurePerformance: (name, fn) => {
    const start = performance.now();
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      });
    } else {
      const duration = performance.now() - start;
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      return result;
    }
  }
};

// Export default configuration
export default {
  IMAGE_OPTIMIZATION,
  API_OPTIMIZATION,
  STORAGE_OPTIMIZATION,
  PERFORMANCE_THRESHOLDS,
  PerformanceUtils
};
