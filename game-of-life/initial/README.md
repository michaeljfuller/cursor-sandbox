# Game of Life
## Initial

Uses no cursor rules.

### Prompt
```
Create a simple implementation of conway's game of life in a 100 x 100 grid.
You may use a lightweight framework of your choice.
Please place the contents inside @game-of-life/initial.
```

### .cursorrules
None

### Cost

| Tokens |   $   |
| ------ | ----- |
|  97.5K | $0.08 |

### Feedback
`RequestID: 9eeb22cb-9b0d-406a-a7fe-4dc5e15107d6`

Exploring the workspace and creating a Conway's Game of Life implementation in game-of-life/initial.

Creating a Vite + TypeScript project in game-of-life/initial: lightweight tooling, canvas rendering for a smooth 100×100 grid, and classic Conway rules.

Initializing lastTick so the simulation doesn't burst ticks on the first frame.

Here’s what was added under `game-of-life/initial`:

**Stack**
Vite 6 + TypeScript — small footprint, fast dev server, no UI framework (the heavy work is canvas + Uint8Array).

**Behavior**
- 100×100 cells (SIZE in src/life.ts).
- Toroidal grid (edges wrap) so gliders and other patterns can cross sides.
- Double-buffered step(): read from one Uint8Array, write the next generation to the other, then swap.
- Canvas at 600×600 with crisp pixel scaling for all 10,000 cells.
- Controls: Run/Pause, single Step, Randomize, Clear, and a Speed slider (simulation rate).
- Paint: click or drag on the canvas to set cells (auto-pauses while editing).
