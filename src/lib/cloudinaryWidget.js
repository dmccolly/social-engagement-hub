// src/lib/cloudinaryWidget.js

/*
 * This module provides a helper for working with the Cloudinary upload widget.
 * It defines an `UploadedAsset` shape and functions to normalize the
 * Cloudinary response into a consistent object and open the widget.
 */

// Cloudinary configuration constants. Replace these with your own
// Cloud Name and unsigned upload preset as needed.
const CLOUD_NAME = 'dzrw8nopf'; // <-- your cloud
const UPLOAD_PRESET = 'HIBF_MASTER'; // <-- your unsigned preset

/**
 * Build a thumbnail URL for an uploaded asset based on its resource type.
 * Images and videos use different transformations.
 *
 * @param {Object} info - The asset info returned by Cloudinary
 * @returns {string} The URL of the thumbnail image
 */
function thumbFrom(info) {
  const url = (info && info.secure_url) || '';
  if (!url) return '';
  if (info.resource_type === 'image') {
    return url.replace('/upload/', '/upload/w_300,h_300,c_fill,q_auto,f_auto/');
  }
  if (info.resource_type === 'video') {
    return url
      .replace('/upload/', '/upload/so_0,w_300,h_300,c_fill,q_auto,f_jpg/')
      .replace(/\.[^.]+$/, '.jpg');
  }
  return '';
}

/**
 * Normalize the Cloudinary info into a simple asset object.
 *
 * @param {Object} info - The raw Cloudinary upload info
 * @returns {Object} A normalized asset object
 */
export function normalize(info) {
  return {
    name: `${info.original_filename}${info.format ? '.' + info.format : ''}`,
    title: info.original_filename,
    type: info.resource_type,
    url: info.secure_url,
    thumbnail: thumbFrom(info),
    size: info.bytes,
    duration: info.duration ?? '',
    width: info.width,
    height: info.height,
    publicId: info.public_id,
    format: info.format,
    cloudinaryData: info
  };
}

/**
 * Open the Cloudinary Upload Widget.  You can call this directly or
 * delegate to a global function if you load the widget from a
 * separate HTML file.
 *
 * @param {function(Object): void} onAsset - callback invoked with the uploaded asset
 * @param {function(): void} [onClose] - callback invoked when the widget closes
 * @param {Object} [options] - optional widget configuration
 */
export function openCloudinaryWidget(onAsset, onClose, options = {}) {
  // If a global `openCloudinaryWidget` is defined (e.g. from a separate script), delegate to it
  const createLocal = !!window.cloudinary && typeof window.cloudinary.createUploadWidget === 'function';

  if (!createLocal && typeof window.openCloudinaryWidget === 'function') {
    return window.openCloudinaryWidget((asset) => onAsset(asset), onClose, options);
  }

  const widget = window.cloudinary.createUploadWidget(
    {
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      resourceType: 'auto',
      multiple: options.multiple ?? true,
      folder: options.folder ?? 'uploads',
      maxChunkSize: options.maxChunkSize ?? 50 * 1024 * 1024, // 50 MB chunks for better large file handling
      maxFileSize: options.maxFileSize ?? 100 * 1024 * 1024, // 100 MB max file size
      sources: ['local', 'url', 'camera', 'google_drive', 'dropbox']
    },
    (error, result) => {
      if (error) {
        console.error('[Cloudinary] widget error', error);
        return;
      }
      if (!result) return;
      if (result.event === 'success' && result.info) onAsset(normalize(result.info));
      if (result.event === 'close') onClose?.();
    }
  );
  widget.open();
}