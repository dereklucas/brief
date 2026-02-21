if (!document.getElementById('rdr-style')) {

// ─── Styles ───
const style = document.createElement('style');
style.id = 'rdr-style';
style.textContent = `
  #rdr-toolbar {
    position: fixed;
    z-index: 2147483647;
    background: #1a1410;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    display: none;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }
  #rdr-toolbar.rdr-on { display: flex; }
  .rdr-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: none;
    background: none;
    color: #F5F0E8;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 6px;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }
  .rdr-btn:hover { background: rgba(255,255,255,0.15); }
  .rdr-btn + .rdr-btn { border-left: 1px solid rgba(255,255,255,0.15); }

  .rdr-strike {
    text-decoration: line-through;
    text-decoration-color: rgba(220,50,30,0.7);
    text-decoration-thickness: 2px;
    background: rgba(220,50,30,0.06);
  }
  .rdr-comment {
    background: rgba(255,180,0,0.2);
    border-bottom: 2px solid rgba(220,160,0,0.5);
    cursor: pointer;
  }

  #rdr-popover {
    position: fixed;
    z-index: 2147483646;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.12);
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.14);
    width: min(320px, calc(100vw - 32px));
    display: none;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }
  #rdr-popover.rdr-on { display: block; }
  #rdr-textarea {
    width: 100%;
    min-height: 80px;
    padding: 10px 12px;
    border: 1px solid rgba(0,0,0,0.12);
    border-radius: 8px;
    background: #f8f7f5;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    color: #1a1410;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
  }
  #rdr-textarea:focus { border-color: #8B4513; }
  .rdr-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
  .rdr-save, .rdr-cancel {
    padding: 7px 16px;
    border-radius: 100px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }
  .rdr-save { background: #8B4513; color: #fff; }
  .rdr-cancel { background: #efefef; color: #555; }

  #rdr-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(16px);
    background: #1a1410;
    color: #F5F0E8;
    padding: 10px 24px;
    border-radius: 100px;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    opacity: 0;
    transition: opacity 200ms ease, transform 200ms ease;
    z-index: 2147483647;
    pointer-events: none;
    white-space: nowrap;
  }
  #rdr-toast.rdr-on { opacity: 1; transform: translateX(-50%) translateY(0); }
`;
document.head.appendChild(style);

// ─── HTML ───
function el(tag, id, html) {
  const node = document.createElement(tag);
  node.id = id;
  node.innerHTML = html;
  return node;
}

const toolbar = el('div', 'rdr-toolbar', `
  <button class="rdr-btn" id="rdr-strike">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <path d="M16 7c0-2-2-3-4-3s-4 1-4 3c0 2 3 3 4 3"/>
      <path d="M8 17c0 2 2 3 4 3s4-1 4-3c0-2-3-3-4-3"/>
    </svg>Strike
  </button>
  <button class="rdr-btn" id="rdr-comment">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>Comment
  </button>
  <button class="rdr-btn" id="rdr-export" style="display:none">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
    </svg>Export
  </button>
`);

const popover = el('div', 'rdr-popover', `
  <textarea id="rdr-textarea" placeholder="Add your note…"></textarea>
  <div class="rdr-actions">
    <button class="rdr-cancel" id="rdr-cancel">Cancel</button>
    <button class="rdr-save" id="rdr-save">Save</button>
  </div>
`);

const toast = el('div', 'rdr-toast', '');
document.body.append(toolbar, popover, toast);

// ─── State ───
let savedRange = null;
let annotations = [];
let counter = 0;

// ─── Selection ───
let selTimer;
document.addEventListener('mouseup', () => { clearTimeout(selTimer); selTimer = setTimeout(checkSel, 20); });
document.addEventListener('touchend', () => { clearTimeout(selTimer); selTimer = setTimeout(checkSel, 20); });

function checkSel() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) {
    if (!popover.classList.contains('rdr-on')) hideToolbar();
    return;
  }
  const range = sel.getRangeAt(0);
  if (toolbar.contains(range.commonAncestorContainer) ||
      popover.contains(range.commonAncestorContainer)) return;
  showToolbar(range);
}

function showToolbar(range) {
  savedRange = range.cloneRange();
  toolbar.style.visibility = 'hidden';
  toolbar.classList.add('rdr-on');
  const rect = range.getBoundingClientRect();
  const tbRect = toolbar.getBoundingClientRect();
  let top = rect.top - tbRect.height - 8;
  let left = rect.left + rect.width / 2 - tbRect.width / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - tbRect.width - 8));
  if (top < 8) top = rect.bottom + 8;
  toolbar.style.top = top + 'px';
  toolbar.style.left = left + 'px';
  toolbar.style.visibility = '';
  document.getElementById('rdr-export').style.display = annotations.length ? '' : 'none';
}

