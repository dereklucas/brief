// Tests for annotation creation, display, persistence, export, and removal.
const { test, expect } = require('@playwright/test');
const { loadFile, annotate, clipboardInitScript, getClipboard } = require('./helpers');

const DOC = [
  '# Test Document',
  '',
  'First paragraph with some text to annotate.',
  '',
  'Second paragraph for additional annotations.',
].join('\n');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(clipboardInitScript);
});

// ─── Creation ───────────────────────────────────────────────────────────────

test('strikethrough annotates selected text', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, DOC);
  await annotate(page, 'some text', 'strike');

  await expect(page.locator('.ann-strikethrough')).toContainText('some text');
});

test('comment annotates selected text and stores the note', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, DOC);
  await annotate(page, 'First paragraph', 'comment', 'This needs work.');

  await expect(page.locator('.ann-comment')).toBeVisible();
  await page.locator('.ann-comment').first().click();
  await expect(page.locator('#ann-detail')).toBeVisible();
  await expect(page.locator('#ann-detail-comment')).toContainText('This needs work.');
});

// ─── Toolbar visibility ──────────────────────────────────────────────────────

test('export and clear buttons are hidden before any annotation', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, DOC);

  await expect(page.locator('#btn-export')).not.toBeVisible();
  await expect(page.locator('#btn-clear')).not.toBeVisible();
});

test('export and clear buttons appear after first annotation', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, DOC);
  await annotate(page, 'some text', 'strike');

  await expect(page.locator('#btn-export')).toBeVisible();
  await expect(page.locator('#btn-clear')).toBeVisible();
});

// ─── Export format ───────────────────────────────────────────────────────────

test('export produces correct single-file format', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, DOC, 'report.md');
  await annotate(page, 'some text', 'strike');
  await annotate(page, 'Second paragraph', 'comment', 'Needs more detail.');
  await page.locator('#btn-export').click();

  const clip = await getClipboard(page);
  expect(clip).toContain('<source>');
  expect(clip).toContain('report.md');
  expect(clip).toContain('[DELETE] "some text"');
  expect(clip).toContain('[COMMENT on "Second paragraph"]');
  expect(clip).toContain('Needs more detail.');
  expect(clip).toContain('</annotations>');
});

test('annotations are numbered sequentially in export', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, DOC);
  await annotate(page, 'some text', 'strike');
  await annotate(page, 'Second paragraph', 'strike');
  await page.locator('#btn-export').click();

  const clip = await getClipboard(page);
  expect(clip).toContain('1. [DELETE]');
  expect(clip).toContain('2. [DELETE]');
});

// ─── Persistence ─────────────────────────────────────────────────────────────

test('annotations survive a page reload', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, DOC);
  await annotate(page, 'some text', 'strike');
  await annotate(page, 'First paragraph', 'comment', 'Check this.');
  await expect(page.locator('.ann-strikethrough')).toBeVisible();

  await page.reload();
  await page.locator('#reader').waitFor({ state: 'visible', timeout: 5000 });

  await expect(page.locator('.ann-strikethrough')).toBeVisible();
  await expect(page.locator('.ann-comment')).toBeVisible();
  await expect(page.locator('#btn-export')).toBeVisible();
});

test('annotations for different documents are stored independently', async ({ page }) => {
  await page.goto('/');

  // Annotate doc A
  await loadFile(page, '# Doc A\n\nText in Alpha.', 'a.md');
  await annotate(page, 'Text in Alpha', 'strike');

  // Load doc B — doc A's annotation should not appear
  await loadFile(page, '# Doc B\n\nText in Beta.', 'b.md');
  await expect(page.locator('.ann-strikethrough')).not.toBeVisible();
  await expect(page.locator('#btn-export')).not.toBeVisible();
});

// ─── Removal ─────────────────────────────────────────────────────────────────

test('removing an annotation clears it from the DOM', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, DOC);
  await annotate(page, 'some text', 'strike');
  await expect(page.locator('.ann-strikethrough')).toBeVisible();

  await page.locator('.ann-strikethrough').click();
  await expect(page.locator('#ann-detail')).toBeVisible();
  await page.locator('#ann-detail button:has-text("Remove")').click();

  await expect(page.locator('.ann-strikethrough')).not.toBeVisible();
  await expect(page.locator('#btn-export')).not.toBeVisible();
});

test('clear button removes all annotations at once', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, DOC);
  await annotate(page, 'some text', 'strike');
  await annotate(page, 'Second paragraph', 'strike');

  await page.locator('#btn-clear').click();

  await expect(page.locator('.ann-strikethrough')).not.toBeVisible();
  await expect(page.locator('#btn-clear')).not.toBeVisible();
  await expect(page.locator('#btn-export')).not.toBeVisible();
});

test('cleared annotations do not reappear after reload', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, DOC);
  await annotate(page, 'some text', 'strike');
  await page.locator('#btn-clear').click();

  await page.reload();
  await page.locator('#reader').waitFor({ state: 'visible', timeout: 5000 });

  await expect(page.locator('.ann-strikethrough')).not.toBeVisible();
  await expect(page.locator('#btn-export')).not.toBeVisible();
});
