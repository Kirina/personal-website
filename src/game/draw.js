import { CHAR_SIZE, MAP_HEIGHT, MAP_WIDTH, TILE, TILE_SIZE } from "./constants";
import { MAP } from "./map";
import { SPRITES } from "./sprites";

// Tile source rects in tilesets — adjust these to match your tileset layout.
// Format: [sourceX, sourceY] in pixels within the spritesheet.
// The grass tileset uses autotile blocks (4 cols × 6 rows per terrain).
// Inner fill tiles (no edges) are at offset (1,2) within each block.
// Small decorations from props.png to sprinkle on grass tiles
const GRASS_DECOR = [
  [0, 0], // grass tuft 1
  [16, 0], // grass tuft 2
  [32, 0], // grass tuft 3
  [48, 0], // small plant
];
// Simple hash to deterministically pick which tiles get decoration
const tileHash = (x, y) => ((x * 2654435761) ^ (y * 2246822519)) >>> 0;
// Tilled soil inner fill tile
const PATH_TILE = [16 * 9, 16 * 10];

const WATER_BLOCK_W = 192;
const WATER_ANIM_FRAMES = 3;
// Edge & corner overlay positions [x, y] within each block — adjust to match sheet
const EDGE_NO_BACKGROUND = {
  // Straight edges
  top: [16 * 10, 16 * 4],
  bottom: [16 * 9, 16 * 7],
  left: [16 * 8, 16 * 5],
  right: [16 * 11, 16 * 6],
  // Convex corners (two cardinal sides are non-water)
  cvxTL: [16 * 8, 16 * 4], // grass above + left
  cvxTR: [16 * 11, 16 * 4], // grass above + right
  cvxBL: [16 * 8, 16 * 7], // grass below + left
  cvxBR: [16 * 11, 16 * 7], // grass below + right
  // Concave corners (all cardinal sides are water, but diagonal is not)
  ccvTL: [16 * 5, 16 * 5], // diagonal top-left is grass
  ccvTR: [16 * 6, 16 * 5], // diagonal top-right is grass
  ccvBL: [16 * 5, 16 * 6], // diagonal bottom-left is grass
  ccvBR: [16 * 6, 16 * 6], // diagonal bottom-right is grass
};
const isCurrent = (x, y, Current) =>
  x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && MAP[y][x] === Current;
// Fence tiles from fence-wood sheet (6 cols × 10 rows at 16×16)
const FENCE = {
  horizontal: [16, 16 * 2],
  vertical: [0, 16],
  left_end: [16 * 2, 16],
  right_end: [16 * 2, 16],
  left_top_corner: [0, 0],
  right_top_corner: [16 * 2, 0],
  left_bottom_corner: [0, 16 * 2],
  right_bottom_corner: [16 * 2, 16 * 2],
};
// Flower position in ALL props seasons sheet (small flower cluster)
const FLOWER_SRC = [16 * 18, 16 * 3];
// Mahogany tree source position and size in its sprite sheet (2 tiles wide, 3 tiles tall)
const TREE_SRC = [0, 16 * 3];
const TREE_SRC_WIDTH = 16 * 2;
const TREE_SRC_HEIGHT = 16 * 3;
// Cherry tree: full-grown spring bloom, frame 4 (x=128) in the 14-frame growth sheet
const CHERRY_TREE_SRC = [16 * 8, 0];
const CHERRY_TREE_SRC_WIDTH = 16 * 2;
const CHERRY_TREE_SRC_HEIGHT = 16 * 3;

