# Brief

A focused markdown reader and annotation tool. Drop in a `.md` file or paste a URL — clean typography, no distractions. Select any text to strike it, comment on it, and export your notes to paste into an LLM.

**[Open Brief →](https://dereklucas.github.io/brief)**

## What it does

- Renders any Markdown file with beautiful typography (Lora serif, proper line heights, generous whitespace)
- Supports syntax highlighting, Mermaid diagrams, YAML frontmatter, and GitHub Flavored Markdown — see the [feature tour](https://dereklucas.github.io/brief?url=https://raw.githubusercontent.com/dereklucas/brief/main/examples/features.md) for examples
- Works offline after first load — nothing leaves your device
- Defaults to your system light/dark preference; also supports Sepia
- Adjustable font size, line width, and font choice
- Auto-generated table of contents for long documents
- Reading progress bar
- Copy buttons on code blocks
- Remembers your last dropped file or folder — reopening shows it immediately

## How to use it

Open the link above on your phone or desktop. Then either:

1. **Drop a file or folder** — drag and drop any `.md` or `.txt` file (or a folder of them) onto the page, or tap "Choose File". Links between files in a folder work automatically.
2. **Paste a URL** — paste a raw markdown URL (GitHub blob links are auto-converted) and hit Go
3. **Paste a GitHub commit or PR URL** — loads all changed files as a browseable set with an index page
4. **Link directly** — append `?url=` to load a document on open, e.g.:
   ```
   https://dereklucas.github.io/brief?url=https://raw.githubusercontent.com/dereklucas/brief/main/README.md
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

Paste any GitHub commit or PR URL and Brief fetches all changed files, generates a linked index, and lets you browse them with browser back/forward:

```
https://github.com/owner/repo/commit/abc1234
https://github.com/owner/repo/pull/123
```

**Private repos** require a GitHub personal access token. Add it in Settings (the gear icon). Get yours with:

```sh
gh auth token
```

The token is stored in your browser's localStorage — nothing is sent anywhere except directly to the GitHub API.

## Annotate on any page

The same strike/comment/export workflow works on any webpage, not just in Brief.

**Chrome / Arc** — load the extension in developer mode:
1. Go to `chrome://extensions` → enable Developer mode
2. Load unpacked → select the `extension/` folder

**Safari / Firefox** — use the bookmarklet (`annotate.js`). Save this as a bookmark and click it on any page:

```
javascript:void(function(){var s=document.createElement('script');s.src='https://dereklucas.github.io/brief/annotate.js?_='+Date.now();document.head.appendChild(s);}());
```

## Examples

Try these in Brief to see what it can do:

- [Feature tour](https://dereklucas.github.io/brief?url=https://raw.githubusercontent.com/dereklucas/brief/main/examples/features.md) — syntax highlighting, Mermaid diagrams, tables, task lists, frontmatter
- [Essay](https://dereklucas.github.io/brief?url=https://raw.githubusercontent.com/dereklucas/brief/main/examples/essay.md) — long-form reading with drop caps and typographic details
- [This README](https://dereklucas.github.io/brief?url=https://raw.githubusercontent.com/dereklucas/brief/main/README.md)

## It's one file

The entire app is a single HTML file — no build step, no dependencies to install, no server needed. Open `index.html` directly in a browser and it works.

## License

MIT
