// Character sprite frame size (32×32 per frame in this pack)
export const CHAR_SIZE = 32;

// === CONFIG ===
export const TILE_SIZE = 16;
export const SCALE = 3;
export const VIEW_WIDTH = 21;
export const VIEW_HEIGHT = 15;
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 30;
export const PLAYER_SPEED = 1.4;
export const TILE = {
  GRASS: 0,
  PATH: 1,
  WATER: 2,
  CLIFF: 7,
  WATERFALL: 8,
  RIVER: 9,
};
export const SOLID = new Set([TILE.WATER]);

export const OBJ = {
  TREE: 1,
  CHERRY_TREE: 2,
  FLOWER: 3,
  FENCE: 4,
};
export const OBJ_SOLID = new Set([OBJ.TREE, OBJ.CHERRY_TREE, OBJ.FENCE]);

export const GRASS_DECOR = [
  [0, 0], // grass tuft 1
  [16, 0], // grass tuft 2
  [32, 0], // grass tuft 3
  [48, 0], // small plant
];

export const PATH_TILE = [16 * 9, 16 * 10];

export const WATER_BLOCK_W = 192;
export const WATER_ANIM_FRAMES = 3;

export const RIVER = {
  numFrames: 8,
  offsetFrames: 16 * 3,
  left: [0, 16 * 6],
  middle: [16, 16 * 6],
  right: [16 * 2, 16 * 6],
};

export const WATERFALL = {
  numFrames: 8,
  offsetFrames: 16 * 3,
  height: 16 * 3,
  left: [0, 16 * 7],
  middle: [16, 16 * 7],
  right: [16 * 2, 16 * 7],
};

export const CLIFF_TOP = {
  middle: [16 * 9, 16 * 3],
  left: [16 * 8, 16 * 1],
  right: [16 * 11, 16 * 2],
  concave_left_corner: [16 * 8, 16 * 3],
  concave_right_corner: [16 * 11, 16 * 3],
  convex_left_corner: [16 * 5, 16 * 2],
  convex_right_corner: [16 * 6, 16 * 2],
};

export const CLIFF_WATER_BOTTOM = {
  numFrames: 4,
  offsetFrames: 16 * 3,
  left: [0, 16 * 5],
  middle: [16, 16 * 5],
  right: [16 * 2, 16 * 5],
};

export const CLIFF_BOTTOM = {
  left: [16 * 8, 16 * 4],
  middle: [16 * 9, 16 * 4],
  right: [16 * 11, 16 * 4],
};

export const EDGE_NO_BACKGROUND = {
  top: [16 * 10, 16 * 4],
  bottom: [16 * 9, 16 * 7],
  left: [16 * 8, 16 * 5],
  right: [16 * 11, 16 * 6],
  cvxTL: [16 * 8, 16 * 4],
  cvxTR: [16 * 11, 16 * 4],
  cvxBL: [16 * 8, 16 * 7],
  cvxBR: [16 * 11, 16 * 7],
  ccvTL: [16 * 5, 16 * 5],
  ccvTR: [16 * 6, 16 * 5],
  ccvBL: [16 * 5, 16 * 6],
  ccvBR: [16 * 6, 16 * 6],
};

export const FENCE = {
  horizontal: [16, 16 * 2],
  vertical: [0, 16],
  horizontal_left_end: [16, 16 * 3],
  horizontal_right_end: [16 * 2, 16 * 3],
  vertical_end: [16 * 2, 16 * 4],
  left_top_corner: [0, 0],
  right_top_corner: [16 * 2, 0],
  left_bottom_corner: [0, 16 * 2],
  right_bottom_corner: [16 * 2, 16 * 2],
};

export const FLOWER_SRC = [16 * 18, 16 * 3];

export const TREE = {
  mahogany: [0, 16 * 3],
  cherry: [16 * 8, 0],
  width: 16 * 2,
  height: 16 * 3,
};
