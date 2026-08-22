Good, no XSS red flags there. Let's look at the core logic modules.This is a fairly large project. Let me get a proportional sense of it and dig into the core parsing/packing logic, since that's most likely where bugs live.All 123 tests pass. Let's check lint and knip (unused code detector) since these can surface real improvement opportunities quickly.I pulled the repo and ran it (tests + lint) rather than just reading the README — here's what I found.

**Good shape overall:** 123 tests pass, `eslint` is clean, no `innerHTML`/`eval` red flags, and the architecture (routes ↔ `lib` feature folders, typed models) is sensible for a SvelteKit app.

Things worth improving:

**1. A real bug in `normalizeCharPreserveLength` (src/lib/utils/text.ts)**
It does `ch.normalize('NFD')[0]` per character to strip diacritics. For any character outside the Basic Multilingual Plane (rare Hán/Nôm characters, many CJK Extension B+ codepoints — exactly what your TXT→PDF CJK tool targets) this grabs only the first UTF-16 surrogate half, producing an invalid lone surrogate. I confirmed it:

```
input: 𠀀 (U+20000)
normalizeCharPreserveLength output: contains an unpaired surrogate, corrupted
```

Right now it's _masked_ because both call sites (`epub-chapter-utils.ts`, `epub-ocr-utils.ts`) immediately strip everything except `a-z0-9`, so the corruption gets discarded either way. But it's a landmine: reuse this "preserve length" helper anywhere for actual display text and rare characters will silently break. Fix: use `Array.from(ch.normalize('NFD'))[0]` (or just don't index into a possibly-surrogate-pair string).

**2. Two parallel logging systems**
`logger.log/warn/error` (used in most `lib` files) and a separate `Logger.info/warn/error/debug/perf` object (used only in the three `*-state.svelte.ts` files and `epub/+page.svelte`) coexist in `helpers/logger.ts`. Same purpose, different API, different emoji-prefixed formatting. Worth consolidating to one.

**3. `escapeXml` doesn't strip XML-illegal control characters**
It escapes `& < > " '` but C0 control characters (0x00–0x08, 0x0B, 0x0C, 0x0E–0x1F) are illegal in XML 1.0 and will produce a corrupt/invalid EPUB if they sneak in from OCR'd or messy TXT input. Cheap fix: add `.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')` before returning.

**4. Chapter-scoring heuristic is all magic numbers**
`scoreHeadingCandidate` in `epub-chapter-utils.ts` has thresholds like `len <= 40`, `wordCount <= 6`, `score += 3` scattered inline with no named constants. It works, but tuning it later means hunting through the function. Pulling these into a `const SCORING = {...}` object would make it much easier to adjust without guessing side effects.

**5. Minor: `getDynamicCss` substring checks are quite loose**
`html.includes('note')` or `.includes('chapter')` will match on unrelated substrings inside longer words/attributes, potentially pulling in CSS you didn't need. Not a correctness bug (just some CSS bloat), but a `class="..."` regex would be more precise than raw `.includes`.

If you want, I can send a small patch for #1 and #3 (the two that could actually cause corrupted output) — those are the ones I'd prioritize.
