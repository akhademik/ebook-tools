// src/lib/utils/download.js
import * as logger from '$lib/helpers/logger.js';

/**
 * Triggers a browser file download using a Blob object.
 * @param {Blob} blob - The file content blob to download.
 * @param {string} filename - Desired output filename.
 */
export function triggerDownload(blob, filename) {
  logger.log('download', 'triggerDownload called with filename:', filename, 'blob:', blob);
  if (!blob || !(blob instanceof Blob)) {
    logger.error('download', 'Invalid blob:', blob);
    return;
  }
  const safeFilename = filename || 'download';
  logger.log('download', 'Creating ObjectURL for safeFilename:', safeFilename, 'blob size:', blob.size);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  logger.log('download', 'Download anchor clicked successfully.');
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
