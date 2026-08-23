// src/lib/epub-packer/state/epub-images-state.svelte.ts
import JSZip from 'jszip';
import type { CoverBlobItem, IllustrationImageItem } from '$lib/types';
import { Logger, processOrnamentImage } from '$lib/utils';

export class EpubImagesState {
	// Cover Image States
	coverFile = $state<File | null>(null);
	coverOriginalUrl = $state<string | null>(null);
	coverWidth = $state<number>(0);
	coverHeight = $state<number>(0);
	coverCropTop = $state<number>(0);
	coverCropBottom = $state<number>(0);
	coverCropLeft = $state<number>(0);
	coverCropRight = $state<number>(0);

	// Status states for cover operations
	coverStatus = $state<string>('');
	coverIsError = $state<boolean>(false);

	// Chapter Ornament States
	chapterOrnamentFile = $state<File | null>(null);
	chapterOrnamentBlob = $state<Blob | null>(null);
	chapterOrnamentPreviewUrl = $state<string | null>(null);
	chapterOrnamentStatus = $state<string>('');
	chapterOrnamentIsProcessing = $state<boolean>(false);
	chapterOrnamentError = $state<string | null>(null);

	// Subchapter Ornament States
	subchapterOrnamentFile = $state<File | null>(null);
	subchapterOrnamentBlob = $state<Blob | null>(null);
	subchapterOrnamentPreviewUrl = $state<string | null>(null);
	subchapterOrnamentStatus = $state<string>('');
	subchapterOrnamentIsProcessing = $state<boolean>(false);
	subchapterOrnamentError = $state<string | null>(null);

	// Illustration Images States
	illustrationFiles = $state<IllustrationImageItem[]>([]);

	// Callback for when illustrations change (e.g. to re-trigger TXT grouping)
	onIllustrationsChanged?: () => void;

	getImageMimeType(fileName?: string): string {
		const ext = (fileName || '').split('.').pop()?.toLowerCase();
		switch (ext) {
			case 'png': return 'image/png';
			case 'webp': return 'image/webp';
			case 'gif': return 'image/gif';
			case 'svg': return 'image/svg+xml';
			case 'jpg':
			case 'jpeg':
			default:
				return 'image/jpeg';
		}
	}

