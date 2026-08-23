// src/lib/utils/image-bg-remove-ml.ts
import { Logger } from "./logger";

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
 * Removes image background using @imgly/background-removal running in-browser ONNX model.
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
        onProgress?.(`Đang làm ảo thuật ... (${percent}%)`, percent);
      } else {
        onProgress?.(`Đang xử lý hình ảnh... (${percent}%)`, percent);
      }
    },
  });

  return blob;
}

/**
 * Fallback background removal using 2D canvas color-keying / luminance thresholding.
 * Used when offline on first load or in environments where WASM/WebGPU is unavailable.
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

  // Sample corner pixels to detect background color
  const corners = [
    0, // Top-Left
    (canvas.width - 1) * 4, // Top-Right
    (canvas.height - 1) * canvas.width * 4, // Bottom-Left
    (canvas.height * canvas.width - 1) * 4, // Bottom-Right
  ];

  let bgR = 255;
  let bgG = 255;
  let bgB = 255;

  if (len >= 4) {
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

    if (count > 0) {
      bgR = Math.round(totalR / count);
      bgG = Math.round(totalG / count);
      bgB = Math.round(totalB / count);
    }
  }

  const threshold = 35; // Color distance tolerance

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    // Color distance to background
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    const isNearWhite = r > 240 && g > 240 && b > 240;

    if (dist < threshold || isNearWhite) {
      data[i + 3] = 0; // Make transparent
    } else if (dist < threshold * 1.5) {
      // Smooth antialiased edges
      const factor = (dist - threshold) / (threshold * 0.5);
      data[i + 3] = Math.round(a * Math.max(0, Math.min(1, factor)));
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvasToBlob(canvas, "image/png");
}

/**
 * Automatically crops away unused transparent margins around the graphic.
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

  // If image is completely transparent or empty
  if (maxX < minX || maxY < minY) {
    return canvas;
  }

  // Apply safe padding
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
 * Resizes and optimizes canvas for EPUB inclusion.
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
 * High-level background remover: tries ML first, falls back to canvas thresholding if unavailable.
 */
export async function removeOrnamentBackground(
  imageSource: Blob | File,
  onProgress?: (statusText: string, percent: number) => void,
): Promise<Blob> {
  try {
    onProgress?.("Đang làm ảo thuật...", 5);
    return await removeImageBackgroundML(imageSource, onProgress);
  } catch (err) {
    Logger.warn(
      "[removeOrnamentBackground]",
      "ML model unavailable or failed, using canvas fallback",
      err,
    );
    onProgress?.("Đang tách nền tự động (fallback)...", 50);
    return await removeImageBackgroundFallback(imageSource);
  }
}

/**
 * Complete ornament pipeline:
 * 1. Background removal (ML with Fallback)
 * 2. Auto-crop unused space
 * 3. Resize & compress for EPUB
 * 4. Return optimized transparent Blob and preview URL
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

  onProgress?.("Bắt đầu xử lý ảnh trang trí...", 0);

  // 1. Remove background
  const transparentBlob = await removeOrnamentBackground(
    imageSource,
    onProgress,
  );

  onProgress?.("Đang cắt viền thừa (Auto-crop)...", 80);

  // 2. Load transparent image to canvas
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

  // 3. Auto-crop wasted space
  canvas = autoCropTransparentCanvas(canvas, padding, alphaThreshold);

  onProgress?.("Đang tối ưu dung lượng cho EPUB...", 90);

  // 4. Compress / resize for EPUB
  canvas = compressAndResizeCanvas(canvas, maxWidth, maxHeight);

  // 5. Generate final PNG blob & preview URL
  const finalBlob = await canvasToBlob(canvas, "image/png", 0.92);
  const previewUrl =
    typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
      ? URL.createObjectURL(finalBlob)
      : "";

  onProgress?.("Hoàn tất xử lý ảnh trang trí!", 100);

  return {
    blob: finalBlob,
    width: canvas.width,
    height: canvas.height,
    previewUrl,
  };
}
