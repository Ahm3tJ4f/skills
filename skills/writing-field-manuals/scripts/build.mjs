#!/usr/bin/env node
// Build a field-manual document from a source file.
// Usage: node build.mjs <doc.src.html> [--out <file.html>] [--theme <name>] [--strict]
// Exit code: 0 = built, 1 = errors (nothing written), 2 = bad usage.
import { readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderFigure } from './lib/mermaid.mjs'
import { checkProse, checkStructure } from './lib/prose.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const asset = f => readFileSync(join(here, '..', 'assets', f), 'utf8')
const THEME_NAMES = {
  light: { paper: 'Paper', 'microfilm-print': 'Microfilm print', whiteprint: 'Whiteprint', 'blue-photocopy': 'Blue photocopy', 'drafting-vellum': 'Drafting vellum' },
  dark: { microfilm: 'Microfilm', 'night-blueprint': 'Night blueprint', 'blue-microfiche': 'Blue microfiche', 'graphite-drafting': 'Graphite drafting' },
}
const THEMES = [...Object.keys(THEME_NAMES.light), ...Object.keys(THEME_NAMES.dark)]
const TYPES = { explainer: 'Explainer', lesson: 'Lesson', decision: 'Decision record', comparison: 'Comparison', procedure: 'Procedure', incident: 'Incident report' }

