// Small SVG helpers for the rare custom 2D figure.
// Prefer Mermaid figures. Custom 2D drawing needs coordinates and a visual check.
const NS = 'http://www.w3.org/2000/svg', PAPER = 'var(--paper)', INK = 'var(--ink)'
function el(tag, a = {}, t) {
  const n = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(a)) if (v != null) n.setAttribute(k, v)
  if (t != null) n.textContent = t
  return n
}
// Set the coordinate space of <svg id="...">. Returns the svg element.
function fig(sel, w, h) { const s = document.querySelector(sel); s.setAttribute('viewBox', `0 0 ${w} ${h}`); return s }
// Text. o.a = anchor (start|middle|end), o.c = class (b, s, m), o.bg = paper behind the text
function T(s, x, y, str, o = {}) {
  const t = el('text', { x, y, 'text-anchor': o.a || 'middle', class: o.c || null }, str)
  s.appendChild(t)
  if (o.bg) { const b = t.getBBox(); s.insertBefore(el('rect', { x: b.x - 3, y: b.y - 1, width: b.width + 6, height: b.height + 2, fill: PAPER }), t) }
  return t
}
// Centered lines. Prefix: * bold, ~ small, ` mono
function lines(s, cx, cy, list) {
  const lh = 15, y0 = cy - (list.length - 1) * lh / 2 + 4
  list.forEach((l, i) => {
    let c = null
    if (l[0] === '*') { c = 'b'; l = l.slice(1) } else if (l[0] === '~') { c = 's'; l = l.slice(1) } else if (l[0] === '`') { c = 'm'; l = l.slice(1) }
    T(s, cx, y0 + i * lh, l, { c })
  })
}
// Box with centered lines. o.bold, o.dash
function B(s, x, y, w, h, list = [], o = {}) {
  s.appendChild(el('rect', { x, y, width: w, height: h, fill: PAPER, stroke: INK, 'stroke-width': o.bold ? 2.6 : 1.4, 'stroke-dasharray': o.dash ? '5 4' : null }))
  lines(s, x + w / 2, y + h / 2, list)
}
// Circle with a label (for numbered balloons). o.bold, o.dash, o.c
function C(s, cx, cy, r, label, o = {}) {
  s.appendChild(el('circle', { cx, cy, r, fill: PAPER, stroke: INK, 'stroke-width': o.bold ? 2.6 : 1.3, 'stroke-dasharray': o.dash ? '4 3' : null }))
  if (label != null) T(s, cx, cy + 4, label, { c: o.c || 'b' })
}
// Arrow. o.d = custom path, o.dash, o.both, o.noHead, o.t = label, o.tx/o.ty = label position
function A(s, x1, y1, x2, y2, o = {}) {
  s.appendChild(el('path', { d: o.d || `M${x1},${y1} L${x2},${y2}`, fill: 'none', stroke: INK, 'stroke-width': o.w || 1.4, 'stroke-dasharray': o.dash ? '6 4' : null, 'marker-end': o.noHead ? null : 'url(#ah)', 'marker-start': o.both ? 'url(#ah)' : null }))
  if (o.t) T(s, o.tx ?? (x1 + x2) / 2, o.ty ?? (y1 + y2) / 2 - 6, o.t, { c: o.c || null, bg: true, a: o.a })
}