function drawEdges(ctx, wt, px, py, x, y, tile, edge, spriteBlockX) {
  const draw = (edge) => {
    const [ex, ey] = edge;
    ctx.drawImage(
      wt,
      spriteBlockX + ex,
      ey,
      TILE_SIZE,
      TILE_SIZE,
      px,
      py,
      TILE_SIZE,
      TILE_SIZE,
    );
  };
  const t = !isCurrent(x, y - 1, tile); // non-water above
  const b = !isCurrent(x, y + 1, tile); // non-water below
  const l = !isCurrent(x - 1, y, tile); // non-water left
  const r = !isCurrent(x + 1, y, tile); // non-water right

  // Convex corners (two adjacent cardinal sides are non-water)
  if (t && l) draw(edge.cvxTL);
  if (t && r) draw(edge.cvxTR);
  if (b && l) draw(edge.cvxBL);
  if (b && r) draw(edge.cvxBR);

  // Straight edges (only one cardinal side is non-water)
  if (t && !l && !r) draw(edge.top);
  if (b && !l && !r) draw(edge.bottom);
  if (l && !t && !b) draw(edge.left);
  if (r && !t && !b) draw(edge.right);

  // Concave corners (all cardinal neighbors are water, diagonal is not)
  if (!t && !l && !isCurrent(x - 1, y - 1, tile)) draw(edge.ccvTL);
  if (!t && !r && !isCurrent(x + 1, y - 1, tile)) draw(edge.ccvTR);
  if (!b && !l && !isCurrent(x - 1, y + 1, tile)) draw(edge.ccvBL);
  if (!b && !r && !isCurrent(x + 1, y + 1, tile)) draw(edge.ccvBR);
}

export function drawTile(ctx, type, x, y, tick) {
  const px = x * TILE_SIZE,
    py = y * TILE_SIZE;

  // Solid green grass base for all tiles
  ctx.fillStyle = "#8DBA64";
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  if (type === TILE.GRASS) {
    // Sprinkle small props decorations on ~20% of grass tiles
    const h = tileHash(x, y);
    if (h % 5 === 0) {
      const pt = SPRITES.propsTiles;
      if (pt?.complete) {
        const [sx, sy] = GRASS_DECOR[h % GRASS_DECOR.length];
        ctx.drawImage(
          pt,
          sx,
          sy,
          TILE_SIZE,
          TILE_SIZE,
          px,
          py,
          TILE_SIZE,
          TILE_SIZE,
        );
      }
    }
  } else if (type === TILE.FLOWER) {
    // Overlay flower decoration from props sheet
    const pt = SPRITES.propsTiles;
    if (pt?.complete) {
      const [fx, fy] = FLOWER_SRC;
      ctx.drawImage(
        pt,
        fx,
        fy,
        TILE_SIZE,
        TILE_SIZE,
        px,
        py,
        TILE_SIZE,
        TILE_SIZE,
      );
    }
  } else if (type === TILE.PATH) {
    const pt = SPRITES.grassTiles;
    if (pt?.complete) {
      const [sx, sy] = PATH_TILE;
      ctx.drawImage(
        pt,
        sx,
        sy,
        TILE_SIZE,
        TILE_SIZE,
        px,
        py,
        TILE_SIZE,
        TILE_SIZE,
      );
      drawEdges(ctx, pt, px, py, x, y, TILE.PATH, EDGE_NO_BACKGROUND, 0);
    }
  } else if (type === TILE.WATER) {
    // Solid blue base for all water
    ctx.fillStyle = "#0092DD";
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

    // Overlay animated edge tiles where water meets non-water
    const wt = SPRITES.waterTiles;
    if (wt?.complete) {
      const spriteBlockX =
        (Math.floor(tick / 20) % WATER_ANIM_FRAMES) * WATER_BLOCK_W;

      drawEdges(
        ctx,
        wt,
        px,
        py,
        x,
        y,
        TILE.WATER,
        EDGE_NO_BACKGROUND,
        spriteBlockX,
      );
    }
  } else if (type === TILE.TREE || type === TILE.CHERRY_TREE) {
    // Drawn in a separate depth-sorted pass; nothing to do here.
  } else if (type === TILE.FENCE) {
    const ft = SPRITES.fenceTiles;
    if (ft?.complete) {
      const isF = (nx, ny) =>
        nx >= 0 &&
        nx < MAP_WIDTH &&
        ny >= 0 &&
        ny < MAP_HEIGHT &&
        MAP[ny][nx] === TILE.FENCE;
      const L = isF(x - 1, y), R = isF(x + 1, y);
      const U = isF(x, y - 1), D = isF(x, y + 1);
      let src;
      if      (!L && R && !U && D) src = FENCE.left_top_corner;
      else if (L && !R && !U && D) src = FENCE.right_top_corner;
      else if (!L && R && U && !D) src = FENCE.left_bottom_corner;
      else if (L && !R && U && !D) src = FENCE.right_bottom_corner;
      else if (!L && R && !U && !D) src = FENCE.left_end;
      else if (L && !R && !U && !D) src = FENCE.right_end;
      else if (L || R)              src = FENCE.horizontal;
      else                          src = FENCE.vertical;
      const [sx, sy] = src;
      ctx.drawImage(
        ft,
        sx,
        sy,
        TILE_SIZE,
        TILE_SIZE,
        px,
        py,
        TILE_SIZE,
        TILE_SIZE,
      );
    }
  }
}

