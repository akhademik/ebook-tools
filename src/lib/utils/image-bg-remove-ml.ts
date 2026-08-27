// src/lib/utils/image-bg-remove-ml.ts
import { Logger } from "./logger";
import type { WorkerRequest, WorkerResponse } from "./image-bg-remove.worker";

export interface OrnamentProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  padding?: number;
  alphaThreshold?: number;
  onProgress?: (statusText: string, percent: number) => void;
}

export interface OrnamentProcessResult {
  blob: Blob;
  width: number;
  height: number;
  previewUrl: string;
}

// Map of pending worker jobs
interface PendingJob {
  onProgress?: (statusText: string, percent: number) => void;
  resolve: (result: OrnamentProcessResult) => void;
  reject: (err: Error) => void;
}

let workerInstance: Worker | null = null;
const pendingJobs = new Map<string, PendingJob>();

/**
 * Cleans up worker instance and rejects all pending jobs upon worker failure.
 */
function cleanupWorkerAndRejectPending(error: Error): void {
  Logger.error("[ImageBgWorker]", "Cleaning up worker and rejecting pending jobs", error);
  for (const [, job] of pendingJobs) {
    try {
      job.reject(error);
    } catch {
      // ignore
    }
  }
  pendingJobs.clear();
  if (workerInstance) {
    try {
      workerInstance.terminate();
    } catch {
      // ignore
    }
    workerInstance = null;
  }
}

/**
 * Lazily initializes the background Web Worker.
 */
function getOrCreateWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return null;
  }

  if (!workerInstance) {
    try {
      workerInstance = new Worker(
        new URL("./image-bg-remove.worker.ts", import.meta.url),
        { type: "module" },
      );

      workerInstance.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const data = e.data;
        if (!data || !data.id) return;

        const job = pendingJobs.get(data.id);
        if (!job) return;

        if (data.type === "progress") {
          job.onProgress?.(data.statusText, data.percent);
        } else if (data.type === "success") {
          pendingJobs.delete(data.id);
          const previewUrl =
            typeof URL !== "undefined" &&
            typeof URL.createObjectURL === "function"
              ? URL.createObjectURL(data.blob)
              : "";
          job.resolve({
            blob: data.blob,
            width: data.width,
            height: data.height,
            previewUrl,
          });
        } else if (data.type === "error") {
          pendingJobs.delete(data.id);
          job.reject(
            new Error(data.error || "Lỗi xử lý ảnh trong background worker"),
          );
        }
      };

      workerInstance.onerror = (err: ErrorEvent) => {
        Logger.error("[ImageBgWorker]", "Worker error event", err);
        const errMsg =
          err && typeof err === "object" && "message" in err && err.message
            ? err.message
            : "Web Worker gặp sự cố không thể xử lý ảnh";
        cleanupWorkerAndRejectPending(new Error(errMsg));
      };

      workerInstance.onmessageerror = (err: MessageEvent) => {
        Logger.error("[ImageBgWorker]", "Worker message error", err);
        cleanupWorkerAndRejectPending(
          new Error("Lỗi truyền dữ liệu với Web Worker"),
        );
      };
    } catch (err) {
      Logger.warn(
        "[ImageBgWorker]",
        "Could not instantiate Web Worker, using main thread fallback",
        err,
      );
      workerInstance = null;
    }
  }

  return workerInstance;
}

/**
 * Yield to the browser's event loop.
 */
export async function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Loads a Blob, File, or URL into an HTMLImageElement
 */
export async function loadImage(
  source: Blob | File | string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof Image === "undefined") {
      return reject(new Error("HTMLImageElement không khả dụng"));
    }

    const img = new Image();
    let url: string;

    if (typeof source === "string") {
      url = source;
    } else {
      url = URL.createObjectURL(source);
    }

    img.onload = () => {
      if (
        typeof source !== "string" &&
        typeof URL.revokeObjectURL === "function"
      ) {
        URL.revokeObjectURL(url);
      }
      resolve(img);
    };

    img.onerror = (err) => {
      if (
        typeof source !== "string" &&
        typeof URL.revokeObjectURL === "function"
      ) {
        URL.revokeObjectURL(url);
      }
      reject(new Error("Không thể tải hình ảnh: " + err));
    };

    img.src = url;
  });
}

