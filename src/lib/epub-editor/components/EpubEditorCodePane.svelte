<!-- src/lib/epub-editor/components/EpubEditorCodePane.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState, Compartment } from '@codemirror/state';
	import { html } from '@codemirror/lang-html';
	import { css } from '@codemirror/lang-css';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { keymap } from '@codemirror/view';
	import { indentWithTab } from '@codemirror/commands';
	import type { EpubEditorState } from '../epub-editor-state.svelte';

	interface Props {
		editorState: EpubEditorState;
	}

	let { editorState }: Props = $props();

	let lineWrap = $state(true);
	let editorContainerEl = $state<HTMLDivElement | null>(null);

	let view: EditorView | null = null;
	let activeTarget: string | null = null;
	const fileStates = new SvelteMap<string, EditorState>();
	let isInternalUpdate = false;
	let isInternalSync = false;
	let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
	let lastSyncedDoc = '';

	function flushDocSync() {
		if (syncDebounceTimer) {
			clearTimeout(syncDebounceTimer);
			syncDebounceTimer = null;
		}
		if (!view || !activeTarget) return;
		const target = activeTarget;
		const newDoc = view.state.doc.toString();
		if (newDoc !== lastSyncedDoc) {
			lastSyncedDoc = newDoc;
			editorState.updateFileContent(target, newDoc);
		}
	}

	function scheduleDocSync() {
		if (syncDebounceTimer) {
			clearTimeout(syncDebounceTimer);
		}
		syncDebounceTimer = setTimeout(() => {
			flushDocSync();
		}, 250);
	}

	const languageCompartment = new Compartment();
	const themeCompartment = new Compartment();
	const wrapCompartment = new Compartment();

	let currentLineCount = $state(1);
	let currentLength = $state(0);

	const isDirty = $derived(
		editorState.editorTarget ? editorState.dirtyPaths.has(editorState.editorTarget) : false
	);

	function isDarkMode(): boolean {
		return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
	}

	function getLanguageExtension(path: string | null) {
		if (!path) return html({ matchClosingTags: true, autoCloseTags: true });
		const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
		if (ext === '.css') {
			return css();
		}
		return html({ matchClosingTags: true, autoCloseTags: true });
	}

	function handleEditorScroll() {
		if (!view || isInternalSync || !editorState.syncViewEnabled) return;
		if (editorState.editorTarget !== editorState.previewTarget) return;

		const scrollDOM = view.scrollDOM;
		const maxScroll = scrollDOM.scrollHeight - scrollDOM.clientHeight;
		if (maxScroll > 0) {
			const ratio = Math.min(Math.max(scrollDOM.scrollTop / maxScroll, 0), 1);
			editorState.scrollPreviewTo?.(ratio);
		}
	}

	function createStateForFile(target: string, initialContent: string): EditorState {
		return EditorState.create({
			doc: initialContent,
			extensions: [
				basicSetup,
				keymap.of([indentWithTab]),
				languageCompartment.of(getLanguageExtension(target)),
				themeCompartment.of(isDarkMode() ? oneDark : []),
				wrapCompartment.of(lineWrap ? EditorView.lineWrapping : []),
				EditorView.domEventHandlers({
					blur: () => {
						flushDocSync();
					}
				}),
				EditorView.updateListener.of((update) => {
					if (update.docChanged && !isInternalUpdate && editorState.editorTarget) {
						currentLength = update.state.doc.length;
						currentLineCount = update.state.doc.lines;
						editorState.dirtyPaths.add(editorState.editorTarget);
						scheduleDocSync();
					}

					// Sync text selection from Code Editor to Live Preview
					if (update.selectionSet && !isInternalSync && editorState.syncViewEnabled) {
						if (editorState.editorTarget === editorState.previewTarget) {
							const sel = update.state.selection.main;
							if (!sel.empty && sel.to - sel.from <= 300) {
								const selectedText = update.state.sliceDoc(sel.from, sel.to);
								editorState.selectTextInPreview?.(selectedText);
							}
						}
					}
				}),
				EditorView.theme({
					'&': {
						height: '100%',
						fontSize: '13px',
						backgroundColor: 'var(--brand-bg)',
						color: 'var(--text-color)'
					},
					'.cm-scroller': {
						overflow: 'auto',
						fontFamily:
							'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
						lineHeight: '1.6'
					},
					'.cm-gutters': {
						backgroundColor: 'var(--panel-2)',
						color: 'var(--text-mute)',
						borderRight: '1px solid var(--border-color)',
						opacity: '0.75'
					},
					'.cm-activeLine': {
						backgroundColor: 'rgba(255, 255, 255, 0.04)'
					},
					'.cm-activeLineGutter': {
						backgroundColor: 'rgba(255, 255, 255, 0.06)',
						color: 'var(--accent-color)'
					},
					'&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection':
						{
							backgroundColor: 'rgba(245, 158, 11, 0.4) !important'
						},
					'.cm-selectionLayer .cm-selectionBackground': {
						backgroundColor: 'rgba(245, 158, 11, 0.35) !important'
					},
					'.cm-selectionMatch': {
						backgroundColor: 'rgba(245, 158, 11, 0.2) !important',
						outline: '1px solid rgba(245, 158, 11, 0.4)'
					}
				})
			]
		});
	}

	function initEditor() {
		if (!editorContainerEl) return;
		if (view) {
			view.destroy();
			view = null;
		}

		const currentTarget = editorState.editorTarget;
		if (!currentTarget) return;

		const initialContent = editorState.editBuffer.get(currentTarget) ?? '';
		currentLength = initialContent.length;
		currentLineCount = initialContent ? initialContent.split('\n').length : 1;

		let state = fileStates.get(currentTarget);
		if (!state) {
			state = createStateForFile(currentTarget, initialContent);
			fileStates.set(currentTarget, state);
		}

		view = new EditorView({
			state,
			parent: editorContainerEl
		});
		activeTarget = currentTarget;
		lastSyncedDoc = initialContent;

		// Attach scroll event for sync-scroll
		view.scrollDOM.addEventListener('scroll', handleEditorScroll, { passive: true });
	}

	// Register hooks for syncing scroll, selection and flushing from preview
	$effect(() => {
		editorState.flushEditorSync = flushDocSync;
		return () => {
			flushDocSync();
			if (editorState.flushEditorSync === flushDocSync) {
				editorState.flushEditorSync = undefined;
			}
		};
	});

	$effect(() => {
		editorState.scrollEditorTo = (ratio: number) => {
			if (!view || isInternalSync || !editorState.syncViewEnabled) return;
			isInternalSync = true;
			const scrollDOM = view.scrollDOM;
			const maxScroll = scrollDOM.scrollHeight - scrollDOM.clientHeight;
			if (maxScroll > 0) {
				scrollDOM.scrollTop = ratio * maxScroll;
			}
			setTimeout(() => {
				isInternalSync = false;
			}, 60);
		};

		editorState.selectTextInEditor = (text: string) => {
			if (!view || isInternalSync || !editorState.syncViewEnabled) return;
			const trimmed = text.trim();
			if (trimmed.length < 2) return;

			const docStr = view.state.doc.toString();
			const idx = docStr.indexOf(trimmed);
			if (idx !== -1) {
				isInternalSync = true;
				view.dispatch({
					selection: { anchor: idx, head: idx + trimmed.length },
					scrollIntoView: true
				});
				setTimeout(() => {
					isInternalSync = false;
				}, 60);
			}
		};
	});

	// Reactive effect when editorTarget or content in editBuffer changes
	$effect(() => {
		const target = editorState.editorTarget;
		if (!target) {
			activeTarget = null;
			currentLength = 0;
			currentLineCount = 1;
			return;
		}

		const expectedContent = editorState.editBuffer.get(target) ?? '';

		if (!view && editorContainerEl) {
			initEditor();
			return;
		}

		if (view) {
			if (target !== activeTarget) {
				flushDocSync();
				// Save active file's EditorState before switching
				if (activeTarget) {
					fileStates.set(activeTarget, view.state);
				}

				// Restore or create EditorState for the new target file
				let targetState = fileStates.get(target);
				if (
					!targetState ||
					targetState.doc.length !== expectedContent.length ||
					targetState.doc.toString() !== expectedContent
				) {
					targetState = createStateForFile(target, expectedContent);
					fileStates.set(target, targetState);
				}

				view.setState(targetState);
				view.dispatch({
					effects: [
						wrapCompartment.reconfigure(lineWrap ? EditorView.lineWrapping : []),
						themeCompartment.reconfigure(isDarkMode() ? oneDark : [])
					]
				});
				activeTarget = target;
				lastSyncedDoc = expectedContent;
				currentLength = expectedContent.length;
				currentLineCount = expectedContent ? expectedContent.split('\n').length : 1;
			} else {
				// Same file active: check if content changed externally (not from this editor)
				if (expectedContent !== lastSyncedDoc) {
					const currentDoc = view.state.doc.toString();
					if (currentDoc !== expectedContent) {
						isInternalUpdate = true;
						view.dispatch({
							changes: { from: 0, to: currentDoc.length, insert: expectedContent }
						});
						isInternalUpdate = false;
						lastSyncedDoc = expectedContent;
						currentLength = expectedContent.length;
						currentLineCount = expectedContent ? expectedContent.split('\n').length : 1;
					}
				}
			}
		}
	});

	// Reactive effect for line wrap toggle
	$effect(() => {
		if (view) {
			view.dispatch({
				effects: wrapCompartment.reconfigure(lineWrap ? EditorView.lineWrapping : [])
			});
		}
	});

	let observer: MutationObserver | null = null;
	onMount(() => {
		initEditor();

		if (typeof document !== 'undefined') {
			observer = new MutationObserver(() => {
				if (view) {
					view.dispatch({
						effects: themeCompartment.reconfigure(isDarkMode() ? oneDark : [])
					});
				}
			});
			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['class']
			});
		}
	});

	onDestroy(() => {
		flushDocSync();
		if (view) {
			view.scrollDOM.removeEventListener('scroll', handleEditorScroll);
		}
		observer?.disconnect();
		view?.destroy();
		view = null;
		fileStates.clear();
		activeTarget = null;
	});
