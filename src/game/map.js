import { MAP_HEIGHT, MAP_WIDTH, TILE } from "./constants";

// === MAP ===
// Hand-crafted layout inspired by Stardew Valley.
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

  // ── BORDERS ──────────────────────────────────────────────────────────────────
  // Side and bottom borders — trees
  fill([MAP_HEIGHT - 1, MAP_HEIGHT - 2], range(0, MAP_WIDTH), TILE.TREE);
  fill(range(0, MAP_HEIGHT), [0, 1, MAP_WIDTH - 1, MAP_WIDTH - 2], TILE.TREE);
  // Top border — cliff face (row 0 = top edge, row 1 = cliff face)
  fill([0, 1], range(2, MAP_WIDTH - 2), TILE.CLIFF);

  // ── MAIN PATHS ───────────────────────────────────────────────────────────────
  // Horizontal spine: rows 13-14, cols 3-36
  fill([13, 14], range(3, 37), TILE.PATH);
  // Vertical spine: cols 18-19, rows 3-26
  fill(range(3, 27), [18, 19], TILE.PATH);

  // Branch to Home — cols 6-7 rows 9-12, with slight jog at rows 8-9
  fill(range(9, 13), [6, 7], TILE.PATH);
  fill([8, 9], [5, 6, 7], TILE.PATH);

  // Branch to Workshop — cols 31-32 rows 9-12, with slight jog
  fill(range(9, 13), [31, 32], TILE.PATH);
  fill([8, 9], [31, 32, 33], TILE.PATH);

  // Branch to Library — cols 6-7 rows 15-22, with slight jog near building
  fill(range(15, 23), [6, 7], TILE.PATH);
  fill([17, 18], [5, 6, 7], TILE.PATH);

  // Branch to Garden — cols 31-32 rows 15-21, with slight jog
  fill(range(15, 22), [31, 32], TILE.PATH);
  fill([17, 18], [30, 31, 32], TILE.PATH);

  // ── POND ─────────────────────────────────────────────────────────────────────
  // Large scenic pond: rows, cols
  fill(range(2, 5), range(6, 18), TILE.WATER);
  fill(range(5, 6), range(9, 18), TILE.WATER);
  fill(range(6, 7), range(9, 16), TILE.WATER);
  fill(range(7, 11), range(10, 13), TILE.WATER);
  fill(range(11, 14), range(0, 13), TILE.WATER);

  // fill([0, 1], range(2, 18), TILE.CLIFF);
  fill(range(1, 4), range(9, 16), TILE.CLIFF);
  // fill(range(0, 2), range(10, 15), TILE.RIVER);
  fill(range(2, 5), range(10, 15), TILE.WATERFALL);
  // fill(range(0, 1), range(10, 15), TILE.WATERFALL);

  // ── FARM FIELD ───────────────────────────────────────────────────────────────
  // Tilled soil east of Library: cols 9-14, rows 20-24
  fill(range(20, 25), range(9, 15), TILE.PATH);
  fill([19], range(9, 15), TILE.FENCE);
  fill(range(20, 25), [15], TILE.FENCE);
  m[19][15] = TILE.FENCE; // top-right corner joining north + east fence

  // ── CHERRY BLOSSOM GROVE ─────────────────────────────────────────────────────
  // Primary grove: top-right quadrant, avoiding Workshop cols 27-34 rows 3-8
  [
    [3, 21],
    [3, 24],
    [3, 36],
    [4, 21],
    [4, 35],
    [5, 21],
    [5, 36],
    [6, 22],
    [6, 35],
    [7, 24],
    [7, 36],
    [8, 21],
    [8, 35],
    [9, 22],
    [10, 36],
    // Scattered cherry trees elsewhere
    [11, 37],
    [17, 3],
    [25, 20],
    [24, 37],
  ].forEach(([y, x]) => {
    if (m[y][x] === TILE.GRASS) m[y][x] = TILE.CHERRY_TREE;
  });

  // ── DECORATIVE TREES ─────────────────────────────────────────────────────────
  [
    // Between Home and pond (col 11, row 3 — above pond fence which starts row 4)
    [3, 11],
    // Right of pond area, left of Workshop
    [3, 20],
    [4, 20],
    [5, 20],
    [9, 20],
    [11, 20],
    // Between Workshop and border (right side, rows 3-12)
    [3, 26],
    [4, 26],
    [9, 26],
    [11, 26],
    // Lower-left (below main path, outside Library footprint, outside branch path)
    [15, 3],
    [16, 3],
    [22, 3],
    [25, 3],
    [26, 3],
    // Lower-right (below main path, outside Garden, outside branch path)
    [15, 37],
    [16, 37],
    [22, 37],
    [25, 37],
    [26, 37],
    // South-center open areas
    [16, 22],
    [16, 26],
    [22, 22],
    [22, 26],
    [25, 24],
    [26, 22],
  ].forEach(([y, x]) => {
    if (m[y][x] === TILE.GRASS) m[y][x] = TILE.TREE;
  });

  // ── FLOWERS ──────────────────────────────────────────────────────────────────
  [
    // North of pond (row 3)
    [3, 13],
    [3, 14],
    [3, 16],
    // Below Home (rows 9-10, outside footprint cols 3-10)
    [9, 11],
    [10, 10],
    // Below Workshop (rows 9-10, outside footprint cols 27-34)
    [9, 25],
    [10, 25],
    // South/west of pond-fence area
    [12, 9],
    [12, 10],
    // Path edges (rows 12 and 15)
    [12, 4],
    [12, 8],
    [12, 20],
    [12, 25],
    [15, 4],
    [15, 8],
    [15, 20],
    [15, 25],
    // Near Library and Garden (outside footprints)
    [17, 8],
    [17, 9],
    [17, 26],
    [17, 27],
    [22, 8],
    [23, 8],
    [22, 26],
    [23, 26],
    // Center open areas
    [16, 15],
    [16, 17],
    [16, 23],
    [16, 27],
    // South open areas
    [24, 17],
    [24, 25],
    [26, 17],
    [26, 25],
    // Cherry grove adjacent
    [11, 23],
    [11, 25],
  ].forEach(([y, x]) => {
    if (m[y][x] === TILE.GRASS) m[y][x] = TILE.FLOWER;
  });

  return m;
})();