function hideToolbar() { toolbar.classList.remove('rdr-on'); }

// ─── Strike ───
btn('rdr-strike', () => {
  if (!savedRange) return;
  const text = savedRange.toString();
  const id = 'rdr-' + (++counter);
  wrapRange(savedRange, 'rdr-strike', id);
  annotations.push({ id, type: 'strikethrough', text, comment: null });
  window.getSelection().removeAllRanges();
  savedRange = null;
  hideToolbar();
});

// ─── Comment ───
btn('rdr-comment', () => {
  if (!savedRange) return;
  hideToolbar();
  const rect = savedRange.getBoundingClientRect();
  let top = rect.bottom + 8;
  let left = rect.left;
  left = Math.max(8, Math.min(left, window.innerWidth - 336));
  if (top + 160 > window.innerHeight) top = rect.top - 160;
  popover.style.top = top + 'px';
  popover.style.left = left + 'px';
  popover.classList.add('rdr-on');
  const ta = document.getElementById('rdr-textarea');
  ta.value = '';
  ta.focus();
});

btn('rdr-save', saveComment);
btn('rdr-cancel', closePopover);

document.getElementById('rdr-textarea').addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveComment(); }
  if (e.key === 'Escape') closePopover();
});

function saveComment() {
  const comment = document.getElementById('rdr-textarea').value.trim();
  if (!comment || !savedRange) return;
  const text = savedRange.toString();
  const id = 'rdr-' + (++counter);
  wrapRange(savedRange, 'rdr-comment', id, comment);
  annotations.push({ id, type: 'comment', text, comment });
  window.getSelection().removeAllRanges();
  savedRange = null;
  closePopover();
}

function closePopover() {
  popover.classList.remove('rdr-on');
  savedRange = null;
}

// ─── Export ───
btn('rdr-export', () => {
  if (!annotations.length) return;
  let out = `<source>\n${document.title}\n${location.href}\n</source>\n\n<annotations>\n`;
  annotations.forEach((ann, i) => {
    if (ann.type === 'strikethrough') out += `${i + 1}. [DELETE] "${ann.text}"\n`;
    else out += `${i + 1}. [COMMENT on "${ann.text}"] ${ann.comment}\n`;
  });
  out += `</annotations>\n\nPlease apply these annotations to the source document.`;
  navigator.clipboard.writeText(out).then(() => {
    hideToolbar();
    showToast('Annotations copied');
  });
});

// ─── Range wrapping ───
function wrapRange(range, className, id, comment) {
  for (const { node, start, end } of getTextNodesInRange(range)) {
    let target = node;
    let tEnd = end;
    if (start > 0) { target = target.splitText(start); tEnd = end - start; }
    if (tEnd < target.length) target.splitText(tEnd);
    const span = document.createElement('span');
    span.className = className;
    span.dataset.rdrId = id;
    if (comment) span.title = comment;
    target.parentNode.insertBefore(span, target);
    span.appendChild(target);
  }
}

function getTextNodesInRange(range) {
  if (range.collapsed) return [];
  if (range.startContainer === range.endContainer &&
      range.startContainer.nodeType === Node.TEXT_NODE) {
    return [{ node: range.startContainer, start: range.startOffset, end: range.endOffset }];
  }
  const root = range.commonAncestorContainer;
  const rootEl = root.nodeType === Node.TEXT_NODE ? root.parentNode : root;
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  const result = [];
  let node;
  while (node = walker.nextNode()) {
    if (!range.intersectsNode(node)) { if (result.length) break; continue; }
    let start = 0, end = node.length;
    if (node === range.startContainer) start = range.startOffset;
    if (node === range.endContainer) end = range.endOffset;
    if (start < end) result.push({ node, start, end });
  }
  return result;
}

// ─── Toast ───
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('rdr-on');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('rdr-on'), 2500);
}

// ─── Close on outside click ───
document.addEventListener('pointerdown', e => {
  if (toolbar.contains(e.target) || popover.contains(e.target)) return;
  hideToolbar();
  popover.classList.remove('rdr-on');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { hideToolbar(); popover.classList.remove('rdr-on'); }
});

// ─── Helpers ───
function btn(id, fn) {
  const node = document.getElementById(id);
  node.addEventListener('mousedown', e => e.preventDefault());
  node.addEventListener('click', fn);
}

} // end duplicate-injection guard
