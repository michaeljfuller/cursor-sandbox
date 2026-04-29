import {
  SIZE,
  createGrid,
  randomize,
  clearGrid,
  step,
  type Grid,
} from "./life";
import "./style.css";

const DISPLAY = 600;
const CELL = DISPLAY / SIZE;

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <h1>Conway's Game of Life</h1>
  <p class="hint">100×100 toroidal grid · Click or drag to toggle cells</p>
  <div class="toolbar">
    <button type="button" id="run">Pause</button>
    <button type="button" id="step">Step</button>
    <button type="button" id="random">Randomize</button>
    <button type="button" id="clear">Clear</button>
    <label>
      Speed
      <input type="range" id="speed" min="1" max="30" value="12" />
    </label>
  </div>
  <div class="canvas-wrap">
    <canvas id="board" width="${DISPLAY}" height="${DISPLAY}" aria-label="Game of life grid"></canvas>
  </div>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#board")!;
const ctx = canvas.getContext("2d")!;
const runBtn = document.querySelector<HTMLButtonElement>("#run")!;
const stepBtn = document.querySelector<HTMLButtonElement>("#step")!;
const randomBtn = document.querySelector<HTMLButtonElement>("#random")!;
const clearBtn = document.querySelector<HTMLButtonElement>("#clear")!;
const speedInput = document.querySelector<HTMLInputElement>("#speed")!;

let gridA: Grid = createGrid();
let gridB: Grid = createGrid();
randomize(gridA, 0.32);

let running = true;
let lastTick = performance.now();
let intervalMs = 1000 / Number(speedInput.value);

const LIVE = "#3ecf8e";
const DEAD = "#1e2a3a";

function draw(): void {
  const g = gridA;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const alive = g[y * SIZE + x] === 1;
      ctx.fillStyle = alive ? LIVE : DEAD;
      ctx.fillRect(x * CELL, y * CELL, CELL + 0.5, CELL + 0.5);
    }
  }
}

function swap(): void {
  const t = gridA;
  gridA = gridB;
  gridB = t;
}

function tick(): void {
  step(gridA, gridB);
  swap();
  draw();
}

function setRunning(next: boolean): void {
  running = next;
  runBtn.textContent = running ? "Pause" : "Run";
}

function clientToCell(clientX: number, clientY: number): { x: number; y: number } | null {
  const r = canvas.getBoundingClientRect();
  const x = Math.floor(((clientX - r.left) / r.width) * SIZE);
  const y = Math.floor(((clientY - r.top) / r.height) * SIZE);
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return null;
  return { x, y };
}

let dragVal: 0 | 1 | null = null;

canvas.addEventListener("mousedown", (e) => {
  if (running) setRunning(false);
  const c = clientToCell(e.clientX, e.clientY);
  if (!c) return;
  const i = c.y * SIZE + c.x;
  dragVal = gridA[i] === 1 ? 0 : 1;
  gridA[i] = dragVal;
  draw();
});

canvas.addEventListener("mousemove", (e) => {
  if (e.buttons !== 1 || dragVal === null) return;
  const c = clientToCell(e.clientX, e.clientY);
  if (!c) return;
  const i = c.y * SIZE + c.x;
  if (gridA[i] !== dragVal) {
    gridA[i] = dragVal;
    draw();
  }
});

window.addEventListener("mouseup", () => {
  dragVal = null;
});

runBtn.addEventListener("click", () => setRunning(!running));

stepBtn.addEventListener("click", () => {
  if (running) setRunning(false);
  tick();
});

randomBtn.addEventListener("click", () => {
  if (running) setRunning(false);
  randomize(gridA, 0.35);
  draw();
});

clearBtn.addEventListener("click", () => {
  if (running) setRunning(false);
  clearGrid(gridA);
  draw();
});

speedInput.addEventListener("input", () => {
  intervalMs = 1000 / Number(speedInput.value);
});

function loop(ts: number): void {
  if (running && ts - lastTick >= intervalMs) {
    lastTick = ts;
    tick();
  }
  requestAnimationFrame(loop);
}

draw();
requestAnimationFrame(loop);
