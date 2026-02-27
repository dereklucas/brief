// Tests for cross-file annotation collection in folder/PR/commit mode.
// Uses window.__brief__ to inject folder state without needing the
// File System Access API (which can't be simulated in Playwright).
const { test, expect } = require('@playwright/test');
const { loadFile, annotate, clipboardInitScript, getClipboard, setupFolder } = require('./helpers');

const FILE_A = [
  '# Article Alpha',
  '',
  'This is the first file with content to annotate.',
].join('\n');

const FILE_B = [
  '# Article Beta',
  '',
  'This is the second file with different content.',
].join('\n');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(clipboardInitScript);
});

// ─── Button visibility across files ──────────────────────────────────────────

test('export button stays visible when navigating to an unannotated file', async ({ page }) => {
  await page.goto('/');
  const files = { 'a.md': FILE_A, 'b.md': FILE_B };

  // Annotate file A
  await setupFolder(page, files, 'a.md');
  await annotate(page, 'first file', 'strike');
  await expect(page.locator('#btn-export')).toBeVisible();

  // Navigate to file B (no annotations there yet)
  await page.evaluate(([files, path]) => {
    window.__brief__.setCurrentFolderFile(path);
    window.__brief__.renderMarkdown(files[path], 'b.md');
  }, [files, 'b.md']);
  await page.locator('#content h1').waitFor();

  // Export button should STILL be visible — file A has annotations
  await expect(page.locator('#btn-export')).toBeVisible();
});

// ─── Cross-file export ───────────────────────────────────────────────────────

test('export collects annotations from all folder files', async ({ page }) => {
  await page.goto('/');
  const files = { 'docs/a.md': FILE_A, 'docs/b.md': FILE_B };

  // Annotate file A
  await setupFolder(page, files, 'docs/a.md');
  await annotate(page, 'first file', 'strike');

  // Navigate to file B and annotate
  await page.evaluate(([files, path]) => {
    window.__brief__.setCurrentFolderFile(path);
    window.__brief__.renderMarkdown(files[path], 'b.md');
  }, [files, 'docs/b.md']);
  await page.locator('#content h1').waitFor();
  await annotate(page, 'second file', 'comment', 'Good intro.');

  // Export and verify both files appear
  await page.locator('#btn-export').click();
  const clip = await getClipboard(page);

  expect(clip).toContain('## docs/a.md');
  expect(clip).toContain('[DELETE] "first file"');
  expect(clip).toContain('## docs/b.md');
  expect(clip).toContain('[COMMENT on "second file"]');
  expect(clip).toContain('Good intro.');
});

test('annotations are numbered sequentially across files in export', async ({ page }) => {
  await page.goto('/');
  const files = { 'x.md': FILE_A, 'y.md': FILE_B };

  // Two annotations on file X
  await setupFolder(page, files, 'x.md');
  await annotate(page, 'first file', 'strike');
  await annotate(page, 'content to annotate', 'strike');

  // One annotation on file Y
  await page.evaluate(([files, path]) => {
    window.__brief__.setCurrentFolderFile(path);
    window.__brief__.renderMarkdown(files[path], 'y.md');
  }, [files, 'y.md']);
  await page.locator('#content h1').waitFor();
  await annotate(page, 'second file', 'strike');

  await page.locator('#btn-export').click();
  const clip = await getClipboard(page);

  // Numbering runs 1–3 across both files
  expect(clip).toMatch(/1\. \[DELETE\]/);
  expect(clip).toMatch(/2\. \[DELETE\]/);
  expect(clip).toMatch(/3\. \[DELETE\]/);
  // No 4th annotation
  expect(clip).not.toMatch(/4\. \[DELETE\]/);
});

test('files with no annotations are omitted from folder export', async ({ page }) => {
  await page.goto('/');
  const files = { 'annotated.md': FILE_A, 'clean.md': FILE_B };

  // Only annotate the first file
  await setupFolder(page, files, 'annotated.md');
  await annotate(page, 'first file', 'strike');

  // Navigate to second file without annotating
  await page.evaluate(([files, path]) => {
    window.__brief__.setCurrentFolderFile(path);
    window.__brief__.renderMarkdown(files[path], 'clean.md');
  }, [files, 'clean.md']);
  await page.locator('#content h1').waitFor();

  await page.locator('#btn-export').click();
  const clip = await getClipboard(page);

  expect(clip).toContain('## annotated.md');
  expect(clip).not.toContain('## clean.md');
});

