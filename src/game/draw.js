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

const WATERFALL = {
  numFrames: 8,
  offsetFrames: 16 * 3,
  height: 16 * 4,
  left: [0, 16 * 6],
  middle: [16, 16 * 6],
  right: [16 * 2, 16 * 6],
};

const CLIFF_TOP = {
  middle: [16 * 9, 16 * 3],
  left: [16 * 8, 16 * 1],
  right: [16 * 11, 16 * 2],
  concave_left_corner: [16 * 8, 16 * 3],
  concave_right_corner: [16 * 11, 16 * 3],
  convex_left_corner: [16 * 5, 16 * 2],
  convex_right_corner: [16 * 6, 16 * 2],
};

const CLIFF_WATER_BOTTOM = {
  numFrames: 4,
  offsetFrames: 16 * 3,
  left: [0, 16 * 5],
  middle: [16, 16 * 5],
  right: [16 * 2, 16 * 5],
};

const CLIFF_BOTTOM = {
  left: [16 * 8, 16 * 4],
  middle: [16 * 9, 16 * 4],
  right: [16 * 11, 16 * 4],
};

const BRIDGE = {
  src: [16 * 0.5, 0],
  width: 16 * 5,
  height: 16 * 3.5,
};
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
  left_end: [16, 16 * 3],
  right_end: [16 * 2, 16 * 3],
  left_top_corner: [0, 0],
  right_top_corner: [16 * 2, 0],
  left_bottom_corner: [0, 16 * 2],
  right_bottom_corner: [16 * 2, 16 * 2],
};
// Flower position in ALL props seasons sheet (small flower cluster)
const FLOWER_SRC = [16 * 18, 16 * 3];
// Mahogany tree source position and size in its sprite sheet (2 tiles wide, 3 tiles tall)
const TREE = { src: [0, 16 * 3], width: 16 * 2, height: 16 * 3 };
// Cherry tree: full-grown spring bloom, frame 4 (x=128) in the 14-frame growth sheet
const CHERRY_TREE = {
  src: [16 * 8, 0],
  width: 16 * 2,
  height: 16 * 3,
};

