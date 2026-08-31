#!/usr/bin/env node
/**
 * Pre-render LaTeX in index.html with KaTeX, at build time.
 *
 * Math is authored inline in index.html as \[ ... \] (display) or \( ... \) (inline).
 * Each rendered span stores its ORIGINAL SOURCE INCLUDING THE DELIMITERS in data-tex,
 * so restoring reproduces the authored file exactly and re-running is idempotent.
 *
 * Usage:  npm install katex@0.16.22 && node tools/render-math.js [index.html]
 */
const fs = require('fs');
const katex = require('katex');

const file = process.argv[2] || 'index.html';
let html = fs.readFileSync(file, 'utf8');

const escAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
   .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unescAttr = (s) =>
  s.replace(/&quot;/g, '"').replace(/&gt;/g, '>')
   .replace(/&lt;/g, '<').replace(/&amp;/g, '&');

// 1. Restore any previously rendered math to its authored source (delimiters included).
//    Matched loosely (any attribute order) so a hand-edited wrapper still round-trips.
//
//    Count the wrappers BEFORE restoring. If a <!--/math--> sentinel goes missing, the
//    lazy body match runs on to the NEXT sentinel and one match swallows two spans,
//    silently dropping an equation and leaving no leftover attribute to detect after
//    the fact. Comparing counts is what catches that.
const expected = (html.match(/\bdata-tex="/g) || []).length;
let restored = 0;
html = html.replace(
  /<span\b[^>]*\bclass="math(?: math-display)?"[^>]*\bdata-tex="([^"]*)"[^>]*>[\s\S]*?<\/span><!--\/math-->/g,
  (_, tex) => { restored++; return unescAttr(tex); }
);

if (restored !== expected) {
  console.error(
    `ERROR: found ${expected} rendered math span(s) but restored ${restored}.\n` +
    '       A <!--/math--> sentinel or wrapper span is malformed, so a restore either\n' +
    '       skipped a span or swallowed two at once. Fix the markup by hand before\n' +
    '       re-running; nothing was written.'
  );
  process.exit(1);
}

// Belt and braces: nothing rendered may remain once restore reports success.
if (/\bdata-tex="/.test(html)) {
  console.error('ERROR: a data-tex attribute survived restore; refusing to render.');
  process.exit(1);
}

// Delimiters must balance in the source, or a stray one would swallow the rest of
// the file into one "equation". Checked here, before rendering: after rendering the
// data-tex attributes legitimately contain \[ \] \( \).
for (const [open, close, label] of [['\\[', '\\]', 'display'], ['\\(', '\\)', 'inline']]) {
  const count = (str, tok) => str.split(tok).length - 1;
  const nOpen = count(html, open), nClose = count(html, close);
  if (nOpen !== nClose) {
    console.error(
      `ERROR: unbalanced ${label} math delimiters — ${nOpen} ${open} vs ${nClose} ${close}.\n` +
      '       Fix the stray delimiter; nothing was written.'
    );
    process.exit(1);
  }
}

// 2. Render display math, then inline math. data-tex keeps the delimiters.
const counts = { display: 0, inline: 0 };
const render = (tex, displayMode) =>
  katex.renderToString(tex.trim(), {
    displayMode,
    throwOnError: true,
    strict: 'warn',
    output: 'htmlAndMathml', // MathML alongside HTML keeps math accessible and copyable
  });

html = html.replace(/\\\[[\s\S]*?\\\]/g, (whole) => {
  counts.display++;
  const tex = whole.slice(2, -2);
  return `<span class="math math-display" data-tex="${escAttr(whole)}">` +
         render(tex, true) + '</span><!--/math-->';
});

html = html.replace(/\\\([\s\S]*?\\\)/g, (whole) => {
  counts.inline++;
  const tex = whole.slice(2, -2);
  return `<span class="math" data-tex="${escAttr(whole)}">` +
         render(tex, false) + '</span><!--/math-->';
});

fs.writeFileSync(file, html);
console.log(`restored ${restored} previously rendered spans`);
console.log(`rendered  ${counts.display} display, ${counts.inline} inline`);
