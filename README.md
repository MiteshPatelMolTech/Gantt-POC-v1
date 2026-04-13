# Dynamic Gantt Chart – Angular 16

Fully dynamic week-based Gantt chart. **Zero hardcoded fields. Zero hardcoded phases.**  
Everything is driven by two JSON textareas at runtime.

---

## Core Concept

The app has two JSON input panels:

### 1. Fase Definities (Phase Definitions)
Defines what phase types exist — any number, any name, any color.

```json
[
  { "key": "schet", "label": "Schetsontwerp",                     "color": "#A8D8F0" },
  { "key": "voor",  "label": "Voorlopig Ontwerp",                 "color": "#3EB0DC" },
  { "key": "def",   "label": "Definitief Ontwerp",                "color": "#1A6A9A" },
  { "key": "afr",   "label": "Afronding eng / Werkvoorbereiding", "color": "#0D3D5A" },
  { "key": "uitv",  "label": "Uitvoering",                        "color": "#4A9E4A" }
]
```

**Rules:**
- `key` — unique identifier used in project phases (no spaces)
- `label` — display name shown in the legend and bar tooltips
- `color` — any valid CSS color (`#hex`, `rgb(...)`, `hsl(...)`, named colors)
- Add as many phase types as needed — there is no limit
- Remove any phase types not needed — columns auto-adjust

---

### 2. Project Data
Defines projects — **any fields you want**. The column headers are auto-generated from the keys.

```json
[
  {
    "nrUitvoer":     "980065-0012",
    "nrEngineering": "251008",
    "projectId":     "D.26984",
    "tranche":       "TR1",
    "omschrijving":  "NV26 MHT TR01 HS OSS – Kloosterstraat PIMS",
    "marker":        "J",
    "_rowColor":     "#FAEEDA",
    "_phases": [
      { "phaseKey": "afr",  "startWeek": 10, "endWeek": 12 },
      { "phaseKey": "uitv", "startWeek": 13, "endWeek": 28 }
    ]
  }
]
```

**Regular fields** (any key, any value):
- All non-underscore keys become table columns automatically
- Column order matches the order they first appear across all rows
- Column width is auto-estimated from the key name length

**Reserved fields** (prefixed with `_`):
| Field | Required | Description |
|-------|----------|-------------|
| `_phases` | Yes | Array of phase segments for this row |
| `_rowColor` | No | CSS color for row background highlight |

**Phase segment inside `_phases`:**
| Field | Required | Description |
|-------|----------|-------------|
| `phaseKey` | Yes | Must match a `key` in the phases definition |
| `startWeek` | Yes | ISO week number where this bar starts |
| `endWeek` | Yes | ISO week number where this bar ends (inclusive) |

---

## Fully Dynamic — Examples

### Minimal (2 phases, 2 fields)
**Phases:**
```json
[
  { "key": "design", "label": "Design",      "color": "#60a5fa" },
  { "key": "build",  "label": "Development", "color": "#34d399" }
]
```
**Projects:**
```json
[
  {
    "name": "Login module",
    "team": "Frontend",
    "_phases": [
      { "phaseKey": "design", "startWeek": 1, "endWeek": 3 },
      { "phaseKey": "build",  "startWeek": 4, "endWeek": 10 }
    ]
  }
]
```

### Construction project (different field names, different phases)
**Phases:**
```json
[
  { "key": "ontwerp",  "label": "Ontwerp",      "color": "#93c5fd" },
  { "key": "aanvraag", "label": "Vergunning",   "color": "#fcd34d" },
  { "key": "bouw",     "label": "Bouw",         "color": "#f97316" },
  { "key": "oplevering","label":"Oplevering",   "color": "#22c55e" }
]
```
**Projects:**
```json
[
  {
    "object":       "Brug A12",
    "gemeente":     "Utrecht",
    "budget":       "€ 2.4M",
    "aannemer":     "BouwCo BV",
    "_rowColor":    "#f0fdf4",
    "_phases": [
      { "phaseKey": "ontwerp",   "startWeek": 1,  "endWeek": 8  },
      { "phaseKey": "aanvraag",  "startWeek": 9,  "endWeek": 16 },
      { "phaseKey": "bouw",      "startWeek": 20, "endWeek": 44 },
      { "phaseKey": "oplevering","startWeek": 45, "endWeek": 48 }
    ]
  }
]
```

### Software sprint planning
**Phases:**
```json
[
  { "key": "sprint", "label": "Sprint",   "color": "#8b5cf6" },
  { "key": "review", "label": "Review",   "color": "#ec4899" },
  { "key": "release","label": "Release",  "color": "#10b981" }
]
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI 16: `npm install -g @angular/cli@16`

### Run
```bash
npm install
ng serve
# → http://localhost:4200
```

### Build
```bash
ng build --configuration production
# → dist/gantt-dynamic/
```

---

## Architecture

```
src/app/gantt/
├── models/
│   └── gantt.model.ts              # All interfaces — PhaseDefinition, GanttProject, GanttConfig
│                                   # GanttProject uses [key: string]: any for dynamic fields
├── services/
│   ├── gantt-parser.service.ts     # Parses both JSON textareas → GanttConfig
│   ├── gantt-state.service.ts      # BehaviorSubject state: config$, year$, errors$
│   └── week-helper.service.ts      # ISO 8601 week calculations
└── components/
    ├── data-input/
    │   └── data-input.component.ts # The two JSON textareas + live validation
    ├── gantt-chart/
    │   └── gantt-chart.component.ts # Main container, wires everything
    ├── gantt-header/
    │   └── gantt-header.component.ts # Sticky header — dynamic left cols + week timeline
    ├── gantt-row/
    │   └── gantt-row.component.ts   # One row — dynamic data cells + phase bars
    └── gantt-toolbar/
        └── gantt-toolbar.component.ts # Year switcher + stats badge
```

### Data flow
```
[Fase textarea] ──┐
                  ├─► GanttParserService.parse() ──► GanttStateService (BehaviorSubject)
[Projects textarea]┘                                          │
                                                              ▼
                                                    GanttChartComponent
                                                    ├── GanttHeaderComponent (dynamic cols)
                                                    ├── GanttRowComponent × N  (dynamic cells + bars)
                                                    └── Legend (dynamic from phase defs)
```

### Key design decisions
- `GanttProject` uses `[key: string]: any` — all user-defined fields stored as a flat map
- Column keys are discovered by scanning all project objects — no schema required
- Phase colors are looked up at render time from `PhaseDefinition[]` — change a color and re-generate instantly
- `ChangeDetectionStrategy.OnPush` throughout — efficient for large datasets
- No third-party chart or grid libraries — pure Angular + CSS

---

## Customise Column Widths

Column widths are auto-estimated. To override, modify `GanttParserService.parseProjects()`:

```typescript
// Current: auto-estimate from key name length
columnWidths[k] = Math.max(80, Math.min(300, k.length * 9 + 40));

// Override specific columns:
const overrides: Record<string, number> = {
  omschrijving: 280,
  tranche: 60,
  marker: 30,
};
columnWidths[k] = overrides[k] ?? Math.max(80, k.length * 9 + 40);
```

Or expose it as a JSON option in the textarea by adding a `_colWidths` top-level property.
