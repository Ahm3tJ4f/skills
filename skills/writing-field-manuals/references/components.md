# Components

Copy these snippets exactly. Do not add `style` attributes or new CSS classes. The build gives numbers to sections, figures and tables.

## Contents
- Front matter
- Text: paragraph, lists, steps
- Boxes: Bottom line, Remember, Note, Caution, Warning
- Figures: Mermaid, code listing, panels, custom drawing
- Tables, index column, table footnote
- Self-check questions
- References to figures and tables
- Sources

## Front matter
```
---
title: The N+1 Query Problem
domain: Backend performance
type: lesson
question: Why does a page with 50 rows send 51 database queries?
theme: microfilm
date: October 2026
---
```
`type`: explainer, lesson, decision, comparison, procedure, incident. `theme` is required: ask the user first (SKILL.md, Step 0). `date` is optional (default: this month). The build writes the running head, the title, the question and the footer. Do not write `<h1>`, `.rh` or `.rf`.

## Text
```html
<h2>The Fixes</h2>                         <!-- build adds "Section 3." -->
<h3>Fix 1: JOIN</h3>                       <!-- bold subhead, normal case -->
<p>One idea in each sentence. All text is full width: one paragraph is one row.</p>
<ul class="dot"><li>Item</li></ul>
<ol class="steps"><li>Open the file.</li><li>Delete the line.</li></ol>
```

## Boxes
Write each box head in normal case, not in capitals: "Bottom line", not "BOTTOM LINE". The head is bold. If a head is in capitals, the build changes it to normal case. All boxes have the same double border.
```html
<div class="bluf"><div class="head">Bottom line</div>
  <p>The main point and the action, max 60 words.</p>
</div>

<div class="remember"><div class="head">Remember</div>
  <p>One sentence that the reader must keep.</p>
</div>

<p class="note">Information only. A note never gives an instruction.</p>

<div class="caution"><div class="head">Caution</div>
  <p>Instruction first. Then the risk: bugs, data errors or downtime.</p>
</div>

<div class="warning"><div class="head">Warning</div>
  <p>Instruction first. Then the risk: security or data loss.</p>
</div>
```

## Figures
Mermaid (the default for all 2D figures, see diagrams.md):
```html
<figure id="login" data-mermaid caption="Login with a BFF">
  sequenceDiagram
    participant Browser
    participant BFF
    Browser->>BFF: GET /oauth2/authorization/keycloak
</figure>
```
Code listing (bold marks the important lines; max about 85 characters for each line):
```html
<figure id="loop"><div class="frame"><pre class="listing">for (Agreement a : agreements) {
<b>    partnerDao.findById(a.partnerId());   // 1 query in each loop</b>
}</pre></div><figcaption>Code with the N+1 problem</figcaption></figure>
```
Escape `<` as `&lt;` and `>` as `&gt;` inside `<pre>`.

Two panels side by side (for "wrong / correct" or "before / after"):
```html
<figure id="cmp"><div class="frame"><div class="panels">
  <div><pre class="listing">...</pre><div class="panel-label">Wrong: index as key</div></div>
  <div><pre class="listing">...</pre><div class="panel-label">Correct: stable ID</div></div>
</div></div><figcaption>Index key and ID key</figcaption></figure>
```

## Tables
```html
<div class="table-cap" id="fixes">Fixes and their cost</div>
<table>
  <thead><tr><th>Fix</th><th>Queries</th></tr></thead>
  <tbody>
    <tr><td>JOIN</td><td class="c">1</td></tr>
  </tbody>
</table>
<div class="foot">*Footnote for a value marked with *.</div>
```
Cell classes: `c` center, `r` right (numbers), `idx` parts-list index. `<table class="result">` uses the mono font (query results). Max 6 columns.

Numbered list of parts: first column "Index No." with `<td class="idx">1</td>`.

## Self-check questions (lesson)
```html
<details class="qa"><summary>1. A page shows 20 rows. How many queries?</summary>
  <p>41. One for the list and 20 for each relation.</p></details>
```

## References
Write `{{fig:login}}` or `{{tab:fixes}}` in the text. The build replaces them with "Figure 2" or "Table 1". A wrong id stops the build. Put the reference in the text before the figure.

## Sources
```html
<h3>Sources</h3>
<p class="src"><a href="https://www.rfc-editor.org/rfc/rfc10017.html">RFC 10017</a> · <a href="...">Name</a></p>
```