	async handleIllustrationFiles(filesInput: FileList | File[] | File | null): Promise<void> {
		if (!filesInput) return;
		const filesList: File[] = filesInput instanceof FileList || Array.isArray(filesInput)
			? Array.from(filesInput)
			: [filesInput];

		for (const file of filesList) {
			if (/\.zip$/i.test(file.name)) {
				try {
					const zip = await JSZip.loadAsync(file);
					for (const name of Object.keys(zip.files)) {
						if (!zip.files[name].dir && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)) {
							const blob = await zip.files[name].async('blob');
							const fileName = name.split('/').pop() || name;
							const baseName = fileName.replace(/\.[^.]+$/, '');
							const mimeType = this.getImageMimeType(fileName);

							const existingIdx = this.illustrationFiles.findIndex(
								f => f.fileName.toLowerCase() === fileName.toLowerCase() || (f.name && f.name.toLowerCase() === baseName.toLowerCase())
							);
							const item: IllustrationImageItem = { name: baseName, fileName, mimeType, blob, size: blob.size };
							if (existingIdx !== -1) {
								this.illustrationFiles[existingIdx] = item;
							} else {
								this.illustrationFiles.push(item);
							}
						}
					}
				} catch (err) {
					Logger.error('[EpubImagesState]', 'Error extracting images zip', err);
				}
			} else if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name)) {
				const fileName = file.name;
				const baseName = fileName.replace(/\.[^.]+$/, '');
				const mimeType = file.type || this.getImageMimeType(fileName);

				const existingIdx = this.illustrationFiles.findIndex(
					f => f.fileName.toLowerCase() === fileName.toLowerCase() || (f.name && f.name.toLowerCase() === baseName.toLowerCase())
				);
				const item: IllustrationImageItem = { name: baseName, fileName, mimeType, blob: file, size: file.size };
				if (existingIdx !== -1) {
					this.illustrationFiles[existingIdx] = item;
				} else {
					this.illustrationFiles.push(item);
				}
			}
		}

		this.onIllustrationsChanged?.();
	}

	removeIllustrationFile(idx: number): void {
		this.illustrationFiles.splice(idx, 1);
		this.onIllustrationsChanged?.();
	}

	clearIllustrationFiles(): void {
		this.illustrationFiles = [];
		this.onIllustrationsChanged?.();
	}

	async handleChapterOrnamentFile(file: File | null): Promise<void> {
		if (!file) return;
		this.chapterOrnamentFile = file;
		this.chapterOrnamentError = null;
		this.chapterOrnamentStatus = 'Đang xếp hàng chờ xử lý...';
		this.chapterOrnamentIsProcessing = true;

		if (this.chapterOrnamentPreviewUrl) {
			URL.revokeObjectURL(this.chapterOrnamentPreviewUrl);
			this.chapterOrnamentPreviewUrl = null;
		}

		try {
			const result = await processOrnamentImage(file, {
				onProgress: (statusText) => {
					this.chapterOrnamentStatus = statusText;
				}
			});
			this.chapterOrnamentBlob = result.blob;
			this.chapterOrnamentPreviewUrl = result.previewUrl;
			this.chapterOrnamentStatus = 'Đã hoàn tất tối ưu';
		} catch (err) {
			Logger.error('[EpubImagesState]', 'Error processing chapter ornament', err);
			this.chapterOrnamentError = err instanceof Error ? err.message : String(err);
			this.chapterOrnamentStatus = 'Lỗi xử lý ảnh';
		} finally {
			this.chapterOrnamentIsProcessing = false;
		}
	}

	removeChapterOrnamentFile(): void {
		if (this.chapterOrnamentPreviewUrl) {
			URL.revokeObjectURL(this.chapterOrnamentPreviewUrl);
		}
		this.chapterOrnamentFile = null;
		this.chapterOrnamentBlob = null;
		this.chapterOrnamentPreviewUrl = null;
		this.chapterOrnamentStatus = '';
		this.chapterOrnamentIsProcessing = false;
		this.chapterOrnamentError = null;
	}

	async handleSubchapterOrnamentFile(file: File | null): Promise<void> {
		if (!file) return;
		this.subchapterOrnamentFile = file;
		this.subchapterOrnamentError = null;
		this.subchapterOrnamentStatus = 'Đang xếp hàng chờ xử lý...';
		this.subchapterOrnamentIsProcessing = true;

		if (this.subchapterOrnamentPreviewUrl) {
			URL.revokeObjectURL(this.subchapterOrnamentPreviewUrl);
			this.subchapterOrnamentPreviewUrl = null;
		}

		try {
			const result = await processOrnamentImage(file, {
				onProgress: (statusText) => {
					this.subchapterOrnamentStatus = statusText;
				}
			});
			this.subchapterOrnamentBlob = result.blob;
			this.subchapterOrnamentPreviewUrl = result.previewUrl;
			this.subchapterOrnamentStatus = 'Đã hoàn tất tối ưu';
		} catch (err) {
			Logger.error('[EpubImagesState]', 'Error processing subchapter ornament', err);
			this.subchapterOrnamentError = err instanceof Error ? err.message : String(err);
			this.subchapterOrnamentStatus = 'Lỗi xử lý ảnh';
		} finally {
			this.subchapterOrnamentIsProcessing = false;
		}
	}

	removeSubchapterOrnamentFile(): void {
		if (this.subchapterOrnamentPreviewUrl) {
			URL.revokeObjectURL(this.subchapterOrnamentPreviewUrl);
		}
		this.subchapterOrnamentFile = null;
		this.subchapterOrnamentBlob = null;
		this.subchapterOrnamentPreviewUrl = null;
		this.subchapterOrnamentStatus = '';
		this.subchapterOrnamentIsProcessing = false;
		this.subchapterOrnamentError = null;
	}

	adjustCoverCrop(side: 'top' | 'bottom' | 'left' | 'right', value: number): void {
		if (side === 'top') this.coverCropTop = Math.max(0, this.coverCropTop + value);
		if (side === 'bottom') this.coverCropBottom = Math.max(0, this.coverCropBottom + value);
		if (side === 'left') this.coverCropLeft = Math.max(0, this.coverCropLeft + value);
		if (side === 'right') this.coverCropRight = Math.max(0, this.coverCropRight + value);
	}

	resetCoverCrop(): void {
		this.coverCropTop = 0;
		this.coverCropBottom = 0;
		this.coverCropLeft = 0;
		this.coverCropRight = 0;
	}

	async handleCoverFile(file: File | null): Promise<void> {
		if (!file) return;
		this.coverFile = file;
		this.resetCoverCrop();

		const isPdf = /\.pdf$/i.test(file.name);
		if (isPdf) {
			const globalPdfjs = typeof window !== 'undefined' ? (window as unknown as { pdfjsLib?: any }).pdfjsLib : null;
			if (!globalPdfjs) {
				Logger.error('[EpubImagesState]', 'pdfjsLib is missing');
				this.coverStatus = 'Không thể tải ảnh bìa từ PDF do thiếu thư viện PDF.js';
				this.coverIsError = true;
				return;
			}
			try {
				this.coverStatus = 'Đang trích xuất trang bìa từ tệp PDF...';
				const arrayBuffer = await file.arrayBuffer();
				const doc = await globalPdfjs.getDocument({ data: arrayBuffer }).promise;
				const page = await doc.getPage(1);
				const viewport = page.getViewport({ scale: 2.0 });
				const canvas = document.createElement('canvas');
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					await page.render({ canvasContext: ctx, viewport }).promise;
					this.coverOriginalUrl = canvas.toDataURL('image/jpeg', 0.9);
					this.coverWidth = canvas.width;
					this.coverHeight = canvas.height;
				}
				page.cleanup();
				doc.destroy();
				this.coverStatus = '';
				this.coverIsError = false;
			} catch (err: unknown) {
				const errorMsg = err instanceof Error ? err.message : String(err);
				Logger.error('[EpubImagesState]', 'Error extracting PDF page 1', err);
				this.coverStatus = 'Lỗi trích xuất PDF: ' + errorMsg;
				this.coverIsError = true;
			}
		} else {
			const reader = new FileReader();
			reader.onload = (e) => {
				const img = new Image();
				img.onload = () => {
					this.coverOriginalUrl = (e.target?.result as string) || null;
					this.coverWidth = img.naturalWidth;
					this.coverHeight = img.naturalHeight;
				};
				img.src = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	removeCoverFile(): void {
		this.coverFile = null;
		this.coverOriginalUrl = null;
		this.coverWidth = 0;
		this.coverHeight = 0;
		this.resetCoverCrop();
	}

	async getOptimizedCoverBlob(): Promise<CoverBlobItem | null> {
		if (!this.coverOriginalUrl) return null;
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const w = img.naturalWidth;
				const h = img.naturalHeight;
				const safeTop = Math.max(0, Math.min(this.coverCropTop, h - 1));
				const safeBottom = Math.max(0, Math.min(this.coverCropBottom, h - 1 - safeTop));
				const safeLeft = Math.max(0, Math.min(this.coverCropLeft, w - 1));
				const safeRight = Math.max(0, Math.min(this.coverCropRight, w - 1 - safeLeft));

				const croppedW = w - safeLeft - safeRight;
				const croppedH = h - safeTop - safeBottom;

				const canvas = document.createElement('canvas');
				const maxDim = 1400;
				let scale = 1.0;
				if (croppedW > maxDim || croppedH > maxDim) {
					scale = maxDim / Math.max(croppedW, croppedH);
				}
				canvas.width = Math.round(croppedW * scale);
				canvas.height = Math.round(croppedH * scale);

				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(
						img,
						safeLeft, safeTop, croppedW, croppedH,
						0, 0, canvas.width, canvas.height
					);
				}
				canvas.toBlob((blob) => {
					if (blob) {
						const coverBlob = blob as CoverBlobItem;
						coverBlob.width = canvas.width;
						coverBlob.height = canvas.height;
						resolve(coverBlob);
					} else {
						resolve(null);
					}
				}, 'image/jpeg', 0.82);
			};
			img.onerror = (err) => reject(new Error('Lỗi tải ảnh bìa: ' + err));
			img.src = this.coverOriginalUrl!;
		});
	}
}