// ---- Arguments ----
const args = process.argv.slice(2)
const flag = name => { const i = args.indexOf(name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v }
const strict = args.includes('--strict'); if (strict) args.splice(args.indexOf('--strict'), 1)
let outFile = flag('--out'), themeArg = flag('--theme')
const inFile = args[0]
if (!inFile) { console.error('Usage: node build.mjs <doc.src.html> [--out <file.html>] [--theme <name>] [--strict]'); process.exit(2) }
const src = readFileSync(inFile, 'utf8')
const name = basename(inFile)

// ---- Report ----
const items = []
const report = {
  error: (line, code, msg, fix) => items.push({ level: 'error', line, code, msg, fix }),
  warn: (line, code, msg, fix) => items.push({ level: 'warn', line, code, msg, fix }),
}
const lineOf = i => src.slice(0, i).split('\n').length

// ---- Front matter ----
const fm = src.match(/^---\n([\s\S]*?)\n---\n/)
const meta = {}
if (!fm) report.error(1, 'E001', 'Front matter is missing.', 'Start the file with ---, then title, domain, type, question, and ---.')
else for (const l of fm[1].split('\n')) { const m = l.match(/^(\w+):\s*(.*)$/); if (m) meta[m[1]] = m[2].replace(/(^|\s)#.*$/, '').trim() }
for (const k of ['title', 'domain', 'type', 'question']) if (fm && !meta[k]) report.error(1, 'E001', `Front matter needs "${k}".`, `Add "${k}: ..." to the front matter.`)
if (meta.type && !TYPES[meta.type]) report.error(1, 'E002', `Unknown type "${meta.type}".`, `Use one of: ${Object.keys(TYPES).join(', ')}.`)
const theme = themeArg || meta.theme
if (!theme) report.error(1, 'E004', 'No theme is set.', `Ask the user which theme to use, then add "theme: <name>" to the front matter. Themes: ${THEMES.join(', ')}.`)
else if (!THEMES.includes(theme)) report.error(1, 'E003', `Unknown theme "${theme}".`, `Use one of: ${THEMES.join(', ')}.`)
const date = meta.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
const bodyStart = fm ? fm[0].length : 0
let body = src.slice(bodyStart)
const bodyLine = i => lineOf(bodyStart + i)

// ---- Checks on the source ----
checkProse(src, report)
if (meta.type) checkStructure(body, meta, report)
if (/<(h1|div class="rh"|div class="rf")\b/.test(body)) report.error(bodyLine(body.search(/<(h1|div class="rh"|div class="rf")\b/)), 'E103', 'The title, running head and footer come from the front matter.', 'Delete the <h1>, rh and rf elements.')
if (/class="cols"/.test(body)) report.error(bodyLine(body.indexOf('class="cols"')), 'E104', 'Two-column text is not used.', 'Delete the <div class="cols"> wrapper. Write full-width paragraphs.')
if (/<script\b/.test(body) && /\bfig\(/.test(body) ) {
  report.warn(bodyLine(body.indexOf('<script')), 'W501', 'Custom 2D drawing code found.', 'Use a Mermaid figure if a type fits (references/diagrams.md). If not, check the layout with check.sh and a screenshot.')
}

// ---- Box heads: normal case, not capitals ("BOTTOM LINE" becomes "Bottom line") ----
body = body.replace(/(<div class="head">)([^<]+)(<\/div>)/g, (all, open, text, close) =>
  /[A-Z]/.test(text) && text === text.toUpperCase() ? open + text.charAt(0) + text.slice(1).toLowerCase() + close : all)

// ---- Mermaid figures ----
let n = 0
body = body.replace(/<figure\b([^>]*)\bdata-mermaid\b([^>]*)>([\s\S]*?)<\/figure>/g, (all, a1, a2, inner, offset) => {
  const attrs = a1 + a2
  const caption = (attrs.match(/caption="([^"]*)"/) || [])[1]
  const id = (attrs.match(/\bid="([^"]*)"/) || [])[1]
  const startLine = bodyLine(offset)
  if (!caption) report.error(startLine, 'E201', 'A figure needs a caption.', 'Add caption="..." to the <figure>.')
  const raw = inner.replace(/^\s*\n/, '').replace(/\s+$/, '')
  const firstLine = startLine + (inner.match(/^\s*\n/) ? inner.match(/^\s*\n/)[0].split('\n').length - 1 : 0)
  const indent = Math.min(...raw.split('\n').filter(l => l.trim()).map(l => l.match(/^ */)[0].length))
  const code = raw.split('\n').map(l => l.slice(indent)).join('\n')
  const svg = renderFigure(code, firstLine, `m${++n}`, report)
  return `<figure data-src="mermaid"${id ? ` id="${id}"` : ''}><div class="frame">${svg || ''}</div><figcaption>${caption || ''}</figcaption></figure>`
})

// ---- Other figures need a caption ----
for (const m of body.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/g)) {
  if (!m[1].includes('data-src="mermaid"') && !/<figcaption>[^<\s]/.test(m[2])) report.error(0, 'E201', 'A figure has no caption.', 'Add <figcaption>Text</figcaption> after the frame.')
}

// ---- Numbers: sections, figures, tables, and references ----
const sectionWord = meta.type === 'lesson' ? 'Lesson' : 'Section'
let sec = 0
body = body.replace(/<h2>(?!(Section|Lesson) \d+\.)/g, () => `<h2>${sectionWord} ${++sec}. `)
const ids = { fig: new Map(), tab: new Map() }
let fNo = 0, tNo = 0
body = body.replace(/<figure\b([^>]*)>([\s\S]*?)<figcaption>(?:Figure \d+\.\s*)?/g, (all, attrs, inner) => {
  fNo++
  const id = (attrs.match(/\bid="([^"]*)"/) || [])[1]
  if (id) { if (ids.fig.has(id)) report.error(0, 'E205', `Figure id "${id}" is used two times.`, 'Give each figure its own id.'); ids.fig.set(id, fNo) }
  return `<figure${attrs}>${inner}<figcaption>Figure ${fNo}. `
})
body = body.replace(/<div class="table-cap"([^>]*)>(?:Table \d+\.\s*)?/g, (all, attrs) => {
  tNo++
  const id = (attrs.match(/\bid="([^"]*)"/) || [])[1]
  if (id) { if (ids.tab.has(id)) report.error(0, 'E205', `Table id "${id}" is used two times.`, 'Give each table its own id.'); ids.tab.set(id, tNo) }
  return `<div class="table-cap"${attrs}>Table ${tNo}. `
})
// Table captions go under the table (and under its footnote), the same as figure captions.
body = body.replace(/(<div class="table-cap"[^>]*>[\s\S]*?<\/div>)\s*(<table\b[\s\S]*?<\/table>)(\s*<div class="foot">[\s\S]*?<\/div>)?/g,
  (all, cap, table, foot = '') => `${table}${foot}\n${cap}`)
body = body.replace(/\{\{(fig|tab):([\w-]+)\}\}/g, (all, kind, id) => {
  const no = ids[kind].get(id)
  if (!no) { report.error(lineOf(src.indexOf(all)), 'E204', `Reference ${all}: no ${kind === 'fig' ? 'figure' : 'table'} has id "${id}".`, 'Add id="' + id + '" to the figure or table, or fix the name.'); return all }
  return `${kind === 'fig' ? 'Figure' : 'Table'} ${no}`
})

// ---- Report ----
const errors = items.filter(i => i.level === 'error'), warns = items.filter(i => i.level === 'warn')
for (const i of [...errors, ...warns]) {
  console.log(`${name}:${i.line || '-'}  ${i.code}  ${i.msg}${i.fix ? `\n        Fix: ${i.fix}` : ''}`)
}
if (errors.length || (strict && warns.length)) {
  console.log(`\nNOT BUILT: ${errors.length} error(s), ${warns.length} warning(s). Fix the errors, then build again.`)
  process.exit(1)
}

// ---- Write ----
const esc = s => s.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;')
const header = `<div class="rh"><span>${esc(meta.domain)}</span><span>${TYPES[meta.type]}</span></div>
<h1><span>${esc(meta.title)}</span></h1>
<p class="q">Question: ${esc(meta.question)}</p>`
// Native select outside the page. All theme CSS is in the file, so a switch needs no reload.
const group = (label, names) => `<optgroup label="${label}">${Object.entries(names).map(([k, v]) => `<option value="${k}"${k === theme ? ' selected' : ''}>${v}</option>`).join('')}</optgroup>`
const picker = `<div class="theme-bar"><label>Theme<select onchange="document.documentElement.dataset.theme = this.value">${group('Light', THEME_NAMES.light)}${group('Dark', THEME_NAMES.dark)}</select></label></div>`
const footer = `<div class="rf"><span>${esc(meta.title)}</span><span>${esc(date)}</span></div>`
const fill = { THEME: theme, TITLE: esc(meta.title), THEME_CSS: asset('theme.css'), THEMES_CSS: asset('themes.css'), SVG2D_JS: asset('svg2d.js'), DEFS_SVG: asset('defs.svg'), THEME_PICKER: picker, HEADER: header, BODY: body.trim(), FOOTER: footer }
const html = asset('shell.html').replace(/\{\{([A-Z0-9_]+)\}\}/g, (all, k) => fill[k] ?? all)
outFile = resolve(outFile || join(dirname(inFile), basename(inFile).replace(/(\.src)?\.html?$/, '') + '.html'))
if (outFile === resolve(inFile)) { console.error('The output file must not be the source file. Use --out.'); process.exit(2) }
writeFileSync(outFile, html)
console.log(`BUILT ${outFile}\n  theme: ${theme} · ${fNo} figure(s) · ${tNo} table(s) · ${sec} section(s) · ${warns.length} warning(s)`)
