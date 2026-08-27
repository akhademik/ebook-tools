// src/lib/utils/crypto.ts

/**
 * Compute SHA-1 hash for Uint8Array (pure JS implementation, zero dependencies).
 * Returns a 20-byte Uint8Array.
 */
export function sha1Bytes(bytes: Uint8Array): Uint8Array {
	let h0 = 0x67452301;
	let h1 = 0xefcdab89;
	let h2 = 0x98badcfe;
	let h3 = 0x10325476;
	let h4 = 0xc3d2e1f0;

	const msgLen = bytes.length;
	const bitLen = msgLen * 8;
	const newLen = (((msgLen + 8) >> 6) + 1) << 6;
	const words = new Uint32Array(newLen >> 2);

	for (let i = 0; i < msgLen; i++) {
		words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
	}
	words[msgLen >> 2] |= 0x80 << (24 - (msgLen % 4) * 8);
	words[words.length - 1] = bitLen;
	words[words.length - 2] = Math.floor(bitLen / 0x100000000);

	const w = new Uint32Array(80);
	for (let i = 0; i < words.length; i += 16) {
		for (let j = 0; j < 16; j++) w[j] = words[i + j];
		for (let j = 16; j < 80; j++) {
			const n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
			w[j] = (n << 1) | (n >>> 31);
		}

		let a = h0,
			b = h1,
			c = h2,
			d = h3,
			e = h4;
		for (let j = 0; j < 80; j++) {
			let f: number, k: number;
			if (j < 20) {
				f = (b & c) | (~b & d);
				k = 0x5a827999;
			} else if (j < 40) {
				f = b ^ c ^ d;
				k = 0x6ed9eba1;
			} else if (j < 60) {
				f = (b & c) | (b & d) | (c & d);
				k = 0x8f1bbcdc;
			} else {
				f = b ^ c ^ d;
				k = 0xca62c1d6;
			}
			const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) | 0;
			e = d;
			d = c;
			c = (b << 30) | (b >>> 2);
			b = a;
			a = temp;
		}

		h0 = (h0 + a) | 0;
		h1 = (h1 + b) | 0;
		h2 = (h2 + c) | 0;
		h3 = (h3 + d) | 0;
		h4 = (h4 + e) | 0;
	}

	const result = new Uint8Array(20);
	const view = new DataView(result.buffer);
	view.setUint32(0, h0, false);
	view.setUint32(4, h1, false);
	view.setUint32(8, h2, false);
	view.setUint32(12, h3, false);
	view.setUint32(16, h4, false);

	return result;
}

/**
 * Compute SHA-1 hash for a string or Uint8Array.
 * Returns a 20-byte Uint8Array.
 */
export function sha1(input: string | Uint8Array): Uint8Array {
	const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
	return sha1Bytes(bytes);
}

/**
 * Compute 40-character hex string SHA-1 hash synchronously.
 */
export function sha1Hex(input: string | Uint8Array): string {
	const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
	const digest = sha1Bytes(bytes);
	return Array.from(digest)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Alias for backward compatibility in cleaner module.
 */
export function hashBytes(bytes: Uint8Array): string {
	return sha1Hex(bytes);
}

/**
 * Compute SHA-1 hash asynchronously using standard Web Crypto API (crypto.subtle)
 * with graceful fallback to pure JS implementation.
 */
export async function sha1Async(input: string | Uint8Array): Promise<Uint8Array> {
	const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;
	if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
		const hashBuffer = await globalThis.crypto.subtle.digest('SHA-1', data as BufferSource);
		return new Uint8Array(hashBuffer);
	}
	return sha1Bytes(data);
}

/**
 * Compute 40-character hex string SHA-1 hash asynchronously.
 */
export async function sha1HexAsync(input: string | Uint8Array): Promise<string> {
	const digest = await sha1Async(input);
	return Array.from(digest)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}