test('folder annotations survive a page reload', async ({ page }) => {
  await page.goto('/');
  const files = {
    'index.md': '# Index\n\n- [Article](article.md)',
    'article.md': '# Article\n\nThis text gets annotated.',
  };

  // Set up on index, then "navigate" to article.md (mirrors real folder nav)
  await setupFolder(page, files, 'index.md');
  await page.evaluate(async ([files, path]) => {
    window.__brief__.setCurrentFolderFile(path);
    window.__brief__.renderMarkdown(files[path], 'article.md');
    await window.__brief__.saveLastDoc(); // persists current='article.md'
  }, [files, 'article.md']);
  await page.locator('#content h1').waitFor();

  await annotate(page, 'text gets annotated', 'strike');
  await expect(page.locator('.ann-strikethrough')).toBeVisible();

  await page.reload();
  await page.locator('#reader').waitFor({ state: 'visible', timeout: 5000 });

  // Should be on article.md (brief-last says current='article.md')
  await expect(page.locator('#content h1')).toContainText('Article');
  // Annotations must be visually restored
  await expect(page.locator('.ann-strikethrough')).toBeVisible();
});

test('annotations visible after navigating away and back', async ({ page }) => {
  await page.goto('/');
  const files = {
    'a.md': '# File A\n\nThis text gets struck through.',
    'b.md': '# File B\n\nSome other content here.',
  };

  // Use loadFolderFile (the real app function) rather than the test shims, so
  // this mirrors the actual navigation path as closely as possible.
  await page.evaluate(([files]) => window.__brief__.setFolderFiles(files), [files]);
  await page.evaluate(() => loadFolderFile('a.md', false));
  await page.locator('#reader').waitFor({ state: 'visible' });

  await annotate(page, 'text gets struck', 'strike');
  await expect(page.locator('.ann-strikethrough')).toBeVisible();

  // Navigate away
  await page.evaluate(() => loadFolderFile('b.md', false));
  await page.locator('#content h1').filter({ hasText: 'File B' }).waitFor();
  await expect(page.locator('.ann-strikethrough')).not.toBeVisible();

  // Navigate back
  await page.evaluate(() => loadFolderFile('a.md', false));
  await page.locator('#content h1').filter({ hasText: 'File A' }).waitFor();

  await expect(page.locator('.ann-strikethrough')).toBeVisible();
});

// ─── Export source format ────────────────────────────────────────────────────

test('single-file export source includes document title and filename', async ({ page }) => {
  await page.goto('/');
  await page.addInitScript(clipboardInitScript);
  await loadFile(page, '# My Great Article\n\nSome text to strike.', 'article.md');
  await annotate(page, 'Some text', 'strike');
  await page.locator('#btn-export').click();

  const clip = await getClipboard(page);
  expect(clip).toContain('My Great Article');   // document title
  expect(clip).toContain('article.md');         // filename
});

test('folder export source shows folder name not current file path', async ({ page }) => {
  await page.goto('/');
  await page.addInitScript(clipboardInitScript);
  const files = { 'notes.md': '# Notes\n\nStrike this.' };

  await setupFolder(page, files, 'notes.md', 'My Project');
  await annotate(page, 'Strike this', 'strike');
  await page.locator('#btn-export').click();

  const clip = await getClipboard(page);
  expect(clip).toContain('My Project');   // folder name in source block
  expect(clip).toContain('## notes.md'); // file header in annotations
  expect(clip).not.toContain('<source>\nnotes.md'); // NOT the file path as source
});

test('single-file export is unaffected by folder helpers', async ({ page }) => {
  // Sanity check: the folder-mode export path doesn't activate for plain files.
  await page.goto('/');
  await page.addInitScript(clipboardInitScript);

  // Load a plain file (not via setupFolder, so folderFiles stays empty)
  await page.locator('#file-input').setInputFiles({
    name: 'plain.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('# Plain\n\nJust a regular file.'),
  });
  await page.locator('#reader').waitFor({ state: 'visible' });
  await annotate(page, 'regular file', 'strike');
  await page.locator('#btn-export').click();

  const clip = await getClipboard(page);
  // Single-file format: no ## file headers, just numbered annotations
  expect(clip).toContain('[DELETE] "regular file"');
  expect(clip).not.toContain('## plain.md');
});
