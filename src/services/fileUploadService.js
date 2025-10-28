// src/services/fileUploadService.js
// Service for handling file and image uploads for newsfeed posts

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload multiple files to Cloudinary
 * @param {File[]} files - Array of files to upload
 * @param {Function} onProgress - Optional callback for upload progress
 * @returns {Promise<Object[]>} Array of upload results
 */
export const uploadFiles = async (files, onProgress = null) => {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map((file, index) => 
    uploadSingleFile(file, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    })
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

/**
 * Upload a single file to Cloudinary
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Optional callback for upload progress
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadSingleFile = async (file, onProgress = null) => {
  // Check if Cloudinary is configured
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.warn('Cloudinary not configured, returning mock URL');
    return {
      success: true,
      url: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      isMock: true
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
  // Determine folder based on file type
  const folder = file.type.startsWith('image/') ? 'newsfeed/images' : 'newsfeed/files';
  formData.append('folder', folder);

  // Determine resource type
  const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      fileName: file.name,
      fileSize: data.bytes,
      fileType: file.type,
      width: data.width,
      height: data.height,
      format: data.format,
      resourceType: resourceType
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error.message,
      fileName: file.name
    };
  }
};

/**
 * Upload with progress tracking using XMLHttpRequest
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Callback for upload progress (0-100)
 * @returns {Promise<Object>} Upload result
 */
export const uploadFileWithProgress = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      console.warn('Cloudinary not configured, returning mock URL');
      resolve({
        success: true,
        url: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        isMock: true
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    const folder = file.type.startsWith('image/') ? 'newsfeed/images' : 'newsfeed/files';
    formData.append('folder', folder);

    const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          success: true,
          url: data.secure_url,
          publicId: data.public_id,
          fileName: file.name,
          fileSize: data.bytes,
          fileType: file.type,
          width: data.width,
          height: data.height,
          format: data.format,
          resourceType: resourceType
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
};

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = null, // No size limit by default (user has purchased storage)
    allowedTypes = null,
    maxFiles = 10
  } = options;

  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type if specified
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }

  // Check file size if specified (but no limit by default per user preference)
  if (maxSize && file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB` 
    };
  }

  return { valid: true };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file icon based on file type
 * @param {string} fileType - MIME type of the file
 * @returns {string} Icon name or emoji
 */
export const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
  if (fileType.includes('zip') || fileType.includes('compressed')) return '📦';
  return '📎';
};
