<!-- src/lib/epub-editor/components/EpubEditorCodePane.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { EditorView, basicSetup } from "codemirror";
  import { EditorState, Compartment } from "@codemirror/state";
  import { html } from "@codemirror/lang-html";
  import { css } from "@codemirror/lang-css";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { keymap } from "@codemirror/view";
  import { indentWithTab } from "@codemirror/commands";
  import type { EpubEditorState } from "../epub-editor-state.svelte";

  interface Props {
    editorState: EpubEditorState;
  }

  let { editorState }: Props = $props();

  let lineWrap = $state(true);
  let editorContainerEl = $state<HTMLDivElement | null>(null);

  let view: EditorView | null = null;
  let isInternalUpdate = false;
  let isInternalSync = false;

  const languageCompartment = new Compartment();
  const themeCompartment = new Compartment();
  const wrapCompartment = new Compartment();

  let currentLineCount = $state(1);
  let currentLength = $state(0);

  const isDirty = $derived(
    editorState.editorTarget
      ? editorState.dirtyPaths.has(editorState.editorTarget)
      : false,
  );

  function isDarkMode(): boolean {
    return (
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
    );
  }

  function getLanguageExtension(path: string | null) {
    if (!path) return html({ matchClosingTags: true, autoCloseTags: true });
    const ext = path.substring(path.lastIndexOf(".")).toLowerCase();
    if (ext === ".css") {
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

  function initEditor() {
    if (!editorContainerEl) return;
    if (view) {
      view.destroy();
      view = null;
    }

    const currentTarget = editorState.editorTarget;
    const initialContent = currentTarget
      ? editorState.editBuffer.get(currentTarget) ?? ""
      : "";

    currentLength = initialContent.length;
    currentLineCount = initialContent ? initialContent.split("\n").length : 1;

    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        languageCompartment.of(getLanguageExtension(currentTarget)),
        themeCompartment.of(isDarkMode() ? oneDark : []),
        wrapCompartment.of(lineWrap ? EditorView.lineWrapping : []),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isInternalUpdate && editorState.editorTarget) {
            const newDoc = update.state.doc.toString();
            currentLength = newDoc.length;
            currentLineCount = update.state.doc.lines;
            editorState.updateFileContent(editorState.editorTarget, newDoc);
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
          "&": {
            height: "100%",
            fontSize: "13px",
            backgroundColor: "var(--brand-bg)",
            color: "var(--text-color)"
          },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            lineHeight: "1.6"
          },
          ".cm-gutters": {
            backgroundColor: "var(--panel-2)",
            color: "var(--text-mute)",
            borderRight: "1px solid var(--border-color)",
            opacity: "0.75"
          },
          ".cm-activeLine": {
            backgroundColor: "rgba(255, 255, 255, 0.04)"
          },
          ".cm-activeLineGutter": {
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            color: "var(--accent-color)"
          },
          "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection": {
            backgroundColor: "rgba(245, 158, 11, 0.4) !important"
          },
          ".cm-selectionLayer .cm-selectionBackground": {
            backgroundColor: "rgba(245, 158, 11, 0.35) !important"
          },
          ".cm-selectionMatch": {
            backgroundColor: "rgba(245, 158, 11, 0.2) !important",
            outline: "1px solid rgba(245, 158, 11, 0.4)"
          }
        })
      ]
    });

    view = new EditorView({
      state,
      parent: editorContainerEl
    });

    // Attach scroll event for sync-scroll
    view.scrollDOM.addEventListener("scroll", handleEditorScroll, { passive: true });
  }

  // Register hooks for syncing scroll and selection from preview
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
      currentLength = 0;
      currentLineCount = 1;
      return;
    }

    const expectedContent = editorState.editBuffer.get(target) ?? "";

    if (!view && editorContainerEl) {
      initEditor();
      return;
    }

    if (view) {
      const currentDoc = view.state.doc.toString();
      if (currentDoc !== expectedContent) {
        isInternalUpdate = true;
        view.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: expectedContent },
          effects: languageCompartment.reconfigure(getLanguageExtension(target))
        });
        isInternalUpdate = false;
      } else {
        view.dispatch({
          effects: languageCompartment.reconfigure(getLanguageExtension(target))
        });
      }
      currentLength = expectedContent.length;
      currentLineCount = expectedContent ? expectedContent.split("\n").length : 1;
    }
  });

  // Reactive effect for line wrap toggle
  $effect(() => {
    if (view) {
      view.dispatch({
        effects: wrapCompartment.reconfigure(
          lineWrap ? EditorView.lineWrapping : []
        )
      });
    }
  });

  let observer: MutationObserver | null = null;
  onMount(() => {
    initEditor();

    if (typeof document !== "undefined") {
      observer = new MutationObserver(() => {
        if (view) {
          view.dispatch({
            effects: themeCompartment.reconfigure(isDarkMode() ? oneDark : [])
          });
        }
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"]
      });
    }
  });

  onDestroy(() => {
    if (view) {
      view.scrollDOM.removeEventListener("scroll", handleEditorScroll);
    }
    observer?.disconnect();
    view?.destroy();
    view = null;
  });
</script>

<div class="flex flex-col h-full bg-brand-bg text-text-color overflow-hidden border-r border-border-color">
  <!-- Code Pane Top Bar -->
  <div class="h-10 px-4 border-b border-border-color flex items-center justify-between bg-panel-2 shrink-0 select-none">
    <div class="flex items-center gap-2 min-w-0 font-mono text-xs">
      <span class="text-accent-color font-semibold shrink-0">💻 Editor:</span>
      {#if editorState.editorTarget}
        <span class="font-bold truncate text-text-color" title={editorState.editorTarget}>
          {editorState.editorTarget}
        </span>
        {#if isDirty}
          <span class="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 text-[10px] font-bold shrink-0">
            Đã sửa
          </span>
        {/if}
      {:else}
        <span class="text-text-mute italic">Chưa chọn tệp</span>
      {/if}
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3 font-mono text-xs shrink-0">
      <span class="text-text-mute text-[11px]">
        {currentLineCount} dòng · {currentLength} ký tự
      </span>
      <button
        type="button"
        class="text-xs px-2 py-0.5 rounded border border-border-color bg-panel hover:text-text-color transition-colors cursor-pointer {lineWrap ? 'text-accent-color border-accent-color/30' : 'text-text-mute'}"
        onclick={() => (lineWrap = !lineWrap)}
        title="Bật/Tắt tự động xuống dòng"
      >
        Wrap: {lineWrap ? "Bật" : "Tắt"}
      </button>
    </div>
  </div>

  <!-- Editor Workspace -->
  <div class="flex-1 relative flex overflow-hidden bg-brand-bg">
    {#if !editorState.editorTarget}
      <div class="flex-1 flex flex-col items-center justify-center text-text-mute p-8 text-center font-mono text-sm">
        <span class="text-4xl mb-3">📝</span>
        <p>Chọn một tệp từ danh sách bên trái để bắt đầu chỉnh sửa HTML hoặc CSS.</p>
      </div>
    {/if}

    <div
      bind:this={editorContainerEl}
      class="w-full h-full {!editorState.editorTarget ? 'hidden' : ''}"
    ></div>
  </div>
</div>