/**
 * Convert HTMLCanvasElement to a Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!canvas || typeof canvas.toBlob !== "function") {
      return resolve(new Blob([], { type }));
    }
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Không thể chuyển đổi canvas thành tệp Blob"));
      },
      type,
      quality,
    );
  });
}

/**
 * Pre-scale large images on the main thread (for fallback or testing).
 */
export async function preScaleImageSource(
  source: Blob | File | string,
  maxDimension = 1024,
): Promise<Blob | File | string> {
  if (typeof document === "undefined") {
    return source;
  }

  try {
    const img = await loadImage(source);
    const { naturalWidth: w, naturalHeight: h } = img;

    if (w <= maxDimension && h <= maxDimension) {
      return source;
    }

    const scale = Math.min(maxDimension / w, maxDimension / h);
    const targetW = Math.max(1, Math.round(w * scale));
    const targetH = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return source;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "medium";
    ctx.drawImage(img, 0, 0, targetW, targetH);

    return await canvasToBlob(canvas, "image/png", 0.95);
  } catch {
    return source;
  }
}

/**
 * Main-thread ML background removal (fallback or direct).
 */
export async function removeImageBackgroundML(
  imageSource: Blob | File | string,
  onProgress?: (statusText: string, percent: number) => void,
): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");

  const blob = await removeBackground(imageSource, {
    model: "isnet_quint8",
    output: {
      format: "image/png",
      quality: 0.95,
    },
    progress: (key: string, current: number, total: number) => {
      const ratio = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;
      const percent = Math.round(ratio * 100);

      if (key.includes("fetch") || key.includes("download")) {
        onProgress?.(`Đang chuẩn bị phép thuật... (${percent}%)`, percent);
      } else if (key.includes("compute") || key.includes("inference")) {
        onProgress?.(`Đang làm ảo thuật... (${percent}%)`, percent);
      } else {
        onProgress?.(`Đang xử lý hình ảnh... (${percent}%)`, percent);
      }
    },
  });

  return blob;
}

/**
 * Main-thread fallback background removal.
 */
export async function removeImageBackgroundFallback(
  imageSource: Blob | File | string,
): Promise<Blob> {
  if (typeof document === "undefined") {
    return imageSource instanceof Blob
      ? imageSource
      : new Blob([], { type: "image/png" });
  }

  const img = await loadImage(imageSource);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Không thể khởi tạo Canvas 2D context");

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const len = data.length;

  const corners = [
    0,
    (canvas.width - 1) * 4,
    (canvas.height - 1) * canvas.width * 4,
    (canvas.height * canvas.width - 1) * 4,
  ];

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (const idx of corners) {
    if (idx >= 0 && idx + 2 < len) {
      totalR += data[idx];
      totalG += data[idx + 1];
      totalB += data[idx + 2];
      count++;
    }
  }

  const bgR = count > 0 ? Math.round(totalR / count) : 255;
  const bgG = count > 0 ? Math.round(totalG / count) : 255;
  const bgB = count > 0 ? Math.round(totalB / count) : 255;
  const threshold = 35;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    const isNearWhite = r > 240 && g > 240 && b > 240;

    if (dist < threshold || isNearWhite) {
      data[i + 3] = 0;
    } else if (dist < threshold * 1.5) {
      const factor = (dist - threshold) / (threshold * 0.5);
      data[i + 3] = Math.round(a * Math.max(0, Math.min(1, factor)));
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvasToBlob(canvas, "image/png");
}

/**
 * Main-thread auto crop.
 */
export function autoCropTransparentCanvas(
  canvas: HTMLCanvasElement,
  padding = 4,
  alphaThreshold = 10,
): HTMLCanvasElement {
  if (!canvas || typeof canvas.getContext !== "function") return canvas;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || canvas.width === 0 || canvas.height === 0) return canvas;

  const { width, height } = canvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const alpha = data[rowOffset + x * 4 + 3];
      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return canvas;
  }

  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropMaxX = Math.min(width - 1, maxX + padding);
  const cropMaxY = Math.min(height - 1, maxY + padding);

  const cropWidth = cropMaxX - cropX + 1;
  const cropHeight = cropMaxY - cropY + 1;

  if (typeof document === "undefined") return canvas;
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;

  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) return canvas;

  croppedCtx.drawImage(
    canvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  );

  return croppedCanvas;
}

