import JSZip from 'jszip';
import {
	MAX_EPUB_FILE_SIZE,
	MAX_EPUB_TOTAL_ENTRIES,
	MAX_EPUB_SINGLE_ENTRY_SIZE,
	MAX_EPUB_TOTAL_UNCOMPRESSED_SIZE
} from '$lib/constants';
import type {
	JSZipInternalStream,
	ZipEntryMetadataStatus,
	ZipExtractionBudgetTracker,
	ZipReadEntryOptions,
	ZipSafetyErrorCode,
	ZipSafetyLimits
} from '$lib/types/zip.type';

export type {
	ZipEntryMetadataStatus,
	ZipExtractionBudgetTracker,
	ZipReadEntryOptions,
	ZipSafetyErrorCode,
	ZipSafetyLimits
};

/**
 * Default safety limits for EPUB archives (EPUB Editor & EPUB → TXT).
 */
export const DEFAULT_EPUB_ZIP_LIMITS: ZipSafetyLimits = {
	maxArchiveFileSize: MAX_EPUB_FILE_SIZE,
	maxEntries: MAX_EPUB_TOTAL_ENTRIES,
	maxSingleEntrySize: MAX_EPUB_SINGLE_ENTRY_SIZE,
	maxTotalUncompressedSize: MAX_EPUB_TOTAL_UNCOMPRESSED_SIZE
};

/**
 * Structured error thrown when a ZIP/EPUB archive violates safety limits or integrity checks.
 */
export class ZipSafetyError extends Error {
	readonly code: ZipSafetyErrorCode;

	constructor(code: ZipSafetyErrorCode, message: string) {
		super(message);
		this.name = 'ZipSafetyError';
		this.code = code;
	}
}

function resolveZipLimits(limits?: Partial<ZipSafetyLimits>): ZipSafetyLimits {
	return {
		maxArchiveFileSize: limits?.maxArchiveFileSize ?? DEFAULT_EPUB_ZIP_LIMITS.maxArchiveFileSize,
		maxEntries: limits?.maxEntries ?? DEFAULT_EPUB_ZIP_LIMITS.maxEntries,
		maxSingleEntrySize: limits?.maxSingleEntrySize ?? DEFAULT_EPUB_ZIP_LIMITS.maxSingleEntrySize,
		maxTotalUncompressedSize:
			limits?.maxTotalUncompressedSize ?? DEFAULT_EPUB_ZIP_LIMITS.maxTotalUncompressedSize
	};
}

function formatMb(bytes: number): string {
	return `${Math.round((bytes / (1024 * 1024)) * 10) / 10}MB`;
}

/**
 * An toàn trích xuất uncompressedSize từ một JSZip entry nếu có metadata hợp lệ.
 * Trả về kích thước byte (số nguyên không âm) hoặc null nếu không xác định được.
 *
 * Lưu ý: JSZip v3 lưu trữ metadata nội bộ của entry tại thuộc tính `_data`.
 * Hàm này đóng gói việc truy xuất an toàn, phòng vệ type checking nghiêm ngặt.
 */
export function getZipEntryUncompressedSize(
	entry: JSZip.JSZipObject | undefined | null
): number | null {
	if (!entry) return null;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const entryData = (entry as any)._data;
	if (
		entryData &&
		typeof entryData.uncompressedSize === 'number' &&
		Number.isFinite(entryData.uncompressedSize) &&
		entryData.uncompressedSize >= 0
	) {
		return entryData.uncompressedSize;
	}

	return null;
}

/**
 * Inspects whether a JSZip entry has declared uncompressed size metadata,
 * an in-memory Promise payload (0-byte entry or in-memory `zip.file()`), or missing/invalid metadata.
 */
