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
export const SOLID = new Set([TILE.WATER, TILE.CLIFF]);

export const OBJ = {
  TREE: 1,
  CHERRY_TREE: 2,
  FLOWER: 3,
  FENCE: 4,
};
export const OBJ_SOLID = new Set([OBJ.TREE, OBJ.CHERRY_TREE, OBJ.FENCE]);

// export const FENCE = {
//   horizontal: [16, 16 * 2],
//   vertical: [0, 16],
//   horizontal_left_end: [16, 16 * 3],
//   horizontal_right_end: [16 * 2, 16 * 3],
//   vertical_end: [16 * 2, 16 * 4],
//   left_top_corner: [0, 0],
//   right_top_corner: [16 * 2, 0],
//   left_bottom_corner: [0, 16 * 2],
//   right_bottom_corner: [16 * 2, 16 * 2],
// };
