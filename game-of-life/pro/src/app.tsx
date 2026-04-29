import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  SIZE,
  clearGrid,
  createGrid,
  randomize,
  step,
  type Grid,
} from "./life";

const DISPLAY = 600;
const CELL = DISPLAY / SIZE;
const LIVE = "#3ecf8e";
const DEAD = "#1e2a3a";

/** Maps pointer coordinates to grid cell indices, or null if outside the board. */
function clientToCell(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const r = canvas.getBoundingClientRect();
  const x = Math.floor(((clientX - r.left) / r.width) * SIZE);
  const y = Math.floor(((clientY - r.top) / r.height) * SIZE);
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return null;
  return { x, y };
}

/** Renders the current grid to the canvas. */
function drawCanvas(ctx: CanvasRenderingContext2D, grid: Grid): void {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const alive = grid[y * SIZE + x] === 1;
      ctx.fillStyle = alive ? LIVE : DEAD;
      ctx.fillRect(x * CELL, y * CELL, CELL + 0.5, CELL + 0.5);
    }
  }
}

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridsRef = useRef<{ a: Grid; b: Grid } | null>(null);
  if (!gridsRef.current) {
    const a = createGrid();
    const b = createGrid();
    randomize(a, 0.32);
    gridsRef.current = { a, b };
  }

  const runningRef = useRef(true);
  const intervalMsRef = useRef(1000 / 12);
  const dragValRef = useRef<0 | 1 | null>(null);

  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(12);

  runningRef.current = running;
  intervalMsRef.current = 1000 / speed;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const g = gridsRef.current;
    if (!ctx || !g) return;
    drawCanvas(ctx, g.a);
  }, []);

  const tick = useCallback(() => {
    const g = gridsRef.current;
    if (!g) return;
    step(g.a, g.b);
    const t = g.a;
    g.a = g.b;
    g.b = t;
    redraw();
  }, [redraw]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    let raf = 0;
    let lastTick = performance.now();

    function loop(ts: number): void {
      raf = requestAnimationFrame(loop);
      if (runningRef.current && ts - lastTick >= intervalMsRef.current) {
        lastTick = ts;
        tick();
      }
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tick]);

  function handleRunClick(): void {
    setRunning((r) => !r);
  }

  function handleStepClick(): void {
    setRunning(false);
    tick();
  }

  function handleRandomClick(): void {
    setRunning(false);
    const g = gridsRef.current;
    if (!g) return;
    randomize(g.a, 0.35);
    redraw();
  }

  function handleClearClick(): void {
    setRunning(false);
    const g = gridsRef.current;
    if (!g) return;
    clearGrid(g.a);
    redraw();
  }

  function handleSpeedInput(e: Event): void {
    const v = Number((e.target as HTMLInputElement).value);
    setSpeed(v);
  }

  function handleMouseDown(e: MouseEvent): void {
    const canvas = canvasRef.current;
    const g = gridsRef.current;
    if (!canvas || !g) return;
    setRunning(false);
    const c = clientToCell(canvas, e.clientX, e.clientY);
    if (!c) return;
    const i = c.y * SIZE + c.x;
    dragValRef.current = g.a[i] === 1 ? 0 : 1;
    g.a[i] = dragValRef.current;
    redraw();
  }

  function handleMouseMove(e: MouseEvent): void {
    if (e.buttons !== 1 || dragValRef.current === null) return;
    const canvas = canvasRef.current;
    const g = gridsRef.current;
    if (!canvas || !g) return;
    const c = clientToCell(canvas, e.clientX, e.clientY);
    if (!c) return;
    const i = c.y * SIZE + c.x;
    const dv = dragValRef.current;
    if (g.a[i] !== dv) {
      g.a[i] = dv;
      redraw();
    }
  }

  function handleMouseUp(): void {
    dragValRef.current = null;
  }

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <>
      <h1>Conway's Game of Life</h1>
      <p class="hint">
        100×100 toroidal grid · Click or drag to toggle cells · Preact + Vite
      </p>
      <div class="toolbar">
        <button type="button" onClick={handleRunClick}>
          {running ? "Pause" : "Run"}
        </button>
        <button type="button" onClick={handleStepClick}>
          Step
        </button>
        <button type="button" onClick={handleRandomClick}>
          Randomize
        </button>
        <button type="button" onClick={handleClearClick}>
          Clear
        </button>
        <label>
          Speed
          <input
            type="range"
            min="1"
            max="30"
            value={speed}
            onInput={handleSpeedInput}
          />
        </label>
      </div>
      <div class="canvas-wrap">
        <canvas
          ref={canvasRef}
          id="board"
          width={DISPLAY}
          height={DISPLAY}
          aria-label="Game of life grid"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        />
      </div>
    </>
  );
}
