Good instinct to double check — I looked at the actual file tree and import graph (not just skimmed), and there are two real structural issues, plus the shape overall is actually fine. Here's the honest breakdown:

**The layout itself is a reasonable pattern:**

```
src/
├── routes/            → pages only (each route stays 50-220 lines, logic doesn't leak into it — good)
├── lib/
│   ├── <feature>/      → epub-packer, markdown-fixer, pdf-splitter (self-contained)
│   ├── components/     → shared UI (Button, Input, DropZone...)
│   ├── types/          → one .type.ts per feature
│   ├── helpers/  ⚠️
│   └── utils/    ⚠️
```

Splitting by feature (`epub-packer/`, `markdown-fixer/`, `pdf-splitter/`) and giving the big one internal sub-folders (`parser/`, `xml-builders/`, `templates/`, `components/`) while keeping the small ones flat is the right call — that's not what's making it feel messy.

**What's actually causing the "complex/not nice" feeling:**

**1. `helpers/` and `utils/` are the same thing, twice.**
`lib/helpers/helpers.ts` is literally nothing but re-exports of `lib/utils/*` (its own comment says "for backwards compatibility" — leftover from an old refactor). Result: the exact same function (`escapeXml`, `slugify`, etc.) gets imported two different ways depending on the file:

- `epub-ocr-utils.ts`, `txt-parser.ts`, `epub-chapter-utils.ts`, `epub-state.svelte.ts` → import from `$lib/helpers/helpers.js`
- `jacket-templates.ts`, `chapter-builder.ts`, `nav-builder.ts`, `opf-builder.ts` → import the same functions from `$lib/utils/*.js` directly

Anyone reading the code has to remember which door leads to the same room. **Fix:** delete `helpers/helpers.ts`, move `logger.ts` into `utils/` (or keep `helpers/` for just the logger and drop `utils/` duplication), and point every import straight at `utils/text.ts` / `utils/xml.ts` / `utils/download.ts`. One place, one import path.

**2. `epub-state.svelte.ts` is a 613-line god-file.**
Everything else in this project is nicely split (the epub components alone are broken into 8 focused files: cover, fonts, jacket, metadata, ornaments, source, pack, syntax). But all of that UI is driven by one giant state file holding metadata + chapters + jacket + fonts + ornaments + images + cover state together. That mismatch — fine-grained components, monolithic state — is probably the main thing that reads as "complex."

**Fix:** split it to mirror the components you already have, e.g.:

```
epub-packer/
└── state/
    ├── epub-metadata-state.svelte.ts
    ├── epub-source-state.svelte.ts     (chapters, TOC, files)
    ├── epub-jacket-state.svelte.ts
    ├── epub-fonts-state.svelte.ts
    └── epub-images-state.svelte.ts     (cover + ornaments + illustrations)
```

each exporting a small store, composed together in one `epub-state.svelte.ts` barrel if you still want a single import surface for the route.

**3. Scale mismatch is inherent, not a bug.**
`epub-packer/` is ~276K vs 12–16K for the other two — that's just because EPUB packing is genuinely 5-10x more work than the other tools, not a structure problem. I wouldn't try to "balance" it artificially.

If you want, I can actually make the two fixes above (collapse `helpers/`→`utils/`, split `epub-state.svelte.ts`) and show you the diff — that's the highest-leverage cleanup for how it feels to navigate, with low risk since tests/lint are already green as a safety net.
