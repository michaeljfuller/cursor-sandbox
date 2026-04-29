/** Grid side length (100×100). */
export const SIZE = 100;

export type Grid = Uint8Array;

export function createGrid(): Grid {
  return new Uint8Array(SIZE * SIZE);
}

export function randomize(grid: Grid, density = 0.35): void {
  for (let i = 0; i < grid.length; i++) {
    grid[i] = Math.random() < density ? 1 : 0;
  }
}

export function clearGrid(grid: Grid): void {
  grid.fill(0);
}

function idx(x: number, y: number): number {
  return y * SIZE + x;
}

/** Toroidal neighbor count (edges wrap). */
function neighbors(grid: Grid, x: number, y: number): number {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = (x + dx + SIZE) % SIZE;
      const ny = (y + dy + SIZE) % SIZE;
      n += grid[idx(nx, ny)];
    }
  }
  return n;
}

/** Advance one generation in-place using double buffering. */
export function step(current: Grid, next: Grid): void {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const n = neighbors(current, x, y);
      const alive = current[idx(x, y)] === 1;
      if (alive) {
        next[idx(x, y)] = n === 2 || n === 3 ? 1 : 0;
      } else {
        next[idx(x, y)] = n === 3 ? 1 : 0;
      }
    }
  }
}