/**
 * Main-thread resize and compress.
 */
export function compressAndResizeCanvas(
  canvas: HTMLCanvasElement,
  maxWidth = 800,
  maxHeight = 400,
): HTMLCanvasElement {
  if (!canvas) return canvas;
  const { width, height } = canvas;
  if (width <= maxWidth && height <= maxHeight) {
    return canvas;
  }

  const scale = Math.min(maxWidth / width, maxHeight / height, 1.0);
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  if (typeof document === "undefined") return canvas;
  const resizedCanvas = document.createElement("canvas");
  resizedCanvas.width = targetWidth;
  resizedCanvas.height = targetHeight;

  const ctx = resizedCanvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

  return resizedCanvas;
}

/**
 * Direct main-thread background removal fallback.
 */
export async function removeOrnamentBackground(
  imageSource: Blob | File | string,
  onProgress?: (statusText: string, percent: number) => void,
): Promise<Blob> {
  try {
    onProgress?.("Đang làm ảo thuật...", 5);
    await yieldToMain();

    const scaledSource = await preScaleImageSource(imageSource, 1024);
    await yieldToMain();

    return await removeImageBackgroundML(scaledSource, onProgress);
  } catch (err) {
    Logger.warn(
      "[removeOrnamentBackground]",
      "ML model unavailable or failed, using canvas fallback",
      err,
    );
    onProgress?.("Đang tách nền tự động (fallback)...", 50);
    await yieldToMain();
    const scaledSource = await preScaleImageSource(imageSource, 1024);
    return await removeImageBackgroundFallback(scaledSource);
  }
}

/**
 * Main ornament processing entrypoint:
 * - Offloads to background Web Worker if available (100% free main UI thread).
 * - Enables simultaneous parallel processing of multiple ornaments (H1 + H2).
 * - Falls back cleanly to main-thread processing in environments without Web Workers.
 */
export async function processOrnamentImage(
  imageSource: Blob | File,
  options: OrnamentProcessOptions = {},
): Promise<OrnamentProcessResult> {
  const {
    maxWidth = 800,
    maxHeight = 400,
    padding = 4,
    alphaThreshold = 10,
    onProgress,
  } = options;

  const worker = getOrCreateWorker();

  if (worker) {
    return new Promise<OrnamentProcessResult>((resolve, reject) => {
      const jobId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      pendingJobs.set(jobId, {
        onProgress,
        resolve,
        reject,
      });

      const req: WorkerRequest = {
        id: jobId,
        imageBlob: imageSource,
        maxWidth,
        maxHeight,
        padding,
        alphaThreshold,
      };

      worker.postMessage(req);
    });
  }

  // Main-thread fallback
  onProgress?.("Bắt đầu xử lý ảnh trang trí...", 0);
  await yieldToMain();

  const transparentBlob = await removeOrnamentBackground(
    imageSource,
    onProgress,
  );
  await yieldToMain();

  onProgress?.("Đang cắt viền thừa (Auto-crop)...", 80);
  await yieldToMain();

  const img = await loadImage(transparentBlob);
  let canvas =
    typeof document !== "undefined"
      ? document.createElement("canvas")
      : ({} as HTMLCanvasElement);
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext ? canvas.getContext("2d") : null;
  if (ctx) {
    ctx.drawImage(img, 0, 0);
  }

  canvas = autoCropTransparentCanvas(canvas, padding, alphaThreshold);
  await yieldToMain();

  onProgress?.("Đang tối ưu dung lượng cho EPUB...", 90);
  await yieldToMain();

  canvas = compressAndResizeCanvas(canvas, maxWidth, maxHeight);

  const finalBlob = await canvasToBlob(canvas, "image/png", 0.92);
  const previewUrl =
    typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
      ? URL.createObjectURL(finalBlob)
      : "";

  onProgress?.("Đã hoàn tất tối ưu", 100);

  return {
    blob: finalBlob,
    width: canvas.width,
    height: canvas.height,
    previewUrl,
  };
}
