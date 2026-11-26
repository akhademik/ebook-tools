import type JSZip from 'jszip';

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
