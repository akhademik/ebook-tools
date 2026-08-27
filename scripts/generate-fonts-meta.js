// src/lib/epub-packer/generate-fonts-meta.js
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

// Nạp fontkit theo kiểu CJS tương thích hoàn toàn với ESM
const require = createRequire(import.meta.url);
const fontkit = require('fontkit');

const FONTS_DIR = path.resolve('src/assets/fonts');
const OUTPUT_FILE = path.resolve('src/assets/fonts-metadata.json');

const files = fs.readdirSync(FONTS_DIR);
const metadata = {};

for (const file of files) {
	const ext = path.extname(file).toLowerCase();
	if (!['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) continue;

	const filePath = path.join(FONTS_DIR, file);

	try {
		const font = fontkit.openSync(filePath);

		// fontkit bóc tách chính xác tên Family chuẩn bên trong file binary
		const actualName = font.familyName || font.fullName || font.postscriptName;

		if (actualName && actualName.trim()) {
			metadata[file] = actualName.trim();
			console.log(`✓ [Font OK] ${file} -> "${metadata[file]}"`);
		} else {
			throw new Error('Không tìm thấy familyName');
		}
	} catch (err) {
		console.warn(`⚠️ [Font Parser Fallback] ${file}: ${err.message}`);
		metadata[file] = path.basename(file, ext).replace(/[_-]/g, ' ').trim();
	}
}

// Đảm bảo thư mục tồn tại và xuất JSON
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2), 'utf-8');

console.log(`\n======================================================`);
console.log(`✅ Đã xuất metadata cho ${Object.keys(metadata).length} font vào: ${OUTPUT_FILE}`);
console.log(`======================================================\n`);
