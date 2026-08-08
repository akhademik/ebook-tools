import JSZip from 'jszip';

const PDF_SCALE = 2.0;
const JPEG_QUALITY = 0.85;
const GRAY_CONTRAST = 1.08;

function applyGrayscale(ctx, width, height, contrast) {
	const imgData = ctx.getImageData(0, 0, width, height);
	const d = imgData.data;
	for (let i = 0; i < d.length; i += 4) {
		const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
		let v = (gray - 128) * contrast + 128;
		v = v < 0 ? 0 : v > 255 ? 255 : v;
		d[i] = d[i + 1] = d[i + 2] = v;
	}
	ctx.putImageData(imgData, 0, 0);
}

function cropCanvas(sourceCanvas, topPx, bottomPx) {
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

export function formatEta(seconds) {
	if (!isFinite(seconds) || seconds < 0) return '--:--';
	const m = Math.floor(seconds / 60);
	const s = Math.round(seconds % 60);
	return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function pickConcurrency(fileSizeBytes, numPages) {
	let c = navigator.hardwareConcurrency || 4;
	c = Math.min(c, 8);
	if (fileSizeBytes > 300 * 1024 * 1024) c = Math.min(c, 3);
	else if (fileSizeBytes > 150 * 1024 * 1024) c = Math.min(c, 4);
	return Math.max(1, Math.min(c, numPages));
}

export async function loadPdfPreview(pdfSelectedFile, selectedPreviewCount, keepColor) {
	if (!pdfSelectedFile || !window.pdfjsLib) {
		throw new Error('Chưa chọn tệp PDF hoặc thư viện PDF.js chưa tải.');
	}

	const arrayBuffer = await pdfSelectedFile.arrayBuffer();
	const doc = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
	const count = Math.min(selectedPreviewCount, doc.numPages);
	const pages = [];
	
	for (let p = 1; p <= count; p++) {
		const page = await doc.getPage(p);
		const viewport = page.getViewport({ scale: PDF_SCALE });
		const canvas = document.createElement('canvas');
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
		await page.render({ canvasContext: ctx, viewport }).promise;
		if (!keepColor) {
			applyGrayscale(ctx, canvas.width, canvas.height, GRAY_CONTRAST);
		}
		pages.push({
			pageNum: p,
			dataUrl: canvas.toDataURL('image/jpeg', 0.8),
			width: canvas.width,
			height: canvas.height
		});
		page.cleanup();
	}
	doc.destroy();
	return pages;
}

export async function processPdfToJpg(pdfSelectedFile, keepColor, cropTopPx, cropBottomPx, onProgress) {
	if (!pdfSelectedFile || !window.pdfjsLib) {
		throw new Error('Chưa chọn tệp PDF hoặc thư viện PDF.js chưa tải.');
	}

	const arrayBuffer = await pdfSelectedFile.arrayBuffer();
	const probeDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
	const numPages = probeDoc.numPages;
	probeDoc.destroy();

	const zip = new JSZip();
	const concurrency = pickConcurrency(pdfSelectedFile.size, numPages);
	let completed = 0;
	const startTime = performance.now();

	function updateProgress() {
		const elapsedSec = (performance.now() - startTime) / 1000;
		const rate = completed / Math.max(elapsedSec, 0.001);
		const remaining = numPages - completed;
		const eta = rate > 0 ? remaining / rate : Infinity;
		const progressPercent = Math.round((completed / numPages) * 100);
		const progressLabel =
			`Đang xử lý ${completed} / ${numPages} trang · ` +
			(concurrency > 1 ? `${concurrency} luồng song song · ` : '') +
			`${rate.toFixed(1)} trang/giây · còn lại ~${formatEta(eta)}`;
		
		if (onProgress) {
			onProgress({ progressPercent, progressLabel, completed, numPages });
		}
	}

	updateProgress();

	async function runWorker(workerIndex) {
		const doc = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
		const ctxOpts = keepColor ? { alpha: false } : { alpha: false, willReadFrequently: true };
		
		for (let p = workerIndex + 1; p <= numPages; p += concurrency) {
			const page = await doc.getPage(p);
			const viewport = page.getViewport({ scale: PDF_SCALE });
			let canvas = document.createElement('canvas');
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			let ctx = canvas.getContext('2d', ctxOpts);
			await page.render({ canvasContext: ctx, viewport }).promise;

			if (cropTopPx > 0 || cropBottomPx > 0) {
				canvas = cropCanvas(canvas, cropTopPx, cropBottomPx);
				ctx = canvas.getContext('2d', ctxOpts);
			}

			if (!keepColor) {
				applyGrayscale(ctx, canvas.width, canvas.height, GRAY_CONTRAST);
			}

			const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
			zip.file('page' + p + '.jpg', blob, { compression: 'STORE' });
			page.cleanup();
			completed++;
			updateProgress();
		}
		doc.destroy();
	}

	const workers = [];
	for (let w = 0; w < concurrency; w++) {
		workers.push(runWorker(w));
	}
	await Promise.all(workers);

	if (onProgress) {
		onProgress({ progressPercent: 95, progressLabel: 'Đang đóng gói thành tệp .ZIP...', completed, numPages });
	}

	const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
	
	if (onProgress) {
		onProgress({ progressPercent: 100, progressLabel: `Hoàn tất — ${numPages} trang đã sẵn sàng.`, completed, numPages });
	}

	return { zipBlob, numPages };
}
