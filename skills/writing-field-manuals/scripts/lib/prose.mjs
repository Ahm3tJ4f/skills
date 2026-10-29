// Checks for the text: STE words, sentence length, dashes, and document structure.

// Hide code, Mermaid sources and scripts from the prose checks. Keep the line count.
export function maskNonProse(src) {
  const blank = m => m.replace(/[^\n]/g, ' ')
  return src
    .replace(/<script\b[\s\S]*?<\/script>/g, blank)
    .replace(/<pre\b[\s\S]*?<\/pre>/g, blank)
    .replace(/<figure\b[^>]*data-mermaid[\s\S]*?<\/figure>/g, blank)
    .replace(/<code\b[\s\S]*?<\/code>/g, blank)
}

const lineOf = (src, index) => src.slice(0, index).split('\n').length
const strip = html => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim()

// Non-approved ASD-STE100 modals and Latin abbreviations.
const WORDS = [
  [/\bshould\b/gi, 'Use "must" for a requirement, or write an instruction.'],
  [/\b(may|might|could)\b/gi, 'Use "can" for a possibility.'],
  [/\bwould\b/gi, 'Use "can", or the simple present tense.'],
  [/\bshall\b/gi, 'Use "must".'],
  [/\b(e\.g\.|i\.e\.|etc\.)/gi, 'Use "for example", "that is", or delete it.'],
]

export function checkProse(src, report) {
  // Dashes are errors everywhere, also in code.
  for (const m of src.matchAll(/[\u2014\u2013]/g)) {
    report.error(lineOf(src, m.index), 'E401', 'Em dash or en dash found.', 'Use a comma, a colon or a period. For a range, write "to".')
  }
  const prose = maskNonProse(src)
  for (const [re, fix] of WORDS) {
    for (const m of prose.matchAll(re)) report.warn(lineOf(prose, m.index), 'W402', `"${m[0]}" is not an approved STE word.`, fix)
  }
  // Sentence length: max 25 words (descriptive text), max 20 words in a procedure step.
  for (const m of prose.matchAll(/<(p|li|td|summary)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
    const inSteps = /<ol class="steps"/.test(prose.slice(Math.max(0, m.index - 2000), m.index)) && m[1] === 'li'
    const limit = inSteps ? 20 : 25
    for (const sentence of strip(m[2]).split(/(?<=[.!?:])\s+(?=[A-Z0-9"({])/)) {
      const words = sentence.split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w))
      if (words.length > limit) {
        report.warn(lineOf(prose, m.index), 'W401', `Sentence has ${words.length} words (max ${limit}): "${words.slice(0, 7).join(' ')} ..."`, 'Split it into two sentences. One idea in each sentence.')
      }
    }
  }
}

const REQUIRED = {
  explainer: [['bluf', 'E101', 'A Bottom line box is required.', 'Add <div class="bluf"><div class="head">Bottom line</div><p>...</p></div> before the first section.']],
  decision: [['bluf', 'E101', 'A Bottom line box is required.', 'Put the decision in a bluf box before the first section.']],
  comparison: [['bluf', 'E101', 'A Bottom line box is required.', 'Put the recommendation in a bluf box.']],
  incident: [['bluf', 'E101', 'A Bottom line box is required.', 'Put the impact and the cause in a bluf box.']],
  procedure: [['steps', 'E101', 'A numbered procedure is required.', 'Add <ol class="steps"> with one instruction in each step.']],
  lesson: [['remember', 'W102', 'Lessons must end with a Remember box.', 'Add <div class="remember"> at the end of each lesson.'],
           ['qa', 'W102', 'A lesson must end with self-check questions.', 'Add <details class="qa"> questions in the last section.']],
}

export function checkStructure(body, meta, report) {
  for (const [cls, code, msg, fix] of REQUIRED[meta.type] || []) {
    if (!new RegExp(`class="${cls}"`).test(body)) (code[0] === 'E' ? report.error : report.warn)(0, code, msg, fix)
  }
  if (!/<h2\b/.test(body)) report.error(0, 'E102', 'The document has no sections.', 'Add <h2>Title</h2> for each section. The build adds the numbers.')
  const bluf = body.match(/class="bluf"[\s\S]*?<\/div>\s*<p>([\s\S]*?)<\/p>/)
  if (bluf) {
    const n = strip(bluf[1]).split(/\s+/).length
    if (n > 60) report.warn(lineOf(body, bluf.index), 'W103', `Bottom line has ${n} words (max 60).`, 'Keep only the main point and the action.')
  }
  const words = strip(maskNonProse(body)).split(/\s+/).length
  const figures = (body.match(/<figure\b/g) || []).length
  if (words > 500 && words / Math.max(figures, 1) > 500) {
    report.warn(0, 'W104', `${words} words but only ${figures} figure(s).`, 'Add a figure for each 400 to 500 words. Pick the figure from the reader question (references/diagrams.md).')
  }
}
