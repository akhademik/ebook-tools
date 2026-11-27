// src/lib/types/zip.type.ts

/**
 * Safety quotas enforced when inspecting and extracting ZIP/EPUB archives.
 */
export interface ZipSafetyLimits {
	maxArchiveFileSize: number;
	maxEntries: number;
	maxSingleEntrySize: number;
	maxTotalUncompressedSize: number;
}

/**
 * Result of inspecting a JSZip entry's pre-decompression size metadata.
 */
export type ZipEntryMetadataStatus =
	{ kind: 'known'; size: number } | { kind: 'in-memory-promise' } | { kind: 'missing-or-invalid' };

/**
 * Error codes emitted by the shared ZIP safety layer.
 */
export type ZipSafetyErrorCode =
	| 'ARCHIVE_TOO_LARGE'
	| 'TOO_MANY_ENTRIES'
	| 'ENTRY_TOO_LARGE'
	| 'TOTAL_UNCOMPRESSED_TOO_LARGE'
	| 'INVALID_PATH'
	| 'DUPLICATE_ENTRY'
	| 'INVALID_METADATA'
	| 'UNSUPPORTED_STREAM'
	| 'UNSUPPORTED_ZIP64';

/**
 * In-flight reservation token held while an entry is being read.
 */
export interface ZipBudgetReservation {
	readonly id: symbol;
	readonly path?: string;
	reservedBytes: number;
}

/**
 * Shared budget tracker interface for cumulative ZIP decompression across reads.
 */
export interface ZipExtractionBudgetTracker {
	readonly maxTotalBytes: number;
	readonly usedBytes: number;
	readonly reservedBytes: number;
	assertCanRead(additionalBytes: number, path?: string): void;
	reserve(initialBytes: number, path?: string): ZipBudgetReservation;
	updateReservation(reservation: ZipBudgetReservation, actualBytes: number): void;
	commit(reservation: ZipBudgetReservation, finalBytes: number): void;
	release(reservation: ZipBudgetReservation): void;
	consume(actualBytes: number, path?: string): void;
}

/**
 * Options for reading a single entry safely from a JSZip archive.
 */
export interface ZipReadEntryOptions {
	limits?: Partial<ZipSafetyLimits>;
	budget?: ZipExtractionBudgetTracker;
}

/**
 * Minimal runtime interface for JSZip's `internalStream('uint8array')` helper,
 * which is present in JSZip v3 runtime objects but omitted from its `.d.ts`.
 */
export interface JSZipInternalStream {
	on(event: 'data', callback: (chunk: Uint8Array) => void): this;
	on(event: 'error', callback: (err: Error) => void): this;
	on(event: 'end', callback: () => void): this;
	resume(): this;
	pause(): this;
}
