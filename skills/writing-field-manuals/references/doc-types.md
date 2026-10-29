# Document types

Pick the type from the question of the reader. Write the sections in this order. Write only the title in `<h2>`. The build adds "Section N." (or "Lesson N." for a lesson).

## Contents
- explainer: How does X work?
- lesson: Teach me X.
- decision: What must we do?
- comparison: A or B?
- procedure: How do I do X?
- incident: What happened?
- Length budgets

## explainer
Reader asks: "How does X work?" or "Why does X happen?"
1. Bottom line box (required)
2. The parts (what exists, one figure: `system`, `stack` or `entities`)
3. How it works (the main figure: `sequence`, `decision` or `states`)
4. Where it breaks (a Caution box or a table of failure cases)
5. Summary (optional Remember box)

## lesson
Reader asks: "Teach me X." Each lesson uses only ideas from the lessons before it.
1. Short intro paragraph and a Terms table (term, meaning)
2. Lesson 1 to n. Each lesson: text, one figure or listing, then a Remember box (required)
3. Last lesson: "Check What You Learned" with 3 to 5 `<details class="qa">` questions (required)
4. Summary box (a `.remember` box with head "Summary")

## decision
Reader asks: "What must we do?" (architecture decision record)
1. Bottom line box: the decision in one or two sentences (required)
2. Context: the problem and the limits
3. Options: one table, one row for each option (criteria in columns)
4. Decision: the selected option and why
5. Consequences: what becomes easier, what becomes harder, risks (table)
6. Work list: table with team, change and file

## comparison
Reader asks: "A or B?"
1. Bottom line box: the recommendation (required)
2. Criteria: what matters and why
3. Comparison: one table, A and B in columns
4. When to select each: two short lists, or a `decision` figure

## procedure
Reader asks: "How do I do X?"
1. Before you start: requirements as a bullet list
2. Steps: `<ol class="steps">` with one instruction in each step (required). Max 20 words for each step. Put a Warning or Caution box before the step that it applies to.
3. Check the result: how to make sure that it worked
4. If it fails: table with symptom, cause and fix

## incident
Reader asks: "What happened?"
1. Bottom line box: impact, cause and status (required)
2. Timeline: a `gantt` figure or a table with time and event
3. Cause: the chain of events (`sequence` or `decision` figure)
4. Fix: what we changed
5. Actions: table with action, owner and date

## Length budgets
| Item | Limit |
|---|---|
| Bottom line | 60 words |
| Sentence (description) | 25 words |
| Sentence (procedure step) | 20 words |
| Paragraph | 6 sentences |
| Figures | at least 1 for each 400 to 500 words |
| Section | approximately 300 words; split a longer section |

A short document is better. The user wants concise documents: cut every paragraph that does not answer the question of the reader.
