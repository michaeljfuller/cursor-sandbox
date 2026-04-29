# Game of Life
## Initial

Uses the rules from https://github.com/PatrickJS/awesome-cursorrules/blob/main/rules/javascript-typescript-code-quality-cursorrules-pro/.cursorrules

### Prompt
```
Create a simple implementation of conway's game of life in a 100 x 100 grid.
You may use a lightweight framework of your choice.
Please place the contents inside @game-of-life/pro.
```

### .cursorrules
None

### Cost

| Tokens |   $   |
| ------ | ----- |
| 153.7K | $0.16 |

### Feedback
`RequestID: c201174b-4a52-4339-abbd-c9700f770d92`

Creating game-of-life/pro with Vite, TypeScript, and Preact — reusing the proven life.ts logic and a canvas-based UI.

Scaffolding the Preact + Vite project and implementing the app component.

Here’s what was added under game-of-life/pro:

**Stack**
- Vite 6 + TypeScript + Preact (~4 KB runtime) for a small UI layer
- Canvas at 600×600 px drawing a 100×100 grid (same approach as initial, avoids 10k DOM nodes)

**Behavior**
- Toroidal board (edges wrap) in src/life.ts — same rules as standard Conway (2–3 neighbors to survive, 3 to birth)
- Run / Pause, Step, Randomize, Clear, speed slider
- Click / drag on the canvas to toggle cells (pauses while editing)

**Layout**
```
game-of-life/pro/
  package.json
  vite.config.ts
  tsconfig.json
  index.html
  src/main.tsx      # Preact mount
  src/app.tsx       # UI + canvas + loop
  src/life.ts       # Grid + step()
  src/style.css
  src/vite-env.d.ts
```
