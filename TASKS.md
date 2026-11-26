2. P3 – Helper ZIP vẫn phụ thuộc API nội bộ của JSZip

File src/lib/utils/zip.ts đã gom việc truy cập _data vào một nơi, nhưng bên trong vẫn phải đọc:
const entryData = (entry as any)._data;

Điều này tốt hơn việc rải any khắp nơi, nhưng chưa loại bỏ phụ thuộc vào cấu trúc nội bộ JSZip. Nên xem đây là khoản nợ kỹ thuật, chưa phải lỗi cần chặn phát hành ngay.
