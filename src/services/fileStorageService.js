/**
 * File Storage Service - Improved file storage strategy
 * 
 * Storage Strategy:
 * - File metadata stored in localStorage
 * - Small files (< 2MB): Store thumbnail/base64 for preview
 * - Large files (> 2MB): Only metadata, require re-upload when needed
 * 
 * PRODUCTION RECOMMENDATION:
 * For production, use IndexedDB instead of localStorage for:
 * - Better storage capacity (localStorage ~5-10MB, IndexedDB ~50% of disk space)
 * - Binary data support
 * - Better performance for large files
 * - Transaction support
 * 
 * Example IndexedDB implementation:
 * ```javascript
 * const db = await openDB('printease-files', 1, {
 *   upgrade(db) {
 *     db.createObjectStore('files', { keyPath: 'id' });
 *   }
 * });
 * await db.put('files', fileData);
 * ```
 */

const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2MB
const STORAGE_KEY = 'printease_files';

/**
 * Get all stored files
 * @returns {Array} Array of file metadata
 */
export const getStoredFiles = () => {
  try {
    const files = localStorage.getItem(STORAGE_KEY);
    return JSON.parse(files || '[]');
  } catch (error) {
    console.error('Error reading stored files:', error);
    return [];
  }
};

/**
 * Save file metadata and optionally thumbnail
 * @param {File} file - File object
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} File metadata object
 */
export const saveFile = async (file, options = {}) => {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const isSmallFile = file.size <= MAX_THUMBNAIL_SIZE;
  
  const fileData = {
    id: fileId,
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    uploadedAt: new Date().toISOString(),
    hasThumbnail: isSmallFile,
    thumbnail: null,
    ...options,
  };

  // For small files, create thumbnail/base64 preview
  if (isSmallFile) {
    try {
      const thumbnail = await createThumbnail(file);
      fileData.thumbnail = thumbnail;
    } catch (error) {
      console.warn('Could not create thumbnail:', error);
      fileData.hasThumbnail = false;
    }
  } else {
    // For large files, add comment about re-upload requirement
    fileData.note = 'Large file - will require re-upload when needed';
  }

  // Save to localStorage
  const files = getStoredFiles();
  files.push(fileData);
  
  // Keep only last 50 files to prevent localStorage overflow
  if (files.length > 50) {
    files.splice(0, files.length - 50);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));

  return fileData;
};

/**
 * Create thumbnail/base64 preview for small files
 * @param {File} file - File object
 * @returns {Promise<string>} Base64 thumbnail string
 */
const createThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    // For images, create actual thumbnail
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Create thumbnail image
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      // For non-image files, just store file icon representation
      // In production, you might want to generate PDF thumbnails, etc.
      resolve(null);
    }
  });
};

/**
 * Get file by ID
 * @param {string} fileId - File ID
 * @returns {Object|null} File metadata or null
 */
export const getFile = (fileId) => {
  const files = getStoredFiles();
  return files.find((f) => f.id === fileId) || null;
};

/**
 * Delete file
 * @param {string} fileId - File ID
 */
export const deleteFile = (fileId) => {
  const files = getStoredFiles();
  const filtered = files.filter((f) => f.id !== fileId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Clear all stored files
 */
export const clearAllFiles = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if file needs re-upload (large file without actual file data)
 * @param {Object} fileData - File metadata
 * @returns {boolean} True if re-upload is needed
 */
export const needsReupload = (fileData) => {
  return !fileData.hasThumbnail && fileData.size > MAX_THUMBNAIL_SIZE;
};

/**
 * PRODUCTION RECOMMENDATION: IndexedDB Implementation
 * 
 * For production, replace localStorage with IndexedDB:
 * 
 * 1. Install: npm install idb
 * 
 * 2. Create database:
 * ```javascript
 * import { openDB } from 'idb';
 * 
 * const db = await openDB('printease-files', 1, {
 *   upgrade(db) {
 *     const store = db.createObjectStore('files', { keyPath: 'id' });
 *     store.createIndex('uploadedAt', 'uploadedAt');
 *   }
 * });
 * ```
 * 
 * 3. Store files:
 * ```javascript
 * await db.put('files', {
 *   id: fileId,
 *   name: file.name,
 *   data: await file.arrayBuffer(), // Store actual file data
 *   metadata: { ... }
 * });
 * ```
 * 
 * 4. Retrieve files:
 * ```javascript
 * const fileData = await db.get('files', fileId);
 * const blob = new Blob([fileData.data], { type: fileData.metadata.type });
 * ```
 * 
 * Benefits:
 * - Much larger storage capacity
 * - Better performance for binary data
 * - Transaction support
 * - Indexed queries
 * - Async operations (non-blocking)
 */

