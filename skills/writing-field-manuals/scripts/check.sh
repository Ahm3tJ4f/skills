#!/bin/bash
# Render checks in a headless browser: JS errors, text outside its figure, wide figures, wide code.
# Usage: check.sh <doc.html> [<screenshot-dir>]
# With a screenshot dir, it saves one screenshot for each figure (fig-01.png, ...) to examine by eye.
# Needs the agent-browser CLI. Exit code: 0 = no problems, 1 = problems, 2 = cannot run.
set -u
DOC=${1:-}; SHOTS=${2:-}
if [ -z "$DOC" ] || [ ! -f "$DOC" ]; then echo "Usage: check.sh <doc.html> [<screenshot-dir>]"; exit 2; fi
if ! command -v agent-browser >/dev/null 2>&1; then echo "agent-browser is not installed. Skip the render check and examine the page by eye."; exit 2; fi
ABS=$(cd "$(dirname "$DOC")" && pwd)/$(basename "$DOC")

agent-browser open "file://$ABS" >/dev/null 2>&1
agent-browser set viewport 1000 900 >/dev/null 2>&1
ERRS=$(agent-browser errors 2>&1 | grep -v -i "no errors" | head -5)

# getBoundingClientRect includes transforms, so groups moved by center() are measured correctly.
LAYOUT=$(agent-browser eval "(() => {
  const out = [];
  document.querySelectorAll('figure').forEach((f, i) => {
    const n = 'Figure ' + (i + 1);
    const frame = f.querySelector('.frame'); if (!frame) return;
    const fr = frame.getBoundingClientRect();
    f.querySelectorAll('svg').forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.width > fr.width + 1) out.push(n + ': drawing is wider than its frame');
      s.querySelectorAll('text').forEach(t => {
        const b = t.getBoundingClientRect();
        if (b.width && (b.left < r.left - 1 || b.right > r.right + 1 || b.top < r.top - 1 || b.bottom > r.bottom + 1))
          out.push(n + ': text outside the drawing: \"' + t.textContent.trim().slice(0, 30) + '\"');
      });
    });
  });
  document.querySelectorAll('pre.listing').forEach(p => {
    if (p.scrollWidth > p.clientWidth + 1) {
      const cap = p.closest('figure')?.querySelector('figcaption')?.textContent || 'code listing';
      out.push(cap.split('.').slice(0, 2).join('.') + ': code is ' + (p.scrollWidth - p.clientWidth) + ' px too wide; break the longest line');
    }
  });
  return out.join('\n') || 'ok';
})()" 2>&1 | tail -1 | sed -e 's/^"//' -e 's/"$//' -e 's/\\n/\n/g' -e 's/\\"/"/g')

if [ -n "$SHOTS" ]; then
  mkdir -p "$SHOTS"
  COUNT=$(agent-browser eval "document.querySelectorAll('figure').length" 2>&1 | tail -1 | tr -dc '0-9')
  for ((i = 0; i < ${COUNT:-0}; i++)); do
    agent-browser eval "document.querySelectorAll('figure')[$i].scrollIntoView({block:'start'}); window.scrollBy(0,-12); 1" >/dev/null 2>&1
    agent-browser screenshot "$SHOTS/fig-$(printf '%02d' $((i + 1))).png" >/dev/null 2>&1
  done
  echo "Screenshots: $SHOTS (${COUNT:-0} figures). Examine each one for overlaps and crossed lines."
fi
agent-browser close >/dev/null 2>&1

STATUS=0
if [ -n "$ERRS" ]; then echo "JS errors:"; echo "$ERRS"; STATUS=1; fi
if [ "$LAYOUT" != "ok" ]; then echo "Layout problems:"; echo "$LAYOUT"; STATUS=1; fi
[ $STATUS -eq 0 ] && echo "CHECK OK: no JS errors, all text inside its figure, no wide figures or code."
exit $STATUS
