# DESIGN.md — OMO Skill Atlas Design System

Single source of truth for tokens. Every color/size/space in `index.html` traces here.
(frontend-skill Phase 0 Design System Gate)

## 1. Color tokens (`:root`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f5f6f8` | page background |
| `--surface` | `#ffffff` | cards, panels, drawer |
| `--ink` | `#15181f` | primary text |
| `--ink2` | `#3a4150` | body text |
| `--mut` | `#586273` | muted text (**WCAG AA ≥4.5:1 on white**) |
| `--line` | `#e6e9ee` | borders |
| `--line2` | `#f0f2f5` | hairline dividers |

### Axis (semantic, ADHD color-coding)
| Axis | Token | Hex |
|---|---|---|
| 코드 구조 | `--blue` | `#3b82f6` |
| 런타임 디버깅 | `--red` | `#ef4444` |
| 프론트엔드 | `--purple` | `#a855f7` |
| 작업 루프 | `--amber` | `#f59e0b` |
| LazyCodex 운영 | `--green` | `#22c55e` |
| 확장 탐색 | `--orange` | `#f97316` |

Brand gradient: `#6366f1 → #a855f7 → #ec4899` (logo, favicon).

## 2. Type scale
- 26px/900 stat numbers · 23px/800 drawer title · 17px/800 panel h3 · 14–15px/800 nav·card title
- 13.5px body · 11.5px meta · 10–11px mono labels. Mono = `ui-monospace`.

## 3. Spacing
Base unit **4px**. Radii: 8 (chips) / 11–14 (cards) / 18 (panels) / 999 (pills).
Shadow: `--shadow` (rest), `--shadow-lg` (hover lift).

## 4. Motion
GPU-composited only (`transform`, `opacity`, `filter`). Hover lift `translateY(-2px)`; drawer slide `cubic-bezier(.4,0,.2,1)`.

## 5. Components
- **card** — axis-colored left border, hover lift, opens drawer.
- **chip** — filter pill; active = filled axis color.
- **drawer** — right slide-over, `role=dialog` + focus trap + return-focus.
- **cmdk** — ⌘K command palette (skills + views), `role=dialog`/`listbox`.
- **badge** — `must` (red) / `warn` (amber) / sync (green).
- **axdot** — colored category dot (replaces emoji icons).

## 6. A11y baseline (enforced)
- axe wcag2a/aa: **0 violations**. Semantic `h1`, aria-labels, visible `:focus-visible` rings, keyboard nav (`/` search, ⌘K palette, Esc).
- No emoji as functional icons (axis = `.axdot`, drawer = dot).

## 7. Roadmap
- Dark mode: flip `:root` tokens under `[data-theme="dark"]` + dark-scoped overrides for hardcoded light surfaces; re-audit contrast in dark before ship.
- Replace remaining decorative heading emojis with inline Lucide SVG.
