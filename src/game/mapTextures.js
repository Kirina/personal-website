import { MAP_HEIGHT, MAP_WIDTH, TILE } from "./spriteConstants";

// === MAP ===
// Floor textures only: GRASS, PATH, WATER, CLIFF, WATERFALL, RIVER.
// Objects (trees, flowers, fences) live in MAP_OBJECTS in data.js.
//
// Buildings (drawn on top of GRASS tiles):
//   Home      x:3  y:3  w:8 h:6  → cols 3-10, rows 3-8
//   Workshop  x:27 y:3  w:8 h:6  → cols 27-34, rows 3-8
//   Library   x:3  y:18 w:5 h:6  → cols 3-7,  rows 18-23
//   Garden    x:28 y:18 w:5 h:5  → cols 28-32, rows 18-22
export const MAP = (() => {
  const m = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(0));
  const fill = (ys, xs, t) =>
    ys.forEach((y) =>
      xs.forEach((x) => {
        if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) m[y][x] = t;
      }),
    );
  const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);

  // ── MAIN PATHS ───────────────────────────────────────────────────────────────
  // Horizontal spine: rows 13-14, cols 3-36
  fill([13, 14], range(13, 37), TILE.PATH);

  // Branch to Home — rows 9-12,  cols 31-32, with slight jog
  fill([7, 8], [27, 28, 29], TILE.PATH);
  fill(range(7, 11), [27, 28], TILE.PATH);
  fill(range(10, 15), [26, 27], TILE.PATH);

  // ── POND ─────────────────────────────────────────────────────────────────────
  // Large scenic pond: rows, cols
  fill(range(2, 5), range(6, 18), TILE.WATER);
  fill(range(5, 6), range(9, 18), TILE.WATER);
  fill(range(6, 7), range(9, 16), TILE.WATER);
  fill(range(7, 11), range(10, 13), TILE.WATER);
  fill(range(11, 14), range(0, 13), TILE.WATER);

  fill(range(1, 3), range(9, 16), TILE.CLIFF);
  fill(range(1, 4), range(9, 15), TILE.CLIFF);
  fill(range(0, 2), range(10, 14), TILE.RIVER);
  fill(range(2, 5), range(10, 14), TILE.WATERFALL);
  fill(range(9, 10), range(10, 13), TILE.PATH);

  // ── FARM FIELD ───────────────────────────────────────────────────────────────
  // Tilled soil east of Library: cols 9-14, rows 20-24
  fill(range(20, 25), range(9, 15), TILE.PATH);

  return m;
})();