function drawEdges(
  ctx,
  wt,
  px,
  py,
  x,
  y,
  tile,
  edge,
  spriteBlockX,
  adjacentIsCliff = false, // for water borders
  adjacentIsGrass = true, // for water borders
  adjacentIsPath = true, // for water borders
) {
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
  // When skipTop is set, treat the top as if it were the same tile (no top edge).
  const topTile = !adjacentIsCliff && !isCurrent(x, y - 1, tile);
  const bottomTile = !isCurrent(x, y + 1, tile);
  const leftTile = !isCurrent(x - 1, y, tile);
  const rightTile = !isCurrent(x + 1, y, tile);

  // Convex corners (two adjacent cardinal sides are non-same-tile)
  if (topTile && leftTile) draw(edge.cvxTL);
  if (topTile && rightTile) draw(edge.cvxTR);
  if (bottomTile && leftTile) draw(edge.cvxBL);
  if (bottomTile && rightTile) draw(edge.cvxBR);

  // Straight edges (only one cardinal side is non-same-tile)
  if (topTile && !leftTile && !rightTile) draw(edge.top);
  if (bottomTile && !leftTile && !rightTile) draw(edge.bottom);
  if (
    (adjacentIsGrass || adjacentIsPath) &&
    leftTile &&
    !topTile &&
    !bottomTile
  )
    draw(edge.left);
  if (
    (adjacentIsGrass || adjacentIsPath) &&
    rightTile &&
    !topTile &&
    !bottomTile
  )
    draw(edge.right);

  // Concave corners (all cardinal neighbors are same-tile, diagonal is not)
  if (
    !adjacentIsCliff &&
    !topTile &&
    !leftTile &&
    !isCurrent(x - 1, y - 1, tile)
  )
    draw(edge.ccvTL);
  if (
    !adjacentIsCliff &&
    !topTile &&
    !rightTile &&
    !isCurrent(x + 1, y - 1, tile)
  )
    draw(edge.ccvTR);
  if (!bottomTile && !leftTile && !isCurrent(x - 1, y + 1, tile))
    draw(edge.ccvBL);
  if (!bottomTile && !rightTile && !isCurrent(x + 1, y + 1, tile))
    draw(edge.ccvBR);
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

      const adjacentIsCliff =
        (y > 0 && MAP[y - 1][x] === TILE.CLIFF) ||
        MAP[y + 1][x] === TILE.CLIFF ||
        (x > 0 && y > 0 && MAP[y][x - 1] === TILE.CLIFF) ||
        (x > 0 && y > 0 && MAP[y][x + 1] === TILE.CLIFF) ||
        (x > 0 && y > 0 && MAP[y - 1][x - 1] === TILE.CLIFF) ||
        (x > 0 && y > 0 && MAP[y + 1][x - 1] === TILE.CLIFF) ||
        (x > 0 && y > 0 && MAP[y - 1][x + 1] === TILE.CLIFF) ||
        MAP[y + 1][x + 1] === TILE.CLIFF;

      const adjacentIsGrass =
        (y > 0 && MAP[y - 1][x] === TILE.GRASS) ||
        MAP[y + 1][x] === TILE.GRASS ||
        (x > 0 && MAP[y][x - 1] === TILE.GRASS) ||
        MAP[y][x + 1] === TILE.GRASS;

      const adjacentIsPath =
        (y > 0 && MAP[y - 1][x] === TILE.PATH) ||
        MAP[y + 1][x] === TILE.PATH ||
        (x > 0 && MAP[y][x - 1] === TILE.PATH) ||
        MAP[y][x + 1] === TILE.PATH;

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
        adjacentIsCliff,
        adjacentIsGrass,
        adjacentIsPath,
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
      const L = isF(x - 1, y),
        R = isF(x + 1, y);
      const U = isF(x, y - 1),
        D = isF(x, y + 1);
      let src;
      if (!L && R && !U && D) src = FENCE.left_top_corner;
      else if (L && !R && !U && D) src = FENCE.right_top_corner;
      else if (!L && R && U && !D) src = FENCE.left_bottom_corner;
      else if (L && !R && U && !D) src = FENCE.right_bottom_corner;
      else if (!L && R && !U && !D) src = FENCE.left_end;
      else if (L && !R && !U && !D) src = FENCE.right_end;
      else if (L || R) src = FENCE.horizontal;
      else src = FENCE.vertical;
      ctx.drawImage(
        ft,
        src[0],
        src[1],
        TILE_SIZE,
        TILE_SIZE,
        px,
        py,
        TILE_SIZE,
        TILE_SIZE,
      );
    }
  } else if (type === TILE.CLIFF) {
    const wc = SPRITES.waterfallCliff;
    if (wc?.complete) {
      const isCliff = (nx, ny) =>
        nx >= 0 &&
        nx < MAP_WIDTH &&
        ny >= 0 &&
        ny < MAP_HEIGHT &&
        MAP[ny][nx] === TILE.CLIFF;
      const isWater = (nx, ny) =>
        nx >= 0 &&
        nx < MAP_WIDTH &&
        ny >= 0 &&
        ny < MAP_HEIGHT &&
        MAP[ny][nx] === TILE.WATER;
      const isBottom = !isCliff(x, y + 1); // face: no cliff below
      const isJustAboveFace = isCliff(x, y + 1) && !isCliff(x, y + 2); // one row above face

      // Rows further above the face are on top of the cliff — just grass.
      if (!isBottom && !isJustAboveFace) {
        // if tile at bottom is top
        if (isCliff(x, y + 1) && isCliff(x, y + 2)) {
          // if tile right is top -> right convex
          if (
            !isCliff(x + 1, y + 2) &&
            isCliff(x + 1, y) &&
            isCliff(x + 1, y + 1)
          ) {
            ctx.drawImage(
              wc,
              CLIFF_TOP.convex_right_corner[0],
              CLIFF_TOP.convex_right_corner[1],
              TILE_SIZE,
              TILE_SIZE,
              px,
              py,
              TILE_SIZE,
              TILE_SIZE,
            );
            // if tile left is top -> left convex
          } else if (
            !isCliff(x - 1, y + 2) &&
            isCliff(x - 1, y) &&
            isCliff(x - 1, y + 1)
          ) {
            ctx.drawImage(
              wc,
              CLIFF_TOP.convex_left_corner[0],
              CLIFF_TOP.convex_left_corner[1],
              TILE_SIZE,
              TILE_SIZE,
              px,
              py,
              TILE_SIZE,
              TILE_SIZE,
            );
          }
          // if tile right is not cliff or is bottom
          else if (
            !isCliff(x + 1, y) ||
            (isCliff(x + 1, y) && !isCliff(x + 1, y + 1))
          ) {
            ctx.drawImage(
              wc,
              CLIFF_TOP.right[0],
              CLIFF_TOP.right[1],
              TILE_SIZE,
              TILE_SIZE,
              px,
              py,
              TILE_SIZE,
              TILE_SIZE,
            );
          }
          // if tile left is not cliff or is bottom
          else if (
            !isCliff(x - 1, y) ||
            (isCliff(x - 1, y) && !isCliff(x - 1, y + 1))
          ) {
            ctx.drawImage(
              wc,
              CLIFF_TOP.left[0],
              CLIFF_TOP.left[1],
              TILE_SIZE,
              TILE_SIZE,
              px,
              py,
              TILE_SIZE,
              TILE_SIZE,
            );
          }
          return;
        }
      }

      if (isJustAboveFace) {
        // Base middle edge drawn on every cliff-top tile.
        ctx.drawImage(
          wc,
          CLIFF_TOP.middle[0],
          CLIFF_TOP.middle[1],
          TILE_SIZE,
          TILE_SIZE,
          px,
          py,
          TILE_SIZE,
          TILE_SIZE,
        );
        // Corner overlays — drawn on top, like water's cvxTL/cvxTR.
        // Left: no cliff-top to the left, OR face row has cliff diagonally left.
        if (!isCliff(x - 1, y) || !isCliff(x - 1, y + 1)) {
          ctx.drawImage(
            wc,
            CLIFF_TOP.concave_left_corner[0],
            CLIFF_TOP.concave_left_corner[1],
            TILE_SIZE,
            TILE_SIZE,
            px,
            py,
            TILE_SIZE,
            TILE_SIZE,
          );
        }
        // Right: no cliff-top to the right, OR face row has cliff diagonally right.
        else if (!isCliff(x + 1, y) || !isCliff(x + 1, y + 1)) {
          ctx.drawImage(
            wc,
            CLIFF_TOP.concave_right_corner[0],
            CLIFF_TOP.concave_right_corner[1],
            TILE_SIZE,
            TILE_SIZE,
            px,
            py,
            TILE_SIZE,
            TILE_SIZE,
          );
        }
      } else {
        const L = isCliff(x - 1, y),
          R = isCliff(x + 1, y);
        let set, frameX;
        if (isWater(x, y + 1)) {
          ctx.fillStyle = "#0092DD";
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          // Animated water cliff — face row meets water
          const frame = Math.floor(tick / 20) % CLIFF_WATER_BOTTOM.numFrames;
          frameX = frame * CLIFF_WATER_BOTTOM.offsetFrames;
          set = CLIFF_WATER_BOTTOM;
        } else {
          set = CLIFF_BOTTOM;
          frameX = 0;
        }
        const [sx, sy] = !L ? set.left : !R ? set.right : set.middle;
        ctx.drawImage(
          wc,
          frameX + sx,
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
    TREE.src[0],
    TREE.src[1],
    TREE.width,
    TREE.height,
    px - TILE_SIZE / 2,
    py - TREE.height + TILE_SIZE,
    TREE.width,
    TREE.height,
  );
}

export function drawCherryTree(ctx, x, y) {
  const ct = SPRITES.cherryTreeTiles;
  if (!ct?.complete) return;
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  ctx.drawImage(
    ct,
    CHERRY_TREE.src[0],
    CHERRY_TREE.src[1],
    CHERRY_TREE.width,
    CHERRY_TREE.height,
    px - TILE_SIZE / 2,
    py - CHERRY_TREE.height + TILE_SIZE,
    CHERRY_TREE.width,
    CHERRY_TREE.height,
  );
}

export function drawBuilding(ctx, buildingData) {
  const px = buildingData.x * TILE_SIZE,
    py = buildingData.y * TILE_SIZE,
    pw = buildingData.spriteWidth * TILE_SIZE,
    ph = buildingData.spriteHeight * TILE_SIZE;
  const img = SPRITES[buildingData.spriteKey];

  if (img?.complete) {
    const sx = buildingData.spriteX ?? 0,
      sy = buildingData.spriteY ?? 0;
    if (buildingData.spriteW !== undefined) {
      // Sprite sheet building: render at natural pixel size, bottom-anchored to ground level.
      // spriteW/spriteH define the source crop; hitbox is defined by x/y/w/h independently.
      const sw = buildingData.spriteW,
        sh = buildingData.spriteH;
      ctx.drawImage(
        img,
        sx,
        sy,
        sw,
        sh,
        px,
        (buildingData.y + buildingData.spriteHeight) * TILE_SIZE - sh,
        sw,
        sh,
      );
    } else {
      // Dedicated file: stretch to fill the tile footprint with one-tile roof overhang.
      ctx.drawImage(
        img,
        sx,
        sy,
        pw,
        ph + TILE_SIZE,
        px,
        py - TILE_SIZE,
        pw,
        ph + TILE_SIZE,
      );
    }
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
