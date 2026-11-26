import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import fs from 'node:fs';
import path from 'node:path';

function getAllFiles(dir, fileList = []) {
	if (!fs.existsSync(dir)) return fileList;
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const filePath = path.join(dir, file);
		if (fs.statSync(filePath).isDirectory()) {
			getAllFiles(filePath, fileList);
		} else {
			fileList.push(filePath);
		}
	}
	return fileList;
}

function deduplicateWasmPlugin() {
	return {
		name: 'deduplicate-wasm',
		apply: 'build',
		closeBundle() {
			const clientDir = path.resolve('.svelte-kit/output/client/_app/immutable');
			const assetsDir = path.join(clientDir, 'assets');
			const workersDir = path.join(clientDir, 'workers');

			if (!fs.existsSync(assetsDir) || !fs.existsSync(workersDir)) {
				return;
			}

			const assetFiles = fs.readdirSync(assetsDir);
			const allWorkerFiles = getAllFiles(workersDir);

			const mainWasm = assetFiles.find(
				(f) => f.startsWith('ort-wasm-simd-threaded') && f.endsWith('.wasm')
			);
			const workerWasmFile = allWorkerFiles.find(
				(f) =>
					path.basename(f).startsWith('ort-wasm-simd-threaded') &&
					path.basename(f).endsWith('.wasm')
			);

			if (mainWasm && workerWasmFile) {
				const workerWasm = path.basename(workerWasmFile);
				console.log(`[deduplicate-wasm] Found duplicated WASM:`);
				console.log(`  Main: ${mainWasm} in assets/`);
				console.log(`  Worker: ${workerWasm} in ${path.relative(clientDir, workerWasmFile)}`);

				// Update all js/mjs files in workersDir recursively
				let rewrittenCount = 0;
				for (const filePath of allWorkerFiles) {
					if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
						let content = fs.readFileSync(filePath, 'utf-8');
						if (content.includes(workerWasm)) {
							const relativeToMainWasm = path
								.relative(path.dirname(filePath), path.join(assetsDir, mainWasm))
								.replace(/\\/g, '/');

							console.log(
								`[deduplicate-wasm] Rewriting ${path.basename(filePath)} -> ${relativeToMainWasm}`
							);
							// Replace 'assets/<workerWasm>' first, then bare '<workerWasm>'
							content = content.replaceAll(`assets/${workerWasm}`, relativeToMainWasm);
							content = content.replaceAll(workerWasm, relativeToMainWasm);
							fs.writeFileSync(filePath, content, 'utf-8');
							rewrittenCount++;
						}
					}
				}

				// Remove duplicate wasm file from workers directory
				const beforeStat = fs.statSync(workerWasmFile);
				fs.unlinkSync(workerWasmFile);
				console.log(
					`[deduplicate-wasm] Removed duplicate WASM (${(beforeStat.size / (1024 * 1024)).toFixed(2)} MB saved, rewritten ${rewrittenCount} worker files).`
				);

				// Strict validation: Ensure no stale references to the removed WASM remain
				const remainingWorkerFiles = getAllFiles(workersDir);
				for (const filePath of remainingWorkerFiles) {
					if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
						const content = fs.readFileSync(filePath, 'utf-8');
						if (content.includes(workerWasm)) {
							throw new Error(
								`[deduplicate-wasm] Assertion failed: ${filePath} still references deleted WASM ${workerWasm}`
							);
						}
					}
				}
			}
		}
	};
}

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		}),
		deduplicateWasmPlugin()
	],
	test: {
		include: ['tests/**/*.test.ts'],
		exclude: ['tests-e2e/**', 'node_modules/**'],
		coverage: {
			provider: 'v8',
			all: true,
			include: ['src/**/*.js', 'src/**/*.ts'],
			exclude: ['src/**/*.test.js', 'src/**/*.spec.js']
		}
	},
	server: {
		host: '0.0.0.0', // hoặc host: true
		port: 5173
	}
});
