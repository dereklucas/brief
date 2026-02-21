# Reader

A focused markdown reader for your phone. Drop in a `.md` file or paste a URL and read it like a book — clean typography, no distractions.

**[Open Reader →](https://dereklucas.github.io/reader)**

## What it does

- Renders any Markdown file with beautiful typography (Lora serif, proper line heights, generous whitespace)
- Supports syntax highlighting, Mermaid diagrams, YAML frontmatter, and GitHub Flavored Markdown — see the [feature tour](https://dereklucas.github.io/reader?url=https://raw.githubusercontent.com/dereklucas/reader/main/examples/features.md) for examples
- Works offline after first load — nothing leaves your device
- Three themes: Light, Sepia, and Dark
- Adjustable font size, line width, and font choice
- Auto-generated table of contents for long documents
- Reading progress bar
- Copy buttons on code blocks

## How to use it

Open the link above on your phone or desktop. Then either:

1. **Drop a file or folder** — drag and drop any `.md` or `.txt` file (or a folder of them) onto the page, or tap "Choose File". Links between files in a folder work automatically.
2. **Paste a URL** — paste a raw markdown URL (GitHub blob links are auto-converted) and hit Go
3. **Paste a GitHub commit URL** — loads all changed files as a browseable set with an index page
4. **Link directly** — append `?url=` to load a document on open, e.g.:
   ```
   https://dereklucas.github.io/reader?url=https://raw.githubusercontent.com/dereklucas/reader/main/README.md
   ```

Your reading preferences (theme, font size, line width) are saved locally and persist between sessions.

## Annotations

Select any text to mark it up:

- **Strike** — marks text for deletion
- **Comment** — highlights text and attaches a note
- **Note** — the note icon in the toolbar adds a comment on the whole document

Annotations persist across page reloads (stored locally, keyed to the document content). The export button copies a structured summary to your clipboard:

```
<source>
https://raw.githubusercontent.com/…/doc.md
</source>

<annotations>
1. [DELETE] "the old approach"
2. [COMMENT on "we should revisit this"] worth a follow-up with the team
3. [NOTE] Overall this section needs a rewrite
</annotations>
```

Paste that directly into Claude or another LLM to apply the edits.

## GitHub

Paste any GitHub commit URL and Reader fetches all changed files, generates a linked index, and lets you browse them with browser back/forward:

```
https://github.com/owner/repo/commit/abc1234
```

**Private repos** require a GitHub personal access token. Add it in Settings (the gear icon). Get yours with:

```sh
gh auth token
```

The token is stored in your browser's localStorage — nothing is sent anywhere except directly to the GitHub API.

## Bookmarklet

`boost/annotate.js` brings the same strike/comment/export workflow to any webpage. The easiest way to use it is as a bookmarklet — save this as a bookmark and click it on any page:

```
javascript:void(function(){var s=document.createElement('script');s.src='https://dereklucas.github.io/reader/boost/annotate.js?_='+Date.now();document.head.appendChild(s);}());
```

Select any text to get the Strike and Comment toolbar. Export copies the same structured format as Reader, ready to paste into an LLM.

Works in Arc, Chrome, Safari, and Firefox. Also works as an Arc Boost scoped to a specific domain.

## Examples

Try these in Reader to see what it can do:

- [Feature tour](https://dereklucas.github.io/reader?url=https://raw.githubusercontent.com/dereklucas/reader/main/examples/features.md) — syntax highlighting, Mermaid diagrams, tables, task lists, frontmatter
- [Essay](https://dereklucas.github.io/reader?url=https://raw.githubusercontent.com/dereklucas/reader/main/examples/essay.md) — long-form reading with drop caps and typographic details
- [This README](https://dereklucas.github.io/reader?url=https://raw.githubusercontent.com/dereklucas/reader/main/README.md)

## It's one file

The entire app is a single HTML file — no build step, no dependencies to install, no server needed. Open `index.html` directly in a browser and it works.

## License

MIT