// Draw a tree sprite at tile (x, y). Called in a post-tile pass so neighbouring
// tiles cannot paint over the sprite.
export function drawTree(ctx, x, y) {
  const mt = SPRITES.mahoganyTreeTiles;
  if (!mt?.complete) return;
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  ctx.drawImage(
    mt,
    TREE_SRC[0],
    TREE_SRC[1],
    TREE_SRC_WIDTH,
    TREE_SRC_HEIGHT,
    px - TILE_SIZE / 2,
    py - TREE_SRC_HEIGHT + TILE_SIZE,
    TREE_SRC_WIDTH,
    TREE_SRC_HEIGHT,
  );
}

export function drawCherryTree(ctx, x, y) {
  const ct = SPRITES.cherryTreeTiles;
  if (!ct?.complete) return;
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  ctx.drawImage(
    ct,
    CHERRY_TREE_SRC[0],
    CHERRY_TREE_SRC[1],
    CHERRY_TREE_SRC_WIDTH,
    CHERRY_TREE_SRC_HEIGHT,
    px - TILE_SIZE / 2,
    py - CHERRY_TREE_SRC_HEIGHT + TILE_SIZE,
    CHERRY_TREE_SRC_WIDTH,
    CHERRY_TREE_SRC_HEIGHT,
  );
}

export function drawBuilding(ctx, b) {
  const px = b.x * TILE_SIZE,
    py = b.y * TILE_SIZE,
    pw = b.w * TILE_SIZE,
    ph = b.h * TILE_SIZE;
  const img = SPRITES[b.spriteKey];

  if (img?.complete) {
    // Draw the pre-composed building image, scaled to fit the building area.
    // Offset upward by T to allow roof overhang above the collision zone.
    ctx.drawImage(img, px, py - TILE_SIZE, pw, ph + TILE_SIZE);
  }
}

