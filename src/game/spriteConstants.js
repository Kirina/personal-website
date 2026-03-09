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
