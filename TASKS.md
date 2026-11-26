# Trạng thái các nhiệm vụ trong TASKS.md

## 1. Các vấn đề P1 & P2 đã xử lý hoàn tất (2026-11-26)

### ✅ P1/P2 — Ảnh bìa chưa được snapshot đầy đủ

- **Trạng thái**: Đã hoàn thành ✅
- **Giải pháp triển khai**:
  - `EpubImagesState.getOptimizedCoverBlob(params)` được mở rộng để nhận snapshot tường minh: `{ coverOriginalUrl, coverCropTop, coverCropBottom, coverCropLeft, coverCropRight }`.
  - Trong `EpubState.processEpub()`, toàn bộ URL và 4 thông số crop được chụp snapshot bất biến ngay ở đầu hàm và truyền trực tiếp vào `getOptimizedCoverBlob(coverSnapshot)`.
  - Callback `img.onload` sử dụng các tham số từ snapshot, cô lập 100% khỏi các thay đổi crop hoặc chọn ảnh mới của người dùng trong lúc tiến trình đang đóng gói.

### ✅ P2 — Giới hạn ZIP Markdown kiểm tra đúng thời điểm & đếm byte thực tế

- **Trạng thái**: Đã hoàn thành ✅
- **Giải pháp triển khai**:
  - Thêm hạn mức `MAX_ZIP_TOTAL_ENTRIES = 2000` kiểm tra tổng số lượng entry (tập tin và thư mục) trước khi xử lý.
  - Kiểm tra `entryData.uncompressedSize` của từng file `.md` TRƯỚC KHI gọi `zip.files[name].async('string')`, ngăn chặn cấp phát chuỗi khổng lồ vào RAM khi gặp zip-bomb.
  - Kiểm tra `totalUncompressedBytes + preUncompressedSize > MAX_ZIP_TOTAL_UNCOMPRESSED_SIZE` (60MB) trước khi giải nén file tiếp theo.
  - Sử dụng `new TextEncoder().encode(text).length` để tính toán chính xác số byte UTF-8 thực tế thay vì đếm UTF-16 code units (`text.length`).

### ✅ P2 — Áp dụng hạn ngạch an toàn tương tự cho ZIP ảnh minh họa

- **Trạng thái**: Đã hoàn thành ✅
- **Giải pháp triển khai**:
  - Thêm các hằng số an toàn trong `src/lib/constants.ts`:
    - `MAX_IMAGES_ZIP_ENTRIES = 500` (giới hạn số entry trong file ZIP ảnh).
    - `MAX_ILLUSTRATION_COUNT = 200` (tối đa 200 ảnh minh họa được thêm vào sách).
    - `MAX_IMAGES_ZIP_TOTAL_UNCOMPRESSED_SIZE = 150 * 1024 * 1024` (150MB tối đa cho tổng dung lượng ảnh giải nén vào RAM).
  - Kiểm tra `entryData.uncompressedSize` trước khi gọi `zip.files[name].async('blob')`: bỏ qua ảnh đơn lẻ vượt quá 30MB (`MAX_IMAGE_FILE_SIZE`) và dừng đọc ngay khi tổng dung lượng ảnh chạm ngưỡng 150MB.

### ✅ P2 — Đổi nguồn sách hủy thực sự tác vụ đóng gói cũ

- **Trạng thái**: Đã hoàn thành ✅
- **Giải pháp triển khai**:
  - Tích hợp `packAbortController: AbortController | null` và `activePackagingPromise: Promise<void> | null` trong `EpubState`.
  - Khi người dùng đổi nguồn sách (`onFileLoaded`), gọi `packAbortController.abort()` ngay lập tức để hủy tác vụ.
  - `buildEpubBlob` và `assembleEpubZip` nhận tham số `signal?: AbortSignal`, kiểm tra tín hiệu hủy ở từng chặng lặp (ảnh, font, chương) và ném `DOMException('Packing aborted', 'AbortError')`.
  - Trong quá trình nén JSZip DEFLATE level 6 (`zip.generateAsync`), hook callback `onUpdate` để phát hiện `signal.aborted` và ném lỗi hủy tiến trình nén giữa chừng.
  - Khi người dùng bấm đóng gói mới, `processEpub()` kiểm tra `activePackagingPromise` và chủ động chờ tiến trình cũ giải phóng tài nguyên CPU/RAM trước khi khởi tạo lượt đóng gói mới.
