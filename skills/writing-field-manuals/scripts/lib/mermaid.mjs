// Lint Mermaid figure sources, then render them to SVG with Pele (vendored, MIT).
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const { render, parse, detectType, PeleError } = await import(pathToFileURL(join(here, '..', 'vendor', 'pele.js')).href)

// The frame of a figure is 650 px wide. The author never sets these options.
export const FRAME_WIDTH = 650
const OPTIONS = {
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontFamilyMono: '"Courier New", Courier, monospace',
  fontSize: 13,
  maxWidth: FRAME_WIDTH,
  autoDirection: false, // the reader gets the direction that the author wrote
  links: false,
  images: false,
  config: { flowchart: { curve: 'step' }, packet: { bitWidth: 10 } },
}

// Style must come from the theme, not from the diagram source.
const FORBIDDEN = [
  [/^\s*(style|classDef|linkStyle)\b/, 'Inline styles are not permitted.', 'Delete the line. Use :::focus or :::optional for emphasis.'],
  [/^\s*click\b/, 'Links and callbacks are not permitted.', 'Delete the line. Put links in the text.'],
  [/%%\{/, 'Init directives are not permitted.', 'Delete the directive. The build sets layout and theme.'],
  [/\b(UpdateRelStyle|UpdateElementStyle|UpdateLayoutConfig)\b/, 'C4 style and offset commands are not permitted.', 'Delete the line. The layout engine places the labels.'],
  [/themeVariables|\btheme\s*:/, 'Theme settings are not permitted.', 'Delete them. The document theme sets all colors.'],
]
const CLASSES = new Set(['focus', 'optional'])

const lev = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

// Returns the SVG string, or null when an error stops the render.
// line0 = file line of the first source line.
export function renderFigure(src, line0, id, report) {
  const lines = src.split('\n')
  const at = i => line0 + i
  const type = detectType(src)
  if (!type) {
    report.error(at(0), 'E300', `Unknown diagram type: "${lines[0].trim().slice(0, 40)}".`, 'Start with a Mermaid type, for example sequenceDiagram, flowchart TD, stateDiagram-v2, erDiagram, gantt, xychart.')
    return null
  }
  if (/^\s*---\s*$/.test(lines[0])) report.error(at(0), 'E301', 'Mermaid front matter is not permitted.', 'Delete the --- block. Put the title in the caption attribute.')
  lines.forEach((l, i) => {
    for (const [re, msg, fix] of FORBIDDEN) if (re.test(l)) report.error(at(i), 'E301', msg, fix)
    for (const m of l.matchAll(/:::(\w+)/g)) if (!CLASSES.has(m[1])) report.error(at(i), 'E302', `Class "${m[1]}" is not permitted.`, 'Use :::focus (bold border) or :::optional (dashed border).')
    const cls = l.match(/^\s*class\s+[\w,\s]+\s+(\w+)\s*$/)
    if (cls && !CLASSES.has(cls[1])) report.error(at(i), 'E302', `Class "${cls[1]}" is not permitted.`, 'Use focus or optional.')
  })

  let model
  try { model = parse(src) } catch (e) {
    if (!(e instanceof PeleError)) throw e
    const where = e.line ? at(e.line - 1) : at(0)
    report.error(where, 'E300', `Mermaid ${e.code} error: ${String(e.message).split('\n')[0]}`, e.snippet ? 'Fix the source here:\n' + e.snippet.replace(/^/gm, '        ') : 'Check the Mermaid syntax.')
    return null
  }

  if (model.type === 'sequence') {
    const declared = new Map()
    lines.forEach((l, i) => { const m = l.match(/^\s*(?:participant|actor)\s+([^\s@]+)/); if (m) declared.set(m[1], i) })
    if (declared.size) {
      for (const name of model.actors.keys()) {
        if (declared.has(name)) continue
        const best = [...declared.keys()].sort((a, b) => lev(name, a) - lev(name, b))[0]
        const i = Math.max(0, lines.findIndex(l => l.includes(name)))
        report.error(at(i), 'E303', `Lane "${name}" is not declared.`, best && lev(name, best) <= 3 ? `Did you mean "${best}"?` : `Add "participant ${name}" at the top.`)
      }
    }
    if (model.actors.size > 5) report.warn(at(0), 'W312', `${model.actors.size} lanes (max 5).`, 'Merge lanes, or split the figure.')
    const msgs = model.messages.filter(m => typeof m.message === 'string' && m.message.length > 60)
    for (const m of msgs) report.warn(at(Math.max(0, lines.findIndex(l => l.includes(m.message.slice(0, 20))))), 'W311', `Label has ${m.message.length} characters (max 60): "${m.message.slice(0, 30)}..."`, 'Shorten the label. Put details in the text.')
  } else {
    lines.forEach((l, i) => {
      for (const m of l.matchAll(/[\[{(]"?([^\]})"]{49,})"?[\]})]/g)) report.warn(at(i), 'W311', `Label has ${m[1].length} characters (max 48).`, 'Shorten the label.')
    })
  }

  let out
  try { out = render(src, { ...OPTIONS, idPrefix: id }) } catch (e) {
    if (!(e instanceof PeleError)) throw e
    report.error(e.line ? at(e.line - 1) : at(0), 'E300', `Mermaid ${e.code} error: ${String(e.message).split('\n')[0]}`, 'Check the Mermaid syntax.')
    return null
  }
  if (out.width > FRAME_WIDTH + 1) {
    report.warn(at(0), 'W310', `Figure is ${Math.round(out.width)} px wide. The frame is ${FRAME_WIDTH} px, so the figure shrinks.`, /flowchart\s+(LR|RL)|graph\s+(LR|RL)/.test(src) ? 'Use "flowchart TB", or shorter labels.' : 'Use shorter labels, or split the figure.')
  }
  return out.svg
}
