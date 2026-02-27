// Tests for basic app loading, file rendering, and UI chrome.
const { test, expect } = require('@playwright/test');
const { loadFile } = require('./helpers');

test('shows dropzone on initial load', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#dropzone')).toBeVisible();
  await expect(page.locator('#reader')).not.toBeVisible();
  await expect(page.locator('#app-title')).not.toBeVisible();
  await expect(page.title()).resolves.toBe('Brief');
});

test('loads a markdown file and shows the reader', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, '# Hello World\n\nThis is a paragraph.', 'hello.md');

  await expect(page.locator('#reader')).toBeVisible();
  await expect(page.locator('#dropzone')).not.toBeVisible();
  await expect(page.locator('#content h1')).toContainText('Hello World');
  await expect(page.locator('#app-title')).toContainText('Hello World');
  await expect(page.title()).resolves.toContain('Hello World');
});

test('renders paragraphs and basic markdown', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, [
    '# Title',
    '',
    'A paragraph with **bold** and *italic* text.',
    '',
    '- List item one',
    '- List item two',
  ].join('\n'));

  await expect(page.locator('#content strong')).toContainText('bold');
  await expect(page.locator('#content em')).toContainText('italic');
  await expect(page.locator('#content li')).toHaveCount(2);
});

test('renders frontmatter metadata block', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, [
    '---',
    'title: My Article',
    'author: Jane Doe',
    'date: 2024-06-01',
    '---',
    '',
    '# My Article',
    '',
    'Body text here.',
  ].join('\n'));

  await expect(page.locator('.doc-meta')).toContainText('Jane Doe');
  await expect(page.locator('.doc-meta')).toContainText('June 1, 2024');
});

test('shows ToC button when document has 2+ headings', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, '# Section One\n\nParagraph.\n\n## Section Two\n\nMore text.');
  await expect(page.locator('#btn-toc')).toBeVisible();
});

test('hides ToC button for single-heading documents', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, '# Only Heading\n\nJust one heading here.');
  await expect(page.locator('#btn-toc')).not.toBeVisible();
});

test('ToC panel opens and lists headings', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, '# Alpha\n\nPara.\n\n## Beta\n\nPara.\n\n## Gamma\n\nPara.');

  await page.locator('#btn-toc').click();
  await expect(page.locator('#toc-panel')).toBeVisible();
  await expect(page.locator('#toc-list li')).toHaveCount(3);
  await expect(page.locator('#toc-list')).toContainText('Alpha');
  await expect(page.locator('#toc-list')).toContainText('Beta');
});

test('settings panel opens and closes', async ({ page }) => {
  await page.goto('/');
  await page.locator('#btn-settings').click();
  await expect(page.locator('#settings-panel')).toHaveClass(/open/);
  await page.locator('#overlay').click();
  // The panel slides off-screen via transform, not display:none, so we check
  // for the absence of the 'open' class rather than toBeVisible().
  await expect(page.locator('#settings-panel')).not.toHaveClass(/open/);
});

test('font size increases and decreases', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, '# Doc\n\nContent.');
  await page.locator('#btn-settings').click();

  const getSize = () => page.evaluate(() =>
    parseInt(document.documentElement.style.getPropertyValue('--text-base'))
  );

  const initial = await getSize();
  await page.locator('button:has-text("A+")').click();
  expect(await getSize()).toBe(initial + 1);
  await page.locator('button:has-text("A−")').click();
  expect(await getSize()).toBe(initial);
});

test('restores last document after page reload', async ({ page }) => {
  await page.goto('/');
  await loadFile(page, '# Persisted Title\n\nThis content should come back.', 'persist.md');
  await expect(page.locator('#content h1')).toContainText('Persisted Title');

  await page.reload();
  await page.locator('#reader').waitFor({ state: 'visible', timeout: 5000 });
  await expect(page.locator('#content h1')).toContainText('Persisted Title');
});
