import { slugify, ensureZipExt, triggerDownload } from './helpers.js';

export function initPdfProcessor() {
  const pdfDrop = document.getElementById('pdf-drop');
  const pdfInput = document.getElementById('pdf-input');
  const pdfFileChip = document.getElementById('pdf-file-chip');
  const pdfProcessBtn = document.getElementById('pdf-process-btn');
  const pdfDownloadBtn = document.getElementById('pdf-download-btn');
  const pdfStatus = document.getElementById('pdf-status');
  const pdfProgressWrap = document.getElementById('pdf-progress-wrap');
  const pdfProgressFill = document.getElementById('pdf-progress-fill');
  const pdfProgressLabel = document.getElementById('pdf-progress-label');
  const bookNameInput = document.getElementById('book-name');
  const zipNamePreview = document.getElementById('zip-name-preview');
  const keepColorCheckbox = document.getElementById('keep-color');

  const PDF_SCALE = 2.0;
  const JPEG_QUALITY = 0.85;
  const GRAY_CONTRAST = 1.08;

  // Crop (header/footer) UI
  const cropCard = document.getElementById('crop-card');
  const previewCount10Btn = document.getElementById('preview-count-10');
  const previewCount20Btn = document.getElementById('preview-count-20');
  const cropPreviewBtn = document.getElementById('crop-preview-btn');
  const cropPreviewArea = document.getElementById('crop-preview-area');
  const cropPrevPageBtn = document.getElementById('crop-prev-page');
  const cropNextPageBtn = document.getElementById('crop-next-page');
  const cropPageIndicator = document.getElementById('crop-page-indicator');
  const cropPreviewImg = document.getElementById('crop-preview-img');
  const cropTopMask = document.getElementById('crop-top-mask');
  const cropBottomMask = document.getElementById('crop-bottom-mask');
  const cropTopInput = document.getElementById('crop-top-input');
  const cropBottomInput = document.getElementById('crop-bottom-input');
  const cropResetBtn = document.getElementById('crop-reset-btn');

  let selectedPreviewCount = 10;
  let previewPages = [];
  let currentPreviewIndex = 0;
  let cropTopPx = 0;
  let cropBottomPx = 0;

  function applyGrayscale(ctx, width, height, contrast){
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      let v = (gray - 128) * contrast + 128;
      v = v < 0 ? 0 : (v > 255 ? 255 : v);
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function cropCanvas(sourceCanvas, topPx, bottomPx){
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const safeTop = Math.max(0, Math.min(topPx, h - 1));
    const safeBottom = Math.max(0, Math.min(bottomPx, h - 1 - safeTop));
    const newH = Math.max(1, h - safeTop - safeBottom);
    const out = document.createElement('canvas');
    out.width = w;
    out.height = newH;
    const octx = out.getContext('2d', { alpha: false });
    octx.drawImage(sourceCanvas, 0, safeTop, w, newH, 0, 0, w, newH);
    return out;
  }

  let pdfSelectedFile = null;
  let pdfZipBlob = null;

  function updateZipPreview(){
    const name = bookNameInput.value.trim() || 'ten-sach';
    zipNamePreview.textContent = ensureZipExt(name);
  }
  bookNameInput.addEventListener('input', updateZipPreview);

  ['dragover','dragenter'].forEach(evt => pdfDrop.addEventListener(evt, e => { e.preventDefault(); pdfDrop.classList.add('drag'); }));
  ['dragleave','drop'].forEach(evt => pdfDrop.addEventListener(evt, e => { pdfDrop.classList.remove('drag'); }));
  pdfDrop.addEventListener('drop', e => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { pdfInput.files = e.dataTransfer.files; handlePdfFile(f); }
  });
  pdfInput.addEventListener('change', () => {
    if (pdfInput.files[0]) handlePdfFile(pdfInput.files[0]);
  });

  function handlePdfFile(file){
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      pdfStatus.textContent = 'Vui lòng chọn một tệp PDF hợp lệ.';
      pdfStatus.classList.add('err');
      return;
    }
    pdfStatus.textContent = '';
    pdfStatus.classList.remove('err');
    pdfSelectedFile = file;
    pdfFileChip.textContent = file.name;
    bookNameInput.value = slugify(file.name);
    updateZipPreview();
    pdfProcessBtn.disabled = false;
    pdfDownloadBtn.disabled = true;
    pdfZipBlob = null;
    pdfProgressWrap.style.display = 'none';

    cropCard.style.display = 'block';
    cropPreviewArea.style.display = 'none';
    previewPages = [];
    currentPreviewIndex = 0;
    cropTopPx = 0;
    cropBottomPx = 0;
    cropTopInput.value = 0;
    cropBottomInput.value = 0;
    cropPreviewBtn.textContent = 'Tải xem trước để canh cắt';
  }

  previewCount10Btn.classList.add('active');
  previewCount10Btn.addEventListener('click', () => {
    selectedPreviewCount = 10;
    previewCount10Btn.classList.add('active');
    previewCount20Btn.classList.remove('active');
  });
  previewCount20Btn.addEventListener('click', () => {
    selectedPreviewCount = 20;
    previewCount20Btn.classList.add('active');
    previewCount10Btn.classList.remove('active');
  });

  const cropSummary = document.getElementById('crop-summary');
  function updateCropSummary(){
    if (cropTopPx > 0 || cropBottomPx > 0) {
      cropSummary.textContent = 'Sẽ cắt ' + cropTopPx + 'px trên · ' + cropBottomPx + 'px dưới ở mỗi trang khi xuất.';
    } else {
      cropSummary.textContent = '';
    }
  }

  function renderCurrentPreviewPage(){
    const item = previewPages[currentPreviewIndex];
    if (!item) return;
    cropPreviewImg.src = item.dataUrl;
    cropPageIndicator.textContent = 'Trang ' + item.pageNum + ' (' + (currentPreviewIndex + 1) + '/' + previewPages.length + ')';
    updateCropMaskOverlay();
  }

  function updateCropMaskOverlay(){
    updateCropSummary();
    const item = previewPages[currentPreviewIndex];
    if (!item) return;
    const topPct = Math.min(100, (cropTopPx / item.height) * 100);
    const bottomPct = Math.min(100, (cropBottomPx / item.height) * 100);
    cropTopMask.style.height = topPct + '%';
    cropBottomMask.style.height = bottomPct + '%';
    updateCropSummary();
  }

  cropPreviewBtn.addEventListener('click', async () => {
    if (!pdfSelectedFile) return;
    cropPreviewBtn.disabled = true;
    cropPreviewBtn.textContent = 'Đang tải xem trước…';
    try {
      const arrayBuffer = await pdfSelectedFile.arrayBuffer();
      const doc = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      const count = Math.min(selectedPreviewCount, doc.numPages);
      const keepColor = keepColorCheckbox.checked;
      const pages = [];
      for (let p = 1; p <= count; p++) {
        const page = await doc.getPage(p);
        const viewport = page.getViewport({ scale: PDF_SCALE });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!keepColor) applyGrayscale(ctx, canvas.width, canvas.height, GRAY_CONTRAST);
        pages.push({
          pageNum: p,
          dataUrl: canvas.toDataURL('image/jpeg', 0.8),
          width: canvas.width,
          height: canvas.height
        });
        page.cleanup();
      }
      doc.destroy();
      previewPages = pages;
      currentPreviewIndex = 0;
      cropPreviewArea.style.display = 'block';
      renderCurrentPreviewPage();
    } catch (err) {
      console.error(err);
      pdfStatus.textContent = 'Không tải được xem trước: ' + err.message;
      pdfStatus.classList.add('err');
    } finally {
      cropPreviewBtn.disabled = false;
      cropPreviewBtn.textContent = 'Tải lại xem trước';
    }
  });

  cropPrevPageBtn.addEventListener('click', () => {
    if (previewPages.length === 0) return;
    currentPreviewIndex = (currentPreviewIndex - 1 + previewPages.length) % previewPages.length;
    renderCurrentPreviewPage();
  });
  cropNextPageBtn.addEventListener('click', () => {
    if (previewPages.length === 0) return;
    currentPreviewIndex = (currentPreviewIndex + 1) % previewPages.length;
    renderCurrentPreviewPage();
  });

  function syncCropInputsFromState(){
    cropTopInput.value = cropTopPx;
    cropBottomInput.value = cropBottomPx;
    updateCropMaskOverlay();
  }

  cropTopInput.addEventListener('input', () => {
    cropTopPx = Math.max(0, parseInt(cropTopInput.value) || 0);
    updateCropMaskOverlay();
  });
  cropBottomInput.addEventListener('input', () => {
    cropBottomPx = Math.max(0, parseInt(cropBottomInput.value) || 0);
    updateCropMaskOverlay();
  });

  document.querySelectorAll('[data-adjust]').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = parseInt(btn.dataset.delta, 10);
      if (btn.dataset.adjust === 'top') {
        cropTopPx = Math.max(0, cropTopPx + delta);
      } else {
        cropBottomPx = Math.max(0, cropBottomPx + delta);
      }
      syncCropInputsFromState();
    });
  });

  cropResetBtn.addEventListener('click', () => {
    cropTopPx = 0;
    cropBottomPx = 0;
    syncCropInputsFromState();
  });

  function formatEta(seconds){
    if (!isFinite(seconds) || seconds < 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  }

  function pickConcurrency(fileSizeBytes, numPages){
    let c = navigator.hardwareConcurrency || 4;
    c = Math.min(c, 8);
    if (fileSizeBytes > 300 * 1024 * 1024) c = Math.min(c, 3);
    else if (fileSizeBytes > 150 * 1024 * 1024) c = Math.min(c, 4);
    return Math.max(1, Math.min(c, numPages));
  }

  pdfProcessBtn.addEventListener('click', async () => {
    if (!pdfSelectedFile) return;
    pdfProcessBtn.disabled = true;
    pdfDownloadBtn.disabled = true;
    pdfStatus.textContent = '';
    pdfStatus.classList.remove('err');
    pdfProgressWrap.style.display = 'block';
    pdfProgressFill.style.width = '0%';
    pdfProgressLabel.textContent = 'Đang mở tệp PDF...';

    try {
      const arrayBuffer = await pdfSelectedFile.arrayBuffer();

      const probeDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      const numPages = probeDoc.numPages;
      probeDoc.destroy();

      const zip = new window.JSZip();
      const keepColor = keepColorCheckbox.checked;
      const SCALE = PDF_SCALE;
      const QUALITY = JPEG_QUALITY;
      const cropTop = cropTopPx;
      const cropBottom = cropBottomPx;
      const concurrency = pickConcurrency(pdfSelectedFile.size, numPages);

      let completed = 0;
      const startTime = performance.now();

      function reportProgress(){
        const elapsedSec = (performance.now() - startTime) / 1000;
        const rate = completed / Math.max(elapsedSec, 0.001);
        const remaining = numPages - completed;
        const eta = rate > 0 ? remaining / rate : Infinity;
        pdfProgressFill.style.width = Math.round((completed / numPages) * 100) + '%';
        pdfProgressLabel.textContent =
          'Đang xử lý ' + completed + ' / ' + numPages + ' trang · ' +
          (concurrency > 1 ? concurrency + ' luồng song song · ' : '') +
          rate.toFixed(1) + ' trang/giây · còn lại ~' + formatEta(eta);
      }
      reportProgress();

      async function runWorker(workerIndex){
        const doc = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
        const ctxOpts = keepColor ? { alpha: false } : { alpha: false, willReadFrequently: true };
        for (let p = workerIndex + 1; p <= numPages; p += concurrency) {
          const page = await doc.getPage(p);
          const viewport = page.getViewport({ scale: SCALE });
          let canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          let ctx = canvas.getContext('2d', ctxOpts);
          await page.render({ canvasContext: ctx, viewport }).promise;

          if (cropTop > 0 || cropBottom > 0) {
            canvas = cropCanvas(canvas, cropTop, cropBottom);
            ctx = canvas.getContext('2d', ctxOpts);
          }

          if (!keepColor) {
            applyGrayscale(ctx, canvas.width, canvas.height, GRAY_CONTRAST);
          }

          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
          zip.file('page' + p + '.jpg', blob, { compression: 'STORE' });
          page.cleanup();
          completed++;
          reportProgress();
        }
        doc.destroy();
      }

      const workers = [];
      for (let w = 0; w < concurrency; w++) workers.push(runWorker(w));
      await Promise.all(workers);

      pdfProgressLabel.textContent = 'Đang đóng gói thành tệp .ZIP...';
      pdfZipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      pdfProgressFill.style.width = '100%';
      pdfProgressLabel.textContent = 'Hoàn tất — ' + numPages + ' trang đã sẵn sàng.';
      pdfDownloadBtn.disabled = false;
    } catch (err) {
      console.error(err);
      pdfStatus.textContent = 'Có lỗi khi xử lý tệp: ' + err.message;
      pdfStatus.classList.add('err');
    } finally {
      pdfProcessBtn.disabled = false;
    }
  });

  pdfDownloadBtn.addEventListener('click', () => {
    if (!pdfZipBlob) return;
    const name = ensureZipExt(bookNameInput.value.trim() || 'ten-sach');
    triggerDownload(pdfZipBlob, name);
  });
}
