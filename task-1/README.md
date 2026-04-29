# Task 1
See how a `.cursorrules` file affects output.

## AI comparison

> There are two game-of-life apps. One in @task-1/game-of-life/initial and one in @task-1/game-of-life/senior. Please compare the two for code quality, maintainablility and any other facets that make a quality app.

### Architecture and separation of concerns
**Initial** splits the simulation from the UI: life.ts exports SIZE, Grid, createGrid, randomize, clearGrid, and step. That makes the rules testable in isolation and keeps main.ts focused on canvas, input, and the game loop.

**Senior** keeps everything in main.js (grid helpers, neighbor count, step, drawing, events). It is easier to read as one file at ~200 lines, but any change to rules or testing requires editing the same module as the DOM code.

### Type safety and tooling
**Initial** uses TypeScript with strict, noUnusedLocals, and noUnusedParameters, plus npm run build runs tsc && vite build, so types are enforced in CI.

**Senior** is untyped JavaScript. JSDoc on createEmptyGrid, randomizeGrid, etc. helps humans, but there is no compile-time checking. getElementById results are used without null checks (fine if the HTML never changes, brittle if it does).

### Simulation and rendering
Both use double buffering and the same Conway rules on a toroidal grid; the core math is equivalent.

**Initial** redraws every cell every frame (full fill per cell). Simple and predictable.

**Senior** clears the canvas once, then only draws live cells. That is a reasonable optimization when the board is sparse. It also uses getContext("2d", { alpha: false }), which can help the compositor a bit.

### Game loop and UX
**Initial** uses a single requestAnimationFrame loop and advances generations when performance.now() exceeds intervalMs derived from a speed slider. Speed is user-controlled; simulation starts running on load.

**Senior** advances one generation per animation frame while “running” (so speed is effectively capped by display refresh) and has no speed control. It starts paused. Those are product choices, not strictly “quality,” but initial offers more control; senior is simpler and predictable at “max speed.”

### Markup and styling
**Initial** injects the whole UI with innerHTML in main.ts. That couples structure to script and makes the page less inspectable without JS. CSS is pulled in via import "./style.css" (Vite-friendly).

**Senior** declares layout in index.html (header, main, static buttons). That is clearer for structure, styling, and accessibility tweaks without touching logic. CSS is linked from HTML.

### Accessibility
**Senior** sets aria-pressed on the run/pause button and updates it with state changes—a solid pattern for a toggle.

**Initial** uses a plain label (“Pause” / “Run”) without aria-pressed.

Both give the canvas an aria-label.

### Input handling
**Initial** uses e.buttons === 1 on mousemove so dragging only continues while the primary button is down—correct for painting.

**Senior** paints on every mousemove while painting !== null without checking e.buttons. Usually fine because mouseup clears state, but edge cases (e.g. focus/button state quirks) are slightly less guarded.

**Initial** maps pointer to cell and returns null outside the canvas—dragging outside does nothing for that event.

**Senior** clamps coordinates to the grid, so the pointer can still map to an edge cell when the cursor leaves the canvas—different behavior, not necessarily wrong.

### CSS / polish
**Initial** uses CSS variables for theme tokens and a consistent toolbar/hint/canvas-wrap layout.

**Senior** uses fixed hex colors and a slightly different layout (max-width: 640px, responsive width: 100% on the canvas). Both are fine; initial is a bit more tokenized for theming.

### Build and dependencies
**Initial** depends on TypeScript; **senior** only on Vite. Fewer deps for **senior**; **initial** pays for static analysis.

### Summary
| Facet	                       | Initial                            | Senior                                          |
| ---------------------------- | ---------------------------------- | ----------------------------------------------- |
| Maintainability (structure)  | Strong: life.ts + typed UI         | Good in one file; logic not separated           |
| Testability                  | Simulation easy to unit test       | Would need extraction to test rules             |
| Safety / refactor confidence | TypeScript strict                  | JSDoc only                                      |
| Performance (draw)           | Full grid each frame               | Clear + draw only live cells; alpha: false      |
| UX                           | Speed slider, starts running       | No speed, starts paused; max gen ≈ refresh rate |
| a11y (toggle)                | Basic                              | aria-pressed on run                             |
| Markup                       | JS-generated HTML                  | Declarative HTML                                |
| Input robustness             | buttons check, null outside canvas | Simpler painting loop                           |

**Overall**: 
**Initial** reads as the more maintainable, evolvable codebase for a team or for extending features (tests, variants of Life, different grid sizes), mainly due to module split, TypeScript, and build-time checks.  
**Senior** is a tight vanilla implementation with nice touches (sparse draw, aria-pressed, static HTML, clear naming) but monolithic script and no types limit long-term maintainability compared to initial unless you later extract modules and add types or tests.