</script>

<div
	class="flex flex-col h-full bg-brand-bg text-text-color overflow-hidden border-r border-border-color"
>
	<!-- Code Pane Top Bar -->
	<div
		class="h-10 px-4 border-b border-border-color flex items-center justify-between bg-panel-2 shrink-0 select-none"
	>
		<div class="flex items-center gap-2 min-w-0 text-xs">
			<span class="text-accent-color font-semibold shrink-0 flex items-center gap-1 font-sans">
				<svg
					class="w-3.5 h-3.5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="16 18 22 12 16 6" />
					<polyline points="8 6 2 12 8 18" />
				</svg>
				<span>Editor:</span>
			</span>
			{#if editorState.editorTarget}
				<span class="font-bold truncate text-text-color font-mono" title={editorState.editorTarget}>
					{editorState.editorTarget}
				</span>
				{#if isDirty}
					<span
						class="px-2 py-0.5 rounded bg-warn/15 text-warn text-xs font-bold shrink-0 font-sans"
					>
						Đã sửa
					</span>
				{/if}
			{:else}
				<span class="text-text-mute italic font-sans">Chưa chọn file</span>
			{/if}
		</div>

		<!-- Actions -->
		<div class="flex items-center gap-3 text-xs shrink-0 font-sans">
			<span class="text-text-mute text-xs font-mono">
				{currentLineCount} dòng · {currentLength} ký tự
			</span>
			<button
				type="button"
				class="text-xs px-2 py-0.5 rounded border border-border-color bg-panel hover:text-text-color transition-colors cursor-pointer {lineWrap
					? 'text-accent-color border-accent-color/30'
					: 'text-text-mute'}"
				onclick={() => (lineWrap = !lineWrap)}
				title="Bật/Tắt tự động xuống dòng"
			>
				Wrap: {lineWrap ? 'Bật' : 'Tắt'}
			</button>
		</div>
	</div>

	<!-- Editor Workspace -->
	<div class="flex-1 relative flex overflow-hidden bg-brand-bg">
		{#if !editorState.editorTarget}
			<div
				class="flex-1 flex flex-col items-center justify-center text-text-mute p-8 text-center font-sans text-sm"
			>
				<div
					class="w-12 h-12 rounded-xl bg-panel-2 border border-border-color flex items-center justify-center text-text-mute mb-3"
				>
					<svg
						class="w-6 h-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
						/>
					</svg>
				</div>
				<p>Chọn một file từ danh sách bên trái để bắt đầu chỉnh sửa HTML hoặc CSS.</p>
			</div>
		{/if}

		<div
			bind:this={editorContainerEl}
			class="w-full h-full {!editorState.editorTarget ? 'hidden' : ''}"
		></div>
	</div>
</div>
