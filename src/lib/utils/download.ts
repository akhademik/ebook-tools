import { Logger } from './logger';

/**
 * Triggers a browser file download using a Blob object.
 * @param blob - The file content blob to download.
 * @param filename - Desired output filename.
 */
export function triggerDownload(blob: Blob | unknown, filename?: string | null): void {
  Logger.debug('[download]', `triggerDownload called with filename: ${filename}`, blob);
  if (!blob || !(blob instanceof Blob)) {
    Logger.error('[download]', 'Invalid blob:', blob);
    return;
  }
  const safeFilename = filename || 'download';
  Logger.debug('[download]', `Creating ObjectURL for safeFilename: ${safeFilename}, blob size: ${blob.size}`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  Logger.debug('[download]', 'Download anchor clicked successfully.');
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
