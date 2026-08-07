import { slugify, ensureZipExt, triggerDownload } from './helpers.js';

export function initMdFixer() {
  const mdDrop = document.getElementById('md-drop');
  const mdInput = document.getElementById('md-input');
  const mdFileChip = document.getElementById('md-file-chip');
  const mdProcessBtn = document.getElementById('md-process-btn');
  const mdDownloadBtn = document.getElementById('md-download-btn');
  const mdStatus = document.getElementById('md-status');
  const zipOutNameInput = document.getElementById('zip-out-name');
  const mdZipNamePreview = document.getElementById('md-zip-name-preview');
  const mdResultBox = document.getElementById('md-result-box');
  const mdFileCountEl = document.getElementById('md-file-count');
  const mdReplaceCountEl = document.getElementById('md-replace-count');
  const mdListEl = document.getElementById('md-list');
  const mdItalicOpenInput = document.getElementById('md-italic-open');
  const mdItalicCloseInput = document.getElementById('md-italic-close');
  const mdBiOpenInput = document.getElementById('md-bi-open');
  const mdBiCloseInput = document.getElementById('md-bi-close');
  const mdSampleItalic = document.getElementById('md-sample-italic');
  const mdSampleBi = document.getElementById('md-sample-bi');

  function currentMdWrappers(){
    return {
      iOpen: mdItalicOpenInput.value,
      iClose: mdItalicCloseInput.value,
      biOpen: mdBiOpenInput.value,
      biClose: mdBiCloseInput.value
    };
  }
  function updateMdSample(){
    const w = currentMdWrappers();
    mdSampleItalic.textContent = w.iOpen + 'nghiêng' + w.iClose;
    mdSampleBi.textContent = w.biOpen + 'đậm nghiêng' + w.biClose;
  }
  [mdItalicOpenInput, mdItalicCloseInput, mdBiOpenInput, mdBiCloseInput].forEach(el =>
    el.addEventListener('input', updateMdSample)
  );

  let mdSelectedFile = null;
  let mdOutZipBlob = null;

  function updateMdZipPreview(){
    const name = zipOutNameInput.value.trim() || 'ten-file-goc-da-fix';
    mdZipNamePreview.textContent = ensureZipExt(name);
  }
  zipOutNameInput.addEventListener('input', updateMdZipPreview);

  ['dragover','dragenter'].forEach(evt => mdDrop.addEventListener(evt, e => { e.preventDefault(); mdDrop.classList.add('drag'); }));
  ['dragleave','drop'].forEach(evt => mdDrop.addEventListener(evt, e => { mdDrop.classList.remove('drag'); }));
  mdDrop.addEventListener('drop', e => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { mdInput.files = e.dataTransfer.files; handleMdFile(f); }
  });
  mdInput.addEventListener('change', () => {
    if (mdInput.files[0]) handleMdFile(mdInput.files[0]);
  });

  function handleMdFile(file){
    if (!/\.zip$/i.test(file.name)) {
      mdStatus.textContent = 'Vui lòng chọn một file .zip hợp lệ.';
      mdStatus.classList.add('err');
      return;
    }
    mdStatus.textContent = '';
    mdStatus.classList.remove('err');
    mdSelectedFile = file;
    mdFileChip.textContent = file.name;
    zipOutNameInput.value = slugify(file.name) + '-da-fix';
    updateMdZipPreview();
    mdProcessBtn.disabled = false;
    mdDownloadBtn.disabled = true;
    mdOutZipBlob = null;
    mdResultBox.classList.remove('show');
    mdListEl.innerHTML = '';
  }

  const MAX_SPAN = 150;
  const SPAN = '(?:(?!\\n[ \\t]*\\n)[\\s\\S]){1,' + MAX_SPAN + '}?';

  const BOLD_ITALIC_PATTERNS = [
    new RegExp('\\*\\*\\*(' + SPAN + ')\\*\\*\\*', 'g'),
    new RegExp('(?<!_)___(' + SPAN + ')___(?!_)', 'g'),
    new RegExp('\\*\\*_(' + SPAN + ')_\\*\\*', 'g'),
    new RegExp('__\\*(' + SPAN + ')\\*__', 'g'),
    new RegExp('\\*__(' + SPAN + ')__\\*', 'g'),
    new RegExp('_\\*\\*(' + SPAN + ')\\*\\*_', 'g')
  ];
  const ITALIC_PATTERNS = [
    new RegExp('(?<!\\*)\\*(?!\\*)(' + SPAN + ')(?<!\\*)\\*(?!\\*)', 'g'),
    new RegExp('(?<![\\w_])_(?!_)(' + SPAN + ')(?<!_)_(?![\\w_])', 'g')
  ];

  function convertBrackets(text, wrappers){
    const w = wrappers || {};
    const biOpen = w.biOpen != null ? w.biOpen : '[';
    const biClose = w.biClose != null ? w.biClose : ']';
    const iOpen = w.iOpen != null ? w.iOpen : '[';
    const iClose = w.iClose != null ? w.iClose : ']';
    let count = 0;
    let converted = text;
    for (const pattern of BOLD_ITALIC_PATTERNS) {
      converted = converted.replace(pattern, (match, inner) => {
        count++;
        return biOpen + inner + biClose;
      });
    }
    for (const pattern of ITALIC_PATTERNS) {
      converted = converted.replace(pattern, (match, inner) => {
        count++;
        return iOpen + inner + iClose;
      });
    }
    return { converted, count };
  }

  mdProcessBtn.addEventListener('click', async () => {
    if (!mdSelectedFile) return;
    mdProcessBtn.disabled = true;
    mdDownloadBtn.disabled = true;
    mdStatus.textContent = 'Đang đọc file .zip…';
    mdStatus.classList.remove('err');
    mdListEl.innerHTML = '';

    try {
      const arrayBuffer = await mdSelectedFile.arrayBuffer();
      const inZip = await window.JSZip.loadAsync(arrayBuffer);
      const outZip = new window.JSZip();

      let totalFiles = 0;
      let totalReplacements = 0;
      const rows = [];

      const entries = Object.values(inZip.files);
      for (const entry of entries) {
        if (entry.dir) continue;
        if (/\.md$/i.test(entry.name)) {
          const content = await entry.async('string');
          const { converted, count } = convertBrackets(content, currentMdWrappers());
          outZip.file(entry.name, converted);
          totalFiles++;
          totalReplacements += count;
          rows.push({ path: entry.name, count });
        } else {
          const blob = await entry.async('blob');
          outZip.file(entry.name, blob);
        }
      }

      mdStatus.textContent = 'Đang nén file kết quả…';
      mdOutZipBlob = await outZip.generateAsync({ type: 'blob' });

      mdFileCountEl.textContent = totalFiles;
      mdReplaceCountEl.textContent = totalReplacements;
      rows.sort((a, b) => b.count - a.count);
      mdListEl.innerHTML = rows.map(r =>
        '<div class="md-row"><span class="path">' + r.path + '</span><span class="count">' + r.count + ' lượt</span></div>'
      ).join('');
      mdResultBox.classList.add('show');

      mdStatus.textContent = totalFiles > 0
        ? 'Hoàn tất — sẵn sàng tải về.'
        : 'Không tìm thấy file .md nào trong .zip này.';
      mdDownloadBtn.disabled = false;
    } catch (err) {
      console.error(err);
      mdStatus.textContent = 'Có lỗi khi xử lý file: ' + err.message;
      mdStatus.classList.add('err');
    } finally {
      mdProcessBtn.disabled = false;
    }
  });

  mdDownloadBtn.addEventListener('click', () => {
    if (!mdOutZipBlob) return;
    const name = ensureZipExt(zipOutNameInput.value.trim() || 'ten-file-goc-da-fix');
    triggerDownload(mdOutZipBlob, name);
  });
}
