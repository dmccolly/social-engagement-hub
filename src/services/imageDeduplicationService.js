// src/services/imageDeduplicationService.js

/**
 * Image Deduplication Service
 * 
 * This service prevents duplicate image uploads by:
 * 1. Computing a checksum (hash) of each file before upload
 * 2. Storing checksums of uploaded images in localStorage
 * 3. Reusing existing Cloudinary URLs for duplicate files
 */

import { uploadImageToCloudinary } from './cloudinaryService';

// Storage key for image checksums
const STORAGE_KEY = 'uploaded_images_registry';

/**
 * Compute SHA-256 checksum of a file
 * @param {File} file - The file to hash
 * @returns {Promise<string>} Hex string of the file's SHA-256 hash
 */
export const computeFileChecksum = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Get the registry of uploaded images from localStorage
 * @returns {Object} Registry mapping checksums to image data
 */
const getImageRegistry = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading image registry:', error);
    return {};
  }
};

/**
 * Save the image registry to localStorage
 * @param {Object} registry - Registry to save
 */
const saveImageRegistry = (registry) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
  } catch (error) {
    console.error('Error saving image registry:', error);
  }
};

/**
 * Register a newly uploaded image
 * @param {string} checksum - File checksum
 * @param {Object} imageData - Image data including URL, dimensions, etc.
 */
const registerImage = (checksum, imageData) => {
  const registry = getImageRegistry();
  registry[checksum] = {
    ...imageData,
    uploadedAt: new Date().toISOString(),
    useCount: 1
  };
  saveImageRegistry(registry);
};

/**
 * Increment use count for an existing image
 * @param {string} checksum - File checksum
 */
const incrementUseCount = (checksum) => {
  const registry = getImageRegistry();
  if (registry[checksum]) {
    registry[checksum].useCount = (registry[checksum].useCount || 1) + 1;
    registry[checksum].lastUsedAt = new Date().toISOString();
    saveImageRegistry(registry);
  }
};

/**
 * Upload image with deduplication
 * If the file was already uploaded, returns the existing URL
 * Otherwise uploads to Cloudinary and registers it
 * 
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} Result object with success, url, and metadata
 */
export const uploadImageWithDeduplication = async (file) => {
  console.log('Starting deduplicated upload for:', file.name);
  
  try {
    // Step 1: Compute file checksum
    const checksum = await computeFileChecksum(file);
    console.log('File checksum:', checksum);
    
    // Step 2: Check if file was already uploaded
    const registry = getImageRegistry();
    const existingImage = registry[checksum];
    
    if (existingImage) {
      console.log('✓ Duplicate detected! Reusing existing image:', existingImage.url);
      incrementUseCount(checksum);
      
      return {
        success: true,
        url: existingImage.url,
        publicId: existingImage.publicId,
        width: existingImage.width,
        height: existingImage.height,
        format: existingImage.format,
        bytes: existingImage.bytes,
        isDuplicate: true,
        originalFileName: existingImage.fileName,
        useCount: existingImage.useCount + 1
      };
    }
    
    // Step 3: File is new, upload to Cloudinary
    console.log('New file detected, uploading to Cloudinary...');
    const uploadResult = await uploadImageToCloudinary(file);
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }
    
    // Step 4: Register the new image
    const imageData = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      fileName: file.name
    };
    
    registerImage(checksum, imageData);
    console.log('✓ New image uploaded and registered');
    
    return {
      ...uploadResult,
      isDuplicate: false,
      useCount: 1
    };
    
  } catch (error) {
    console.error('Deduplicated upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get statistics about uploaded images
 * @returns {Object} Statistics including total images, total size, etc.
 */
export const getImageStats = () => {
  const registry = getImageRegistry();
  const images = Object.values(registry);
  
  return {
    totalImages: images.length,
    totalBytes: images.reduce((sum, img) => sum + (img.bytes || 0), 0),
    totalUses: images.reduce((sum, img) => sum + (img.useCount || 1), 0),
    mostUsedImage: images.sort((a, b) => (b.useCount || 1) - (a.useCount || 1))[0],
    oldestImage: images.sort((a, b) => 
      new Date(a.uploadedAt) - new Date(b.uploadedAt)
    )[0]
  };
};

/**
 * Clear the image registry (use with caution)
 * This doesn't delete images from Cloudinary, only the local registry
 */
export const clearImageRegistry = () => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('Image registry cleared');
};

/**
 * Export the registry for backup/debugging
 * @returns {Object} The complete image registry
 */
export const exportImageRegistry = () => {
  return getImageRegistry();
};

/**
 * Import a registry (for restore/migration)
 * @param {Object} registry - Registry to import
 */
export const importImageRegistry = (registry) => {
  saveImageRegistry(registry);
  console.log('Image registry imported');
};