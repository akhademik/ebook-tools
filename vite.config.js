import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import fs from 'node:fs';
import path from 'node:path';

function deduplicateWasmPlugin() {
	return {
		name: 'deduplicate-wasm',
		apply: 'build',
		closeBundle() {
			const clientDir = path.resolve('.svelte-kit/output/client/_app/immutable');
			const assetsDir = path.join(clientDir, 'assets');
			const workerAssetsDir = path.join(clientDir, 'workers', 'assets');

			if (!fs.existsSync(assetsDir) || !fs.existsSync(workerAssetsDir)) {
				return;
			}

			const assetFiles = fs.readdirSync(assetsDir);
			const workerAssetFiles = fs.readdirSync(workerAssetsDir);

			const mainWasm = assetFiles.find(
				(f) => f.startsWith('ort-wasm-simd-threaded') && f.endsWith('.wasm')
			);
			const workerWasm = workerAssetFiles.find(
				(f) => f.startsWith('ort-wasm-simd-threaded') && f.endsWith('.wasm')
			);

			if (mainWasm && workerWasm) {
				console.log(`[deduplicate-wasm] Found duplicated WASM:`);
				console.log(`  Main: ${mainWasm} in assets/`);
				console.log(`  Worker: ${workerWasm} in workers/assets/`);

				// Update all js/mjs files in workerAssetsDir to point to ../../assets/<mainWasm>
				for (const wf of workerAssetFiles) {
					if (wf.endsWith('.js') || wf.endsWith('.mjs')) {
						const filePath = path.join(workerAssetsDir, wf);
						let content = fs.readFileSync(filePath, 'utf-8');
						if (content.includes(workerWasm)) {
							console.log(
								`[deduplicate-wasm] Rewriting ${wf} to point to ../../assets/${mainWasm}`
							);
							content = content.replaceAll(workerWasm, `../../assets/${mainWasm}`);
							fs.writeFileSync(filePath, content, 'utf-8');
						}
					}
				}

				// Remove duplicate wasm file from workers/assets/
				const duplicatePath = path.join(workerAssetsDir, workerWasm);
				const beforeStat = fs.statSync(duplicatePath);
				fs.unlinkSync(duplicatePath);
				console.log(
					`[deduplicate-wasm] Removed duplicate WASM (${(beforeStat.size / (1024 * 1024)).toFixed(2)} MB saved).`
				);
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
