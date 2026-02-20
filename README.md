# Reader

A focused markdown reader for your phone. Drop in a `.md` file or paste a URL and read it like a book — clean typography, no distractions.

**[Open Reader →](https://v-good.github.io/reader)**

## What it does

- Renders any Markdown file with beautiful typography (Lora serif, proper line heights, generous whitespace)
- Supports syntax highlighting, Mermaid diagrams, YAML frontmatter, and GitHub Flavored Markdown
- Works offline after first load — nothing leaves your device
- Three themes: Light, Sepia, and Dark
- Adjustable font size, line width, and font choice
- Auto-generated table of contents for long documents
- Reading progress bar
- Copy buttons on code blocks

## How to use it

Open the link above on your phone or desktop. Then either:

1. **Drop a file** — drag and drop any `.md` or `.txt` file onto the page, or tap "Choose File"
2. **Paste a URL** — paste a raw markdown URL (GitHub links are auto-converted) and hit Go
3. **Link directly** — append `?url=` to load a document on open, e.g.:
   ```
   https://v-good.github.io/reader?url=https://raw.githubusercontent.com/user/repo/main/README.md
   ```

Your reading preferences (theme, font size, line width) are saved locally and persist between sessions.

## It's one file

The entire app is a single HTML file — no build step, no dependencies to install, no server needed. Open `index.html` directly in a browser and it works.

## License

MIT
