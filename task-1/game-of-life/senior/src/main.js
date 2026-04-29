const COLS = 100;
const ROWS = 100;

/**
 * Creates an empty grid (all dead).
 */
function createEmptyGrid() {
  return new Uint8Array(COLS * ROWS);
}

/**
 * Fills the grid with random live cells at the given density (0–1).
 */
function randomizeGrid(grid, density) {
  for (let i = 0; i < grid.length; i++) {
    grid[i] = Math.random() < density ? 1 : 0;
  }
}

/**
 * Counts live neighbors for cell at (x, y), toroidal wrap.
 */
function countNeighbors(grid, x, y) {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = (x + dx + COLS) % COLS;
      const ny = (y + dy + ROWS) % ROWS;
      n += grid[ny * COLS + nx];
    }
  }
  return n;
}

/**
 * Computes the next generation into `next` from `current` (Conway's rules, torus).
 */
function step(current, next) {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const i = y * COLS + x;
      const alive = current[i];
      const neighbors = countNeighbors(current, x, y);
      if (alive) {
        next[i] = neighbors === 2 || neighbors === 3 ? 1 : 0;
      } else {
        next[i] = neighbors === 3 ? 1 : 0;
      }
    }
  }
}

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d", { alpha: false });
const cellW = canvas.width / COLS;
const cellH = canvas.height / ROWS;

let gridA = createEmptyGrid();
let gridB = createEmptyGrid();
let current = gridA;
let next = gridB;

randomizeGrid(current, 0.35);

let running = false;
let rafId = 0;

const ALIVE = "#3fb950";
const DEAD = "#0d1117";

/**
 * Draws the current grid to the canvas.
 */
function draw() {
  ctx.fillStyle = DEAD;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = ALIVE;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!current[y * COLS + x]) continue;
      ctx.fillRect(
        Math.floor(x * cellW),
        Math.floor(y * cellH),
        Math.ceil(cellW),
        Math.ceil(cellH)
      );
    }
  }
}

/**
 * Swaps buffers and advances one generation.
 */
function tick() {
  step(current, next);
  const t = current;
  current = next;
  next = t;
  draw();
}

function loop() {
  tick();
  if (running) {
    rafId = requestAnimationFrame(loop);
  }
}

function start() {
  if (running) return;
  running = true;
  loop();
}

function stop() {
  running = false;
  cancelAnimationFrame(rafId);
}

/**
 * Maps pointer coords to grid cell indices.
 */
function pointerToCell(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const sx = (clientX - rect.left) / rect.width;
  const sy = (clientY - rect.top) / rect.height;
  const x = Math.min(COLS - 1, Math.max(0, Math.floor(sx * COLS)));
  const y = Math.min(ROWS - 1, Math.max(0, Math.floor(sy * ROWS)));
  return { x, y };
}

const btnRun = document.getElementById("btn-run");
const btnStep = document.getElementById("btn-step");
const btnRandom = document.getElementById("btn-random");
const btnClear = document.getElementById("btn-clear");

btnRun.addEventListener("click", () => {
  if (running) {
    stop();
    btnRun.textContent = "Run";
    btnRun.setAttribute("aria-pressed", "false");
  } else {
    start();
    btnRun.textContent = "Pause";
    btnRun.setAttribute("aria-pressed", "true");
  }
});

btnStep.addEventListener("click", () => {
  stop();
  btnRun.textContent = "Run";
  btnRun.setAttribute("aria-pressed", "false");
  tick();
});

btnRandom.addEventListener("click", () => {
  stop();
  btnRun.textContent = "Run";
  btnRun.setAttribute("aria-pressed", "false");
  randomizeGrid(current, 0.35);
  draw();
});

btnClear.addEventListener("click", () => {
  stop();
  btnRun.textContent = "Run";
  btnRun.setAttribute("aria-pressed", "false");
  current.fill(0);
  draw();
});

let painting = null;

canvas.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  stop();
  btnRun.textContent = "Run";
  btnRun.setAttribute("aria-pressed", "false");
  const { x, y } = pointerToCell(e.clientX, e.clientY);
  const idx = y * COLS + x;
  painting = current[idx] ? 0 : 1;
  current[idx] = painting;
  draw();
});

canvas.addEventListener("mousemove", (e) => {
  if (painting === null) return;
  const { x, y } = pointerToCell(e.clientX, e.clientY);
  current[y * COLS + x] = painting;
  draw();
});

window.addEventListener("mouseup", () => {
  painting = null;
});

canvas.addEventListener("mouseleave", () => {
  painting = null;
});

draw();
