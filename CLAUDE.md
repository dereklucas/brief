# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-file PWA markdown reader for focused mobile reading. The entire app lives in `index.html` — no build step, no bundler, no dependencies to install. Open it directly in a browser. Deployed to GitHub Pages at dereklucas.github.io/reader.

## Development

There is no build, lint, or test process. To work on the app, edit `index.html` and open it in a browser. All CSS, HTML, and JavaScript are in that one file.

To deploy: push to main. GitHub Pages serves `index.html` automatically.

## Architecture

`index.html` is structured in this order:

1. **`<head>`** — Meta tags, Google Fonts link, CDN script/link tags (marked, highlight.js, mermaid), inline PWA manifest (generated as a Blob URL)
2. **`<style>`** — All CSS using custom properties (design tokens) on `:root` and `[data-theme="dark"]`. Sepia theme is applied at runtime via `style.setProperty` overrides rather than a CSS selector.
3. **`<body>` HTML** — The UI has two mutually exclusive views toggled via `display: none/block`:
   - `#dropzone` — Landing screen with file picker + URL input
   - `#reader` > `#content` — The rendered markdown article
   - Fixed/sticky elements: `#topbar`, `#progress-bar`, `#scroll-top` FAB, `#settings-panel` (bottom sheet), `#toc-panel` (right drawer), `#overlay`
4. **First `<script>`** — All application logic as plain functions (no framework, no modules):
   - **State**: `fontSize`, `currentTheme`, `currentFont`, `measureWidth` — all persisted to `localStorage` with `reader-` prefixed keys
   - **Rendering pipeline**: `renderMarkdown()` → strips YAML frontmatter → preprocesses mermaid fences into `<div class="mermaid">` → runs `marked.parse()` → post-processes `<pre>` blocks to add copy buttons/language labels → injects into `#content` → calls `mermaid.run()` → builds ToC
   - **Frontmatter**: Naive YAML parser (`parseFrontmatter`) that handles `key: value` lines, not nested structures
   - **ToC**: Auto-generated from headings in rendered content; shown only when 2+ headings exist; active heading tracked on scroll
5. **Second `<script>`** — Service Worker registered via Blob URL, caches CDN assets for offline use

## CDN Dependencies (pinned versions)

| Library      | Version | Purpose                  |
|-------------|---------|--------------------------|
| marked       | 9.1.6   | Markdown → HTML          |
| highlight.js | 11.9.0  | Syntax highlighting      |
| mermaid      | 10.6.1  | Diagram rendering        |
| Google Fonts | —       | Lora, Playfair Display, JetBrains Mono |

## annotate.js

A standalone bookmarklet/Arc Boost that brings the strike/comment/export workflow to any webpage. The bookmarklet URL (in both `annotate.js` and `README.md`) points to the GitHub Pages URL of this file. **If the file is renamed or moved, update the URL in both places.**

## Key Conventions

- **Everything in one file** — do not split into separate CSS/JS files. The single-file design is intentional for portability.
- **No framework** — plain vanilla JS with direct DOM manipulation. Keep it that way.
- **Theming** — Light and Dark use `[data-theme]` attribute + CSS custom properties. Sepia is a special case that applies inline style overrides on `body`. When adding new theme-sensitive styles, update all three themes.
- **localStorage keys** are prefixed with `reader-`: `reader-fontsize`, `reader-theme`, `reader-font`, `reader-width`.
- **Mobile-first** — safe area insets via `env(safe-area-inset-*)`, touch-action manipulation on buttons, single responsive breakpoint at 768px.
- **The Service Worker uses a Blob URL** — it won't persist across hard reloads in all browsers. For production, it should be extracted to a real `sw.js` file.
