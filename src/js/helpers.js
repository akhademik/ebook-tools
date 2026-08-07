// helpers.js

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

export function slugify(name) {
  return name.trim().replace(/\.[^.]+$/, '').replace(/\s+/g, '-') || 'untitled';
}

export function ensureZipExt(name) {
  name = name.trim();
  if (!name) return 'output.zip';
  return /\.zip$/i.test(name) ? name : name + '.zip';
}

export function ensureEpubExt(name) {
  name = name.trim();
  if (!name) return 'output.epub';
  return /\.epub$/i.test(name) ? name : name + '.epub';
}

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
