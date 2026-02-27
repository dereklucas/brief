// Shared utilities for Brief Playwright tests.

/**
 * Load markdown content into the app via the hidden file input.
 * Waits for the reader view to become visible before resolving.
 */
async function loadFile(page, content, filename = 'test.md') {
  await page.locator('#file-input').setInputFiles({
    name: filename,
    mimeType: 'text/markdown',
    buffer: Buffer.from(content),
  });
  await page.locator('#reader').waitFor({ state: 'visible', timeout: 5000 });
}

/**
 * Programmatically select text inside #content and wait for the annotation
 * toolbar to appear (it has a 20ms debounce in the app).
 */
async function selectText(page, searchText) {
  const found = await page.evaluate((text) => {
    const content = document.getElementById('content');
    if (!content) return false;
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const idx = node.textContent.indexOf(text);
      if (idx !== -1) {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + text.length);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        // Trigger the mouseup handler that shows the toolbar
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        return true;
      }
    }
    return false;
  }, searchText);

  if (!found) throw new Error(`Text not found in #content: "${searchText}"`);
  // The toolbar appears after a 20ms setTimeout — wait for the class
  await page.locator('#annotation-toolbar.visible').waitFor({ timeout: 2000 });
}

/**
 * Select text and apply a 'strike' or 'comment' annotation.
 * For comments, pass the note text as the third argument.
 */
async function annotate(page, text, type, comment = '') {
  await selectText(page, text);

  if (type === 'strike') {
    await page.locator('#annotation-toolbar button:has-text("Strike")').click();
  } else if (type === 'comment') {
    await page.locator('#annotation-toolbar button:has-text("Comment")').click();
    await page.locator('#comment-popover').waitFor({ state: 'visible' });
    await page.locator('#comment-text').fill(comment);
    await page.locator('.comment-save').click();
    await page.locator('#comment-popover').waitFor({ state: 'hidden' });
  }
}

/**
 * Intercept navigator.clipboard.writeText so tests can inspect what the
 * app would copy without needing clipboard permissions.
 * Call this via page.addInitScript() in beforeEach.
 */
function clipboardInitScript() {
  window.__clipboard = null;
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: async (text) => { window.__clipboard = text; },
    },
    configurable: true,
    writable: true,
  });
}

/**
 * Read the text captured by clipboardInitScript.
 */
async function getClipboard(page) {
  return page.evaluate(() => window.__clipboard);
}

/**
 * Set up folder state via window.__brief__ and render the starting file.
 * Simulates dropping a folder without needing the File System Access API.
 *
 * Also calls saveLastDoc so that page.reload() tests get the correct brief-last
 * state (mirroring what loadFolderFile does in the real app).
 */
async function setupFolder(page, files, startPath, source = 'Test Folder') {
  await page.evaluate(async ([files, path, src]) => {
    window.__brief__.setFolderFiles(files);
    window.__brief__.setCurrentFolderFile(path);
    window.__brief__.setFolderSource(src);
    window.__brief__.renderMarkdown(files[path], path.split('/').pop());
    await window.__brief__.saveLastDoc();
  }, [files, startPath, source]);
  await page.locator('#reader').waitFor({ state: 'visible', timeout: 5000 });
}

module.exports = { loadFile, selectText, annotate, clipboardInitScript, getClipboard, setupFolder };