// Draw a character or cat using spritesheet.
// spriteKey: base key in SPRITES (e.g. "player", "npcGuide", "cat")
// For humanoids: looks up spriteKey+"Idle" or spriteKey+"Walk"
// Pack layout: Row 0 = Down, Row 1 = Up, Row 2 = Right
// Left = flip Right sprites horizontally.
// Idle: 4 frames (128/32), Walk: 6 frames (192/32). Frame size: 32×32.
export function drawChar(ctx, x, y, dir, frame, spriteKey, isMoving, isCat) {
  // Cat uses its own single sheet with different layout
  if (isCat) {
    const img = SPRITES[spriteKey];
    if (img?.complete) {
      // Cat sheet: 4 cols × 13 rows at 32×32
      // Row 0-2: Walk (down, right, up), Row 6: Sit/idle facing down
      const catRow = 6; // sitting idle — adjust if needed
      const col = Math.floor(frame) % 4;
      ctx.save();
      ctx.drawImage(
        img,
        col * CHAR_SIZE,
        catRow * CHAR_SIZE,
        CHAR_SIZE,
        CHAR_SIZE,
        x - 8,
        y - 16,
        CHAR_SIZE,
        CHAR_SIZE,
      );
      ctx.restore();
    }
    return;
  }

  // Humanoid characters
  const idleKey = spriteKey + "Idle";
  const walkKey = spriteKey + "Walk";
  const img = SPRITES[isMoving ? walkKey : idleKey] || SPRITES[idleKey];

  if (img?.complete) {
    // Direction → spritesheet row
    // dir: 0=down, 1=up, 2=left, 3=right
    // Sheet layout: Row 0 = Down, Row 1 = Up, Row 2 = Right
    const dirMap = { 0: 0, 1: 1, 2: 2, 3: 2 };
    const row = dirMap[dir];
    const flipX = dir === 2; // Left = flip Right sprites

    const maxFrames = isMoving ? 6 : 4;
    const col = Math.floor(frame) % maxFrames;

    // Draw offset: center the 32×32 sprite so feet align with the 16×16 position
    const dx = x - 8;
    const dy = y - 16;

    ctx.save();
    if (flipX) {
      ctx.translate(dx + CHAR_SIZE, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        col * CHAR_SIZE,
        row * CHAR_SIZE,
        CHAR_SIZE,
        CHAR_SIZE,
        0,
        0,
        CHAR_SIZE,
        CHAR_SIZE,
      );
    } else {
      ctx.drawImage(
        img,
        col * CHAR_SIZE,
        row * CHAR_SIZE,
        CHAR_SIZE,
        CHAR_SIZE,
        dx,
        dy,
        CHAR_SIZE,
        CHAR_SIZE,
      );
    }
    ctx.restore();
  }
}

// 9-slice dialog background using the dialogue box sprite.
// The source rect (sx,sy,sw,sh) selects the dialog box portion from the sheet.
// Adjust these values based on your specific dialogue box.png layout.
const DIALOG_SRC = { sx: 0, sy: 0, sw: 80, sh: 48 };
const DIALOG_CORNER = 8; // corner slice size in source pixels

export function drawDialogBg(ctx, x, y, w, h) {
  const img = SPRITES.dialogBox;
  if (!img?.complete) {
    // Fallback: solid dark background
    ctx.fillStyle = "rgba(10,10,30,0.95)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#5af";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    return;
  }

  const { sx, sy, sw, sh } = DIALOG_SRC;
  const c = DIALOG_CORNER;

  // 9-slice drawing: corners, edges, and center
  // Top-left corner
  ctx.drawImage(img, sx, sy, c, c, x, y, c, c);
  // Top-right corner
  ctx.drawImage(img, sx + sw - c, sy, c, c, x + w - c, y, c, c);
  // Bottom-left corner
  ctx.drawImage(img, sx, sy + sh - c, c, c, x, y + h - c, c, c);
  // Bottom-right corner
  ctx.drawImage(
    img,
    sx + sw - c,
    sy + sh - c,
    c,
    c,
    x + w - c,
    y + h - c,
    c,
    c,
  );
  // Top edge
  ctx.drawImage(img, sx + c, sy, sw - 2 * c, c, x + c, y, w - 2 * c, c);
  // Bottom edge
  ctx.drawImage(
    img,
    sx + c,
    sy + sh - c,
    sw - 2 * c,
    c,
    x + c,
    y + h - c,
    w - 2 * c,
    c,
  );
  // Left edge
  ctx.drawImage(img, sx, sy + c, c, sh - 2 * c, x, y + c, c, h - 2 * c);
  // Right edge
  ctx.drawImage(
    img,
    sx + sw - c,
    sy + c,
    c,
    sh - 2 * c,
    x + w - c,
    y + c,
    c,
    h - 2 * c,
  );
  // Center fill
  ctx.drawImage(
    img,
    sx + c,
    sy + c,
    sw - 2 * c,
    sh - 2 * c,
    x + c,
    y + c,
    w - 2 * c,
    h - 2 * c,
  );
}
