# Diagrams (Mermaid, rendered by Pele)

Select the figure from the question of the reader, not from the look. Write Mermaid text in `<figure data-mermaid caption="...">`. The build renders it with Pele and applies the theme.

## Contents
- Question to figure
- Rules
- Examples: sequence, decision, system, states, entities, timeline, chart, bits, git, stack
- Known limits

## Question to figure
| Question of the reader | Mermaid type | Known method |
|---|---|---|
| What are the parts? Which part talks to which part? | `flowchart TB` with `subgraph` | C4 container view |
| In which sequence do the messages go? | `sequenceDiagram` | UML sequence |
| Which path does the logic take? | `flowchart TD` with `{decision}` nodes | Flowchart |
| Which states can it have? | `stateDiagram-v2` | UML state machine |
| What is the shape of the data? | `erDiagram` (add `direction LR` for 3 tables or fewer) | ER diagram |
| How long does each part take? | `gantt` with `dateFormat x` | Trace waterfall |
| How does a number change? | `xychart` | Line or bar chart |
| How is it kept in memory or on the wire? | `packet` | RFC packet diagram |
| How did the branches change? | `gitGraph` | Git graph |
| Which part is on top of which part? | `block` with `columns 1` | Layer diagram |
| What causes the problem? | `ishikawa` | Fishbone diagram |
| Who does what, in which order? | `swimlane-beta` | Swimlane |
| Which parts exist inside which part? | `flowchart TB` with nested `subgraph` | Containment view |

## Rules (the build checks these)
- No `style`, `classDef`, `linkStyle`, `click`, `%%{init}%%`, Mermaid front matter, or C4 `Update...Style`. The theme sets all colors.
- Emphasis: only `:::focus` (bold border) or `:::optional` (dashed border).
- Sequence: declare each lane with `participant` (2 to 5 lanes). Use `participant DB@{ "type": "database" }` for a database. Use `autonumber` for numbered steps.
- Labels: max 48 characters in a node, 60 in a message. Put details in the text.
- Width: the frame is 650 px. Prefer `flowchart TB` or `TD`. Use `LR` only for 4 nodes or fewer.
- Edge labels for decisions: `YES` and `NO` in capitals.
- Solid arrow = request or call. Dashed arrow (`-->>`, `-.->`) = response or optional path.
- Do not put `(` `)` inside `[...]` or `{...}` without quotes: write `b{"Check (cache)?"}`.

## Examples
Sequence:
```
sequenceDiagram
  autonumber
  participant API as ERP-Backend
  participant DB@{ "type": "database" }
  API->>DB: SELECT id, partner_id FROM agreement
  DB-->>API: 50 agreements
  loop for each agreement: 50 times
    API->>DB: SELECT * FROM partner WHERE id = ?
  end
  Note over API,DB: total: 51 round trips
```
Decision:
```
flowchart TD
  a[A list needs data from a second table] --> b{One related row for each row?}
  b -- YES --> c[JOIN: one query]:::focus
  b -- NO --> d[Second query with IN]
```
System (C4-like):
```
flowchart TB
  subgraph erp[app.example.com]
    proxy[oauth2-proxy] -- request + token --> api[ERP-Backend]
  end
  spa[React SPA] -- cookie --> proxy
  proxy -.-> kc[(Keycloak)]
```
States:
```
stateDiagram-v2
  [*] --> LoggedIn: login
  LoggedIn --> Expired: 5 minutes
  Expired --> LoggedIn: refresh OK
  Expired --> [*]: refresh fails
```
Entities:
```
erDiagram
  direction LR
  PARTNER ||--o{ AGREEMENT : signs
  AGREEMENT {
    number id PK
    number partner_id FK
  }
```
Timeline (milliseconds):
```
gantt
  dateFormat x
  axisFormat %-S.%L ms
  section Fixed cost
  network        :a, 0, 1000ms
  section Real work
  run the query  :crit, b, 1000, 300ms
```
Chart (series 1 solid, 2 dashed, 3 dotted; name them in the caption):
```
xychart
  x-axis "rows on the page" [5, 100, 200, 300, 400, 500]
  y-axis "time (ms)" 0 --> 2600
  line [30, 505, 1005, 1505, 2005, 2505]
  line [8, 10, 12, 15, 17, 20]
```
Bits:
```
packet
  0-0: "S"
  1-11: "exponent"
  12-63: "fraction"
```
Git:
```
gitGraph
  commit id: "A"
  branch feature
  commit id: "D"
  checkout main
  commit id: "C"
  merge feature id: "M"
```

## Known limits
- `xychart` has no text marks on points and no legend. Name the series in the caption.
- A 1-bit packet field has no space for a long label. Use one letter.
- C4 diagrams (`C4Container`) need long text. Prefer `flowchart TB` with subgraphs.
- If no type fits, use a table or a code listing. Custom 2D drawing with `svg2d.js` is the last option: it needs coordinates and a visual check.
