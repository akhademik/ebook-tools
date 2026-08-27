// tests/crypto.test.ts
import { describe, it, expect } from 'vitest';
import {
	sha1,
	sha1Bytes,
	sha1Hex,
	sha1Async,
	sha1HexAsync,
	hashBytes
} from '../src/lib/utils/crypto';

describe('crypto utils', () => {
	it('should compute correct sha1 hex for known string', () => {
		const input = 'hello world';
		const hexSync = sha1Hex(input);
		const rawBytes = sha1(input);
		expect(rawBytes.length).toBe(20);
		// SHA-1 of 'hello world' is 2aae6c35c94fcfb415dbe95f408b9ce91ee846ed
		expect(hexSync).toBe('2aae6c35c94fcfb415dbe95f408b9ce91ee846ed');
	});

	it('should compute identical hashes synchronously and asynchronously', async () => {
		const sampleData = new Uint8Array([1, 2, 3, 4, 5, 42, 99, 128, 255]);
		const hexSync = sha1Hex(sampleData);
		const hexAsync = await sha1HexAsync(sampleData);
		const bytesSync = sha1Bytes(sampleData);
		const bytesAsync = await sha1Async(sampleData);

		expect(hexAsync).toBe(hexSync);
		expect(Array.from(bytesAsync)).toEqual(Array.from(bytesSync));
	});

	it('should maintain hashBytes alias for backward compatibility', () => {
		const sample = new Uint8Array([10, 20, 30]);
		expect(hashBytes(sample)).toBe(sha1Hex(sample));
	});
});
