# Writing rules (ASD-STE100, short form)

All text uses ASD-STE100 Simplified Technical English. For the full rules, load the `asd-ste100` skill (`/skill:asd-ste100`) and use its Rewrite branch. This file is the short form for this document style. The build checks the rules marked (checked).

## Words
- One word, one meaning. Pick one name for each thing and keep it. Do not change "access token" to "token" or "JWT" later.
- Modals: use "can" (possibility) and "must" (requirement). Do not use should, may, might, would, shall, could. (checked)
- Approved verbs: use, get, send, make, show, keep, find, do, set, add, remove, start, stop, examine, make sure. Not: utilize, leverage, retrieve, fetch (as a plain verb), ensure, verify, check (as a verb).
- No "e.g.", "i.e.", "etc." (checked) Write "for example", "that is".
- No em dash or en dash anywhere. (checked) Use a comma, a colon, a period, or "to" for a range.
- Technical names stay as they are: `refresh_token`, `ERP-Backend`, `FETCH FIRST 50 ROWS ONLY`.

## Sentences
- Max 25 words in a description, max 20 words in a procedure step. (checked)
- One idea in each sentence. Split "A does X and then B does Y" into two sentences.
- Active voice: "Keycloak sends the code", not "the code is sent".
- Instructions use the imperative: "Copy the file." Put the condition first: "If the build fails, read the error."
- Do not omit words: write "the" and "a". Write "If you do not copy them", not "If not".
- Max 6 sentences in a paragraph. One topic in each paragraph.

## Notes, cautions, warnings
- Note: information only. No instruction.
- Caution: risk of bugs, wrong data or downtime. Start with the instruction, then the risk.
- Warning: risk to security or data loss. Same structure.

## Content
- Answer the question of the reader in the Bottom line. Then explain.
- Use concrete values from the sources: real names, real numbers, real file paths. Mark invented values with "example" or "(example values)" in the caption.
- Use examples from the project of the user when the sources include them (for example the user's repository).
- Each figure must have a sentence in the text that refers to it (`{{fig:id}}`) before the figure.
- Concise first. Do not explain what the reader did not ask. Do not repeat the same point in text, figure and table.

## Before and after
| Rule | Before | After |
|---|---|---|
| Modal | The token should be refreshed. | The BFF gets a new token. |
| Passive | The code is sent by Keycloak. | Keycloak sends the code. |
| One idea | It reads the tokens and sends them out. | It reads the tokens. Then it sends them out. |
| Fragment | Session on. CSRF on. | Enable the session. Enable CSRF protection. |
| Condition first | Go to /login on 401. | If the API sends 401, go to /login. |