export function getZipEntryMetadataStatus(
	entry: JSZip.JSZipObject | undefined | null
): ZipEntryMetadataStatus {
	if (!entry) {
		return { kind: 'missing-or-invalid' };
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const entryData = (entry as any)._data;
	if (entryData && typeof entryData.then === 'function') {
		return { kind: 'in-memory-promise' };
	}

	const size = getZipEntryUncompressedSize(entry);
	if (size !== null) {
		return { kind: 'known', size };
	}

	return { kind: 'missing-or-invalid' };
}

/**
 * Validates and normalizes a ZIP entry path, rejecting path traversal (`..`),
 * absolute paths (`/`, `C:\`), backslashes, and control characters.
 */
export function validateZipEntryPath(entryPath: string): string {
	if (typeof entryPath !== 'string' || entryPath.length === 0) {
		throw new ZipSafetyError('INVALID_PATH', 'Đường dẫn entry trong file ZIP không hợp lệ (rỗng).');
	}

	// Reject ASCII control characters and DEL
	for (let i = 0; i < entryPath.length; i++) {
		const code = entryPath.charCodeAt(i);
		if (code <= 0x1f || code === 0x7f) {
			throw new ZipSafetyError(
				'INVALID_PATH',
				`Đường dẫn entry không hợp lệ (chứa ký tự điều khiển): "${entryPath}".`
			);
		}
	}

	if (entryPath.includes('\\')) {
		throw new ZipSafetyError(
			'INVALID_PATH',
			`Đường dẫn entry không hợp lệ (chứa dấu gạch chéo ngược): "${entryPath}".`
		);
	}

	if (entryPath.startsWith('/') || /^[a-zA-Z]:/.test(entryPath)) {
		throw new ZipSafetyError(
			'INVALID_PATH',
			`Đường dẫn entry không được phép là đường dẫn tuyệt đối: "${entryPath}".`
		);
	}

	const trimmed = entryPath.endsWith('/') ? entryPath.slice(0, -1) : entryPath;
	if (!trimmed) {
		throw new ZipSafetyError(
			'INVALID_PATH',
			`Đường dẫn entry trong file ZIP không hợp lệ: "${entryPath}".`
		);
	}

	const segments = trimmed.split('/');
	for (const seg of segments) {
		if (seg === '' || seg === '.' || seg === '..') {
			throw new ZipSafetyError(
				'INVALID_PATH',
				`Đường dẫn entry chứa thành phần không an toàn ("${seg || '/'}"): "${entryPath}".`
			);
		}
	}

	return trimmed;
}

/**
 * Tracks cumulative uncompressed bytes extracted across multiple ZIP entry reads.
 * Keyed by entry path so re-reading the same entry does not falsely double-count
 * while still accounting for any size increase or spoofed metadata discovered at runtime.
 */
export class ZipExtractionBudget implements ZipExtractionBudgetTracker {
	readonly maxTotalBytes: number;
	private readonly consumedByPath = new Map<string, number>();
	private _usedBytes = 0;

	constructor(maxTotalBytes: number = DEFAULT_EPUB_ZIP_LIMITS.maxTotalUncompressedSize) {
		this.maxTotalBytes = maxTotalBytes;
	}

	get usedBytes(): number {
		return this._usedBytes;
	}

	private computeProjectedBytes(additionalBytes: number, path?: string): number {
		if (!Number.isFinite(additionalBytes) || additionalBytes < 0) {
			throw new ZipSafetyError(
				'INVALID_METADATA',
				'Kích thước byte giải nén không hợp lệ khi kiểm tra giới hạn bộ nhớ.'
			);
		}

		if (!path) {
			return this._usedBytes + additionalBytes;
		}

		const previous = this.consumedByPath.get(path) ?? 0;
		const effectiveEntryBytes = Math.max(previous, additionalBytes);
		return this._usedBytes - previous + effectiveEntryBytes;
	}

	assertCanRead(additionalBytes: number, path?: string): void {
		const projected = this.computeProjectedBytes(additionalBytes, path);
		if (projected > this.maxTotalBytes) {
			throw new ZipSafetyError(
				'TOTAL_UNCOMPRESSED_TOO_LARGE',
				`Tổng dung lượng giải nén EPUB vượt quá giới hạn an toàn (tối đa ${formatMb(this.maxTotalBytes)}).`
			);
		}
	}

	consume(actualBytes: number, path?: string): void {
		const projected = this.computeProjectedBytes(actualBytes, path);
		if (projected > this.maxTotalBytes) {
			throw new ZipSafetyError(
				'TOTAL_UNCOMPRESSED_TOO_LARGE',
				`Tổng dung lượng giải nén EPUB vượt quá giới hạn an toàn (tối đa ${formatMb(this.maxTotalBytes)}).`
			);
		}

		if (path) {
			const previous = this.consumedByPath.get(path) ?? 0;
			if (actualBytes > previous) {
				this.consumedByPath.set(path, actualBytes);
				this._usedBytes = projected;
			}
		} else {
			this._usedBytes = projected;
		}
	}
}

export function createZipExtractionBudget(
	maxTotalBytes: number = DEFAULT_EPUB_ZIP_LIMITS.maxTotalUncompressedSize
): ZipExtractionBudget {
	return new ZipExtractionBudget(maxTotalBytes);
}

const EOCD_SIGNATURE = 0x06054b50;
const CD_FILE_HEADER_SIGNATURE = 0x02014b50;
const ZIP64_COUNT_SENTINEL = 0xffff;
const ZIP64_SIZE_SENTINEL = 0xffffffff;

function decodeZipEntryName(bytes: Uint8Array, isUtf8Flag: boolean): string {
	if (isUtf8Flag || typeof TextDecoder !== 'undefined') {
		try {
			return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
		} catch {
			// Fallback to byte-wise ASCII/Latin-1 mapping below
		}
	}
	let result = '';
	for (let i = 0; i < bytes.length; i++) {
		result += String.fromCharCode(bytes[i]);
	}
	return result;
}

/**
 * Inspects the raw ZIP Central Directory BEFORE calling `JSZip.loadAsync()`.
 * Detects raw duplicate entry names (before JSZip overwrites `zip.files[name]`),
 * abnormal paths, excessive entry counts, and declared uncompressed sizes exceeding limits.
 */
export function inspectRawZipCentralDirectory(
	input: ArrayBuffer | Uint8Array,
	limits?: Partial<ZipSafetyLimits>
): void {
	const resolved = resolveZipLimits(limits);
	const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

	if (bytes.byteLength > resolved.maxArchiveFileSize) {
		throw new ZipSafetyError(
			'ARCHIVE_TOO_LARGE',
			`Dung lượng file EPUB vượt quá giới hạn cho phép (tối đa ${formatMb(resolved.maxArchiveFileSize)}).`
		);
	}

	if (bytes.byteLength < 22) {
		return;
	}

	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const minOffset = Math.max(0, bytes.byteLength - (22 + 0xffff));
	let eocdOffset = -1;

	for (let pos = bytes.byteLength - 22; pos >= minOffset; pos--) {
		if (view.getUint32(pos, true) === EOCD_SIGNATURE) {
			const commentLen = view.getUint16(pos + 20, true);
			if (pos + 22 + commentLen === bytes.byteLength) {
				eocdOffset = pos;
				break;
			}
		}
	}

	if (eocdOffset === -1) {
		return;
	}

	const totalEntries = view.getUint16(eocdOffset + 10, true);
	if (totalEntries !== ZIP64_COUNT_SENTINEL && totalEntries > resolved.maxEntries) {
		throw new ZipSafetyError(
			'TOO_MANY_ENTRIES',
			`File EPUB chứa quá nhiều mục (${totalEntries} entries, tối đa ${resolved.maxEntries}).`
		);
	}

	const cdSize = view.getUint32(eocdOffset + 12, true);
	const cdOffset = view.getUint32(eocdOffset + 16, true);

	if (
		cdSize === ZIP64_SIZE_SENTINEL ||
		cdOffset === ZIP64_SIZE_SENTINEL ||
		cdOffset + cdSize > bytes.byteLength
	) {
		return;
	}

	const seenRawNames = new Set<string>();
	const seenFileKeys = new Set<string>();
	const seenDirKeys = new Set<string>();

	let cursor = cdOffset;
	const cdEnd = cdOffset + cdSize;
	let parsedEntries = 0;
	let totalDeclaredBytes = 0;

	while (cursor + 46 <= cdEnd) {
		if (view.getUint32(cursor, true) !== CD_FILE_HEADER_SIGNATURE) {
			break;
		}

		parsedEntries++;
		if (parsedEntries > resolved.maxEntries) {
			throw new ZipSafetyError(
				'TOO_MANY_ENTRIES',
				`File EPUB chứa quá nhiều mục (vượt quá ${resolved.maxEntries} entries).`
			);
		}

		const gpFlag = view.getUint16(cursor + 8, true);
		const uncompressedSize = view.getUint32(cursor + 24, true);
		const fileNameLength = view.getUint16(cursor + 28, true);
		const extraFieldLength = view.getUint16(cursor + 30, true);
		const fileCommentLength = view.getUint16(cursor + 32, true);

		const headerTotalLen = 46 + fileNameLength + extraFieldLength + fileCommentLength;
		if (cursor + headerTotalLen > cdEnd) {
			break;
		}

		const nameBytes = bytes.subarray(cursor + 46, cursor + 46 + fileNameLength);
		const rawName = decodeZipEntryName(nameBytes, (gpFlag & 0x0800) !== 0);
		const normalized = validateZipEntryPath(rawName);
		const key = normalized.toLowerCase();
		const isDir = rawName.endsWith('/');

		if (seenRawNames.has(rawName)) {
			throw new ZipSafetyError(
				'DUPLICATE_ENTRY',
				`File EPUB chứa tên entry trùng lặp: "${rawName}".`
			);
		}
		seenRawNames.add(rawName);

		if (isDir) {
			if (seenFileKeys.has(key) || seenDirKeys.has(key)) {
				throw new ZipSafetyError(
					'DUPLICATE_ENTRY',
					`File EPUB chứa đường dẫn entry trùng lặp: "${rawName}".`
				);
			}
			seenDirKeys.add(key);
		} else {
			if (seenFileKeys.has(key) || seenDirKeys.has(key)) {
				throw new ZipSafetyError(
					'DUPLICATE_ENTRY',
					`File EPUB chứa tên entry trùng lặp: "${rawName}".`
				);
			}
			seenFileKeys.add(key);

			if (uncompressedSize !== ZIP64_SIZE_SENTINEL) {
				if (uncompressedSize > resolved.maxSingleEntrySize) {
					throw new ZipSafetyError(
						'ENTRY_TOO_LARGE',
						`Tệp "${rawName}" trong EPUB có dung lượng giải nén vượt quá giới hạn (${formatMb(uncompressedSize)}, tối đa ${formatMb(resolved.maxSingleEntrySize)}).`
					);
				}

				totalDeclaredBytes += uncompressedSize;
				if (totalDeclaredBytes > resolved.maxTotalUncompressedSize) {
					throw new ZipSafetyError(
						'TOTAL_UNCOMPRESSED_TOO_LARGE',
						`Tổng dung lượng giải nén EPUB vượt quá giới hạn an toàn (tối đa ${formatMb(resolved.maxTotalUncompressedSize)}).`
					);
				}
			}
		}

		cursor += headerTotalLen;
	}
}

/**
 * Validates a loaded JSZip archive BEFORE decompressing any entries:
 * - Entry count <= maxEntries
 * - Valid relative entry paths (no `..`, no absolute paths, no backslashes)
 * - No duplicate normalized/case-insensitive entry names
 * - Pre-check `_data.uncompressedSize` for every non-directory entry (rejecting missing/invalid metadata)
 * - Total declared uncompressed size <= maxTotalUncompressedSize
 */
export function validateZipArchiveSafety(zip: JSZip, limits?: Partial<ZipSafetyLimits>): void {
	const resolved = resolveZipLimits(limits);
	const entries = Object.entries(zip.files);

	if (entries.length > resolved.maxEntries) {
		throw new ZipSafetyError(
			'TOO_MANY_ENTRIES',
			`File EPUB chứa quá nhiều mục (${entries.length} entries, tối đa ${resolved.maxEntries}).`
		);
	}

	const seenFiles = new Map<string, string>();
	const seenDirs = new Map<string, string>();
	let totalDeclaredBytes = 0;

	for (const [rawPath, entry] of entries) {
		const normalized = validateZipEntryPath(rawPath);
		const key = normalized.toLowerCase();

		if (entry.dir) {
			if (seenFiles.has(key) || seenDirs.has(key)) {
				throw new ZipSafetyError(
					'DUPLICATE_ENTRY',
					`File EPUB chứa đường dẫn entry trùng lặp: "${rawPath}".`
				);
			}
			seenDirs.set(key, rawPath);
			continue;
		}

		if (seenFiles.has(key) || seenDirs.has(key)) {
			throw new ZipSafetyError(
				'DUPLICATE_ENTRY',
				`File EPUB chứa tên entry trùng lặp: "${rawPath}".`
			);
		}
		seenFiles.set(key, rawPath);

		const metaStatus = getZipEntryMetadataStatus(entry);
		if (metaStatus.kind === 'missing-or-invalid') {
			throw new ZipSafetyError(
				'INVALID_METADATA',
				`Entry "${rawPath}" thiếu hoặc có metadata kích thước giải nén không hợp lệ.`
			);
		}

		if (metaStatus.kind === 'known') {
			if (metaStatus.size > resolved.maxSingleEntrySize) {
				throw new ZipSafetyError(
					'ENTRY_TOO_LARGE',
					`Tệp "${rawPath}" trong EPUB có dung lượng giải nén vượt quá giới hạn (${formatMb(metaStatus.size)}, tối đa ${formatMb(resolved.maxSingleEntrySize)}).`
				);
			}

			totalDeclaredBytes += metaStatus.size;
			if (totalDeclaredBytes > resolved.maxTotalUncompressedSize) {
				throw new ZipSafetyError(
					'TOTAL_UNCOMPRESSED_TOO_LARGE',
					`Tổng dung lượng giải nén EPUB vượt quá giới hạn an toàn (tối đa ${formatMb(resolved.maxTotalUncompressedSize)}).`
				);
			}
		}
	}
}

/**
 * Safely loads an EPUB/ZIP binary source into JSZip after enforcing:
 * 1. Compressed archive size limit
 * 2. Raw Central Directory pre-flight checks (before JSZip allocates entries)
 * 3. Post-load JSZip structure & metadata validation
 */
export async function loadSafeEpubZip(
	input: File | Blob | ArrayBuffer | Uint8Array,
	limits?: Partial<ZipSafetyLimits>
): Promise<JSZip> {
	const resolved = resolveZipLimits(limits);

	let bytes: Uint8Array;
	if (input instanceof Uint8Array) {
		if (input.byteLength > resolved.maxArchiveFileSize) {
			throw new ZipSafetyError(
				'ARCHIVE_TOO_LARGE',
				`Dung lượng file EPUB vượt quá giới hạn cho phép (tối đa ${formatMb(resolved.maxArchiveFileSize)}).`
			);
		}
		bytes = input;
	} else if (input instanceof ArrayBuffer) {
		if (input.byteLength > resolved.maxArchiveFileSize) {
			throw new ZipSafetyError(
				'ARCHIVE_TOO_LARGE',
				`Dung lượng file EPUB vượt quá giới hạn cho phép (tối đa ${formatMb(resolved.maxArchiveFileSize)}).`
			);
		}
		bytes = new Uint8Array(input);
	} else {
		if (input.size > resolved.maxArchiveFileSize) {
			throw new ZipSafetyError(
				'ARCHIVE_TOO_LARGE',
				`Dung lượng file EPUB vượt quá giới hạn cho phép (tối đa ${formatMb(resolved.maxArchiveFileSize)}).`
			);
		}
		const buffer = await input.arrayBuffer();
		bytes = new Uint8Array(buffer);
	}

	inspectRawZipCentralDirectory(bytes, resolved);
	const zip = await JSZip.loadAsync(bytes);
	validateZipArchiveSafety(zip, resolved);
	return zip;
}

/**
 * Reads a single ZIP entry as `Uint8Array` with pre-decompression metadata checks
 * and runtime output byte counting via JSZip's `internalStream()`.
 *
 * NOTE: JSZip's `internalStream()` is NOT a true end-to-end streaming decompressor and does NOT
 * provide an absolute OOM guarantee on its own (JSZip may buffer or allocate internally before
 * emitting chunks, and `pause()` may not immediately cancel all internal inflate work).
 * It acts as an additional runtime guard against spoofed `_data.uncompressedSize` headers,
 * paired with strict pre-checks and no unlimited `.async()` fallback.
 */
export async function readSafeZipEntryBytes(
	zip: JSZip,
	path: string,
	options?: ZipReadEntryOptions
): Promise<Uint8Array | null> {
	if (!path) return null;

	validateZipEntryPath(path);
	const entry = zip.file(path);
	if (!entry || entry.dir) return null;

	const resolved = resolveZipLimits(options?.limits);
	const budget = options?.budget;

	const metaStatus = getZipEntryMetadataStatus(entry);
	if (metaStatus.kind === 'missing-or-invalid') {
		throw new ZipSafetyError(
			'INVALID_METADATA',
			`Entry "${path}" thiếu hoặc có metadata kích thước giải nén không hợp lệ.`
		);
	}

	const declaredSize = metaStatus.kind === 'known' ? metaStatus.size : null;
	if (declaredSize !== null) {
		if (declaredSize > resolved.maxSingleEntrySize) {
			throw new ZipSafetyError(
				'ENTRY_TOO_LARGE',
				`Tệp "${path}" trong EPUB có dung lượng giải nén vượt quá giới hạn (${formatMb(declaredSize)}, tối đa ${formatMb(resolved.maxSingleEntrySize)}).`
			);
		}
		budget?.assertCanRead(declaredSize, path);
	}

	const streamableEntry = entry as JSZip.JSZipObject & {
		internalStream?: (type: 'uint8array') => JSZipInternalStream;
	};
	const createInternalStream = streamableEntry.internalStream;
	if (typeof createInternalStream !== 'function') {
		throw new ZipSafetyError(
			'UNSUPPORTED_STREAM',
			`Entry "${path}" không hỗ trợ đọc qua internalStream an toàn.`
		);
	}

	const bytes = await new Promise<Uint8Array>((resolve, reject) => {
		const chunks: Uint8Array[] = [];
		let actualBytes = 0;
		let settled = false;

		const stream = createInternalStream.call(streamableEntry, 'uint8array');

		const abortWith = (err: Error) => {
			if (settled) return;
			settled = true;
			chunks.length = 0;
			try {
				stream.pause();
			} catch {
				// Ignore pause errors if stream already ended
			}
			reject(err);
		};

		stream.on('data', (chunk: Uint8Array) => {
			if (settled) return;

			const chunkBytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
			actualBytes += chunkBytes.byteLength;

			if (actualBytes > resolved.maxSingleEntrySize) {
				abortWith(
					new ZipSafetyError(
						'ENTRY_TOO_LARGE',
						`Tệp "${path}" giải nén thực tế vượt quá giới hạn an toàn (tối đa ${formatMb(resolved.maxSingleEntrySize)}).`
					)
				);
				return;
			}

			if (budget) {
				try {
					budget.assertCanRead(actualBytes, path);
				} catch (budgetErr) {
					abortWith(
						budgetErr instanceof Error
							? budgetErr
							: new ZipSafetyError('TOTAL_UNCOMPRESSED_TOO_LARGE', String(budgetErr))
					);
					return;
				}
			}

			chunks.push(chunkBytes);
		});

		stream.on('error', (err: Error) => {
			abortWith(err instanceof Error ? err : new Error(String(err)));
		});

		stream.on('end', () => {
			if (settled) return;
			settled = true;

			const merged = new Uint8Array(actualBytes);
			let offset = 0;
			for (const c of chunks) {
				merged.set(c, offset);
				offset += c.byteLength;
			}
			chunks.length = 0;
			resolve(merged);
		});

		stream.resume();
	});

	const accountedBytes =
		declaredSize !== null ? Math.max(bytes.byteLength, declaredSize) : bytes.byteLength;
	if (accountedBytes > resolved.maxSingleEntrySize) {
		throw new ZipSafetyError(
			'ENTRY_TOO_LARGE',
			`Tệp "${path}" trong EPUB có dung lượng giải nén vượt quá giới hạn (tối đa ${formatMb(resolved.maxSingleEntrySize)}).`
		);
	}
	budget?.consume(accountedBytes, path);

	return bytes;
}

/**
 * Reads a single ZIP entry safely as UTF-8 text (preserving BOM like JSZip `.async('text')`).
 */
export async function readSafeZipEntryText(
	zip: JSZip,
	path: string,
	options?: ZipReadEntryOptions
): Promise<string | null> {
	const bytes = await readSafeZipEntryBytes(zip, path, options);
	if (bytes === null) return null;
	return new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes);
}
