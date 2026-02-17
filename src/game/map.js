import { MAP_HEIGHT, MAP_WIDTH, TILE } from "./constants";

// === MAP ===
export const MAP = (() => {
  const m = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(0));
  const fill = (ys, xs, t) =>
    ys.forEach((y) =>
      xs.forEach((x) => {
        if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) m[y][x] = t;
      }),
    );
  const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);

  // Border trees
  fill([0, 1, MAP_HEIGHT - 1, MAP_HEIGHT - 2], range(0, MAP_WIDTH), TILE.TREE);
  fill(range(0, MAP_HEIGHT), [0, 1, MAP_WIDTH - 1, MAP_WIDTH - 2], TILE.TREE);

  // Main paths
  fill([14, 15], range(3, 37), TILE.PATH);
  fill(range(3, 27), [19, 20], TILE.PATH);
  fill(range(8, 23), [7, 8], TILE.PATH);
  fill(range(8, 23), [30, 31], TILE.PATH);

  // Pond
  fill(range(23, 26), range(32, 37), TILE.WATER);
  fill([22], range(33, 36), TILE.WATER);

  // Flowers
  [
    [4, 13],
    [5, 14],
    [4, 25],
    [5, 26],
    [23, 4],
    [24, 5],
    [10, 13],
    [10, 25],
    [20, 13],
    [20, 25],
    [12, 16],
    [12, 23],
    [17, 16],
    [17, 23],
  ].forEach(([y, x]) => {
    if (m[y][x] === 0) m[y][x] = TILE.FLOWER;
  });

  // Decorative trees
  [
    [4, 3],
    [6, 12],
    [4, 24],
    [6, 35],
    [10, 3],
    [10, 35],
    [20, 3],
    [20, 35],
    [25, 3],
    [25, 12],
    [25, 24],
    [9, 16],
    [9, 23],
    [20, 16],
    [20, 23],
  ].forEach(([y, x]) => {
    if (m[y][x] === 0) m[y][x] = TILE.TREE;
  });

  // Fences near pond
  fill([22], range(30, 33), TILE.FENCE);
  fill([26], range(32, 37), TILE.FENCE);

  return m;
})();
