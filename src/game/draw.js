import { MAP } from "./mapTextures";
import {
  CHAR_SIZE,
  CLIFF_BOTTOM,
  CLIFF_TOP,
  CLIFF_WATER_BOTTOM,
  EDGE_NO_BACKGROUND,
  FENCE,
  FLOWER_SRC,
  GRASS_DECOR,
  MAP_HEIGHT,
  MAP_WIDTH,
  OBJ,
  PATH_TILE,
  RIVER,
  TILE,
  TILE_SIZE,
  TREE,
  TREE_PORTAL,
  WATER_ANIM_FRAMES,
  WATER_BLOCK_W,
  WATERFALL,
} from "./spriteConstants";
import { SPRITES } from "./spriteFiles";

// Simple hash to deterministically pick which tiles get decoration
const tileHash = (x, y) => ((x * 2654435761) ^ (y * 2246822519)) >>> 0;

// returns true if tile matches tile type given
const isTileType = (x, y, type) =>
  x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && MAP[y][x] === type;

function drawEdges(
  ctx,
  spritesheet,
  px,
  py,
  x,
  y,
  currentTile,
  edge,
  spriteBlockX,
) {
  const draw = (edge) => {
    const [ex, ey] = edge;
    ctx.drawImage(
      spritesheet,
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

  const isCliffLike = (x, y) => {
    return isTileType(x, y, TILE.CLIFF) || isTileType(x, y, TILE.WATERFALL);
  };

  let adjacentIsCliff = {
    top: isCliffLike(x, y - 1),
    bottom: isCliffLike(x, y + 1),
    left: isCliffLike(x - 1, y),
    right: isCliffLike(x + 1, y),
    leftTop: isCliffLike(x - 1, y - 1),
    leftBottom: isCliffLike(x - 1, y + 1),
    rightTop: isCliffLike(x + 1, y - 1),
    rightBottom: isCliffLike(x + 1, y + 1),
  };

  const inBounds = (nx, ny) =>
    nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT;
  const topTile =
    inBounds(x, y - 1) &&
    !isTileType(x, y - 1, currentTile) &&
    !adjacentIsCliff.top;
  const bottomTile =
    inBounds(x, y + 1) &&
    !isTileType(x, y + 1, currentTile) &&
    !adjacentIsCliff.bottom;
  const leftTile =
    inBounds(x - 1, y) &&
    !isTileType(x - 1, y, currentTile) &&
    !adjacentIsCliff.left;
  const rightTile =
    inBounds(x + 1, y) &&
    !isTileType(x + 1, y, currentTile) &&
    !adjacentIsCliff.right;

  // Convex corners (two adjacent corner sides are non-same-tile)
  if (topTile && leftTile) draw(edge.cvxTL);
  if (topTile && rightTile) draw(edge.cvxTR);
  if (bottomTile && leftTile) draw(edge.cvxBL);
  if (bottomTile && rightTile) draw(edge.cvxBR);

  // Straight edges (only one cardinal side is non-same-tile)
  if (topTile && !leftTile && !rightTile) draw(edge.top);
  if (bottomTile && !leftTile && !rightTile) draw(edge.bottom);
  if (leftTile && !topTile && !bottomTile) draw(edge.left);
  if (rightTile && !topTile && !bottomTile) draw(edge.right);

  // Concave corners (all cardinal neighbors are same-tile, diagonal is not)
  if (
    inBounds(x - 1, y - 1) &&
    !adjacentIsCliff.leftTop &&
    !topTile &&
    !leftTile &&
    !isTileType(x - 1, y - 1, currentTile)
  )
    draw(edge.ccvTL);
  if (
    inBounds(x + 1, y - 1) &&
    !adjacentIsCliff.rightTop &&
    !topTile &&
    !rightTile &&
    !isTileType(x + 1, y - 1, currentTile)
  )
    draw(edge.ccvTR);
  if (
    inBounds(x - 1, y + 1) &&
    !adjacentIsCliff.leftBottom &&
    !bottomTile &&
    !leftTile &&
    !isTileType(x - 1, y + 1, currentTile)
  )
    draw(edge.ccvBL);
  if (
    inBounds(x + 1, y + 1) &&
    !adjacentIsCliff.rightBottom &&
    !bottomTile &&
    !rightTile &&
    !isTileType(x + 1, y + 1, currentTile)
  )
    draw(edge.ccvBR);
}

export function drawTile(ctx, type, x, y, tick) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;

  // Solid green grass base for all tiles
  ctx.fillStyle = "#8DBA64";
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  if (type === TILE.GRASS) {
    // Sprinkle small props decorations on ~20% of grass tiles
    const h = tileHash(x, y);
    if (h % 5 === 0) {
      const spritesheet = SPRITES.propsTiles;
      if (spritesheet?.complete) {
        const [sx, sy] = GRASS_DECOR[h % GRASS_DECOR.length];
        ctx.drawImage(
          spritesheet,
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
  } else if (type === TILE.PATH) {
    const spritesheet = SPRITES.grassTiles;
    if (spritesheet?.complete) {
      const [sx, sy] = PATH_TILE;
      ctx.drawImage(
        spritesheet,
        sx,
        sy,
        TILE_SIZE,
        TILE_SIZE,
        px,
        py,
        TILE_SIZE,
        TILE_SIZE,
      );
      drawEdges(
        ctx,
        spritesheet,
        px,
        py,
        x,
        y,
        TILE.PATH,
        EDGE_NO_BACKGROUND,
        0,
      );
    }
  } else if (type === TILE.WATER) {
    // Solid blue base for all water
    ctx.fillStyle = "#4C8ED7";
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
      if (y > 0 && MAP[y - 1][x] === TILE.WATERFALL)
        drawWaterfall(ctx, x, y - 1, tick);
    }
  } else if (type === TILE.RIVER) {
    const wc = SPRITES.waterfallCliff;
    if (wc?.complete) {
      const isRiver = (nx) =>
        nx >= 0 && nx < MAP_WIDTH && MAP[y][nx] === TILE.RIVER;
      const side = !isRiver(x - 1)
        ? "left"
        : !isRiver(x + 1)
          ? "right"
          : "middle";
      const frame = Math.floor(tick / 10) % RIVER.numFrames;
      const [sx, sy] = RIVER[side];
      ctx.drawImage(
        wc,
        frame * RIVER.offsetFrames + sx,
        sy,
        TILE_SIZE,
        TILE_SIZE,
        px,
        py,
        TILE_SIZE,
        TILE_SIZE,
      );
    }
  } else if (type === TILE.WATERFALL) {
    // The waterfall sprite drawn by drawWaterfall covers these tiles entirely.
    // Fill blue so any sprite transparency shows water rather than grass.
    ctx.fillStyle = "#4C8ED7";
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
  } else if (type === TILE.CLIFF) {
    drawCliff(ctx, px, py, x, y, tick);
  }
}

// Draw flat objects (flowers, fences) on top of the floor pass.
// objMap is the MAP_OBJECTS 2D array, needed for fence neighbour detection.
export function drawFlatObject(ctx, type, x, y, objMap) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;

  if (type === OBJ.FLOWER) {
    const spritesheet = SPRITES.propsTiles;
    if (spritesheet?.complete) {
      const [fx, fy] = FLOWER_SRC;
      ctx.drawImage(
        spritesheet,
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
  } else if (type === OBJ.FENCE) {
    const ft = SPRITES.fenceTiles;
    if (ft?.complete) {
      const isFence = (nx, ny) =>
        nx >= 0 &&
        nx < MAP_WIDTH &&
        ny >= 0 &&
        ny < MAP_HEIGHT &&
        objMap[ny][nx] === OBJ.FENCE;
      const Left = isFence(x - 1, y),
        Right = isFence(x + 1, y);
      const Up = isFence(x, y - 1),
        Down = isFence(x, y + 1);
      let src;
      if (!Left && Right && !Up && Down) src = FENCE.left_top_corner;
      else if (Left && !Right && !Up && Down) src = FENCE.right_top_corner;
      else if (!Left && Right && Up && !Down) src = FENCE.left_bottom_corner;
      else if (Left && !Right && Up && !Down) src = FENCE.right_bottom_corner;
      else if (!Left && Right && !Up && !Down) src = FENCE.horizontal_left_end;
      else if (Left && !Right && !Up && !Down) src = FENCE.horizontal_right_end;
      else if (Left || Right) src = FENCE.horizontal;
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
  }
}

// Draw a tree sprite at tile (x, y). Called in a post-tile pass so neighbouring
// tiles cannot paint over the sprite.
export function drawTree(ctx, x, y, spritesheet) {
  if (!spritesheet?.complete) return;
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  if (spritesheet === SPRITES.treePortal) {
    ctx.drawImage(
      spritesheet,
      TREE_PORTAL.image[0],
      TREE_PORTAL.image[1],
      TREE_PORTAL.width,
      TREE_PORTAL.height,
      px - TILE_SIZE / 2,
      py - TREE_PORTAL.height + TILE_SIZE,
      TREE_PORTAL.width,
      TREE_PORTAL.height,
    );
    return;
  }
  const src =
    spritesheet === SPRITES.cherryTreeTiles ? TREE.cherry :
    spritesheet === SPRITES.birchTreeTiles ? TREE.birch :
    spritesheet === SPRITES.pineTreeTiles ? TREE.pine :
    spritesheet === SPRITES.mapleTreeTiles ? TREE.maple :
    TREE.mahogany;
  ctx.drawImage(
    spritesheet,
    src[0],
    src[1],
    TREE.width,
    TREE.height,
    px - TILE_SIZE / 2,
    py - TREE.height + TILE_SIZE,
    TREE.width,
    TREE.height,
  );
}

function drawCliff(ctx, px, py, x, y, tick) {
  const spritesheet = SPRITES.waterfallCliff;
  if (spritesheet?.complete) {
    const isCliff = (nx, ny) =>
      nx >= 0 &&
      nx < MAP_WIDTH &&
      ny >= 0 &&
      ny < MAP_HEIGHT &&
      (MAP[ny][nx] === TILE.CLIFF ||
        MAP[ny][nx] === TILE.WATERFALL ||
        MAP[ny][nx] === TILE.RIVER);
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
            spritesheet,
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
            spritesheet,
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
            spritesheet,
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
            spritesheet,
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
        spritesheet,
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
          spritesheet,
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
          spritesheet,
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
      const left_tile = isCliff(x - 1, y),
        right_tile = isCliff(x + 1, y);
      let set, frameX;
      if (isWater(x, y + 1)) {
        ctx.fillStyle = "#4C8ED7";
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        // Animated water cliff — face row meets water
        const frame = Math.floor(tick / 20) % CLIFF_WATER_BOTTOM.numFrames;
        frameX = frame * CLIFF_WATER_BOTTOM.offsetFrames;
        set = CLIFF_WATER_BOTTOM;
      } else {
        set = CLIFF_BOTTOM;
        frameX = 0;
      }
      const [sx, sy] = !left_tile
        ? set.left
        : !right_tile
          ? set.right
          : set.middle;
      ctx.drawImage(
        spritesheet,
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

function drawWaterfall(ctx, x, bottomRow, tick) {
  const spritesheet = SPRITES.waterfallCliff;
  if (!spritesheet?.complete) return;

  const isWaterfall = (nx) =>
    nx >= 0 && nx < MAP_WIDTH && MAP[bottomRow][nx] === TILE.WATERFALL;
  const side = !isWaterfall(x - 1)
    ? "left"
    : !isWaterfall(x + 1)
      ? "right"
      : "middle";

  const frame = Math.floor(tick / 10) % WATERFALL.numFrames;
  const [sx, sy] = WATERFALL[side];
  ctx.drawImage(
    spritesheet,
    frame * WATERFALL.offsetFrames + sx,
    sy,
    TILE_SIZE,
    WATERFALL.height,
    x * TILE_SIZE,
    (bottomRow - 2) * TILE_SIZE,
    TILE_SIZE,
    WATERFALL.height,
  );
}

export function drawBuilding(ctx, buildingData) {
  const px = buildingData.x * TILE_SIZE,
    py = buildingData.y * TILE_SIZE,
    pw = buildingData.spriteWidth * TILE_SIZE,
    ph = buildingData.spriteHeight * TILE_SIZE;
  const spritesheet = SPRITES[buildingData.spriteKey];

  if (spritesheet?.complete) {
    const sx = buildingData.spriteX ?? 0,
      sy = buildingData.spriteY ?? 0;
    if (buildingData.spriteW !== undefined) {
      // Sprite sheet building: render at natural pixel size, bottom-anchored to ground level.
      // spriteW/spriteH define the source crop; hitbox is defined by x/y/w/h independently.
      const sw = buildingData.spriteW,
        sh = buildingData.spriteH;
      ctx.drawImage(
        spritesheet,
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
        spritesheet,
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
    const spritesheet = SPRITES[spriteKey];
    if (spritesheet?.complete) {
      // Cat sheet: 4 cols × 13 rows at 32×32
      // Row 0-2: Walk (down, right, up), Row 6: Sit/idle facing down
      const catRow = 5; // sitting idle — adjust if needed
      const col = Math.floor(frame) % 4;
      ctx.save();
      ctx.drawImage(
        spritesheet,
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
  const spritesheet = SPRITES[isMoving ? walkKey : idleKey] || SPRITES[idleKey];

  if (spritesheet?.complete) {
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
        spritesheet,
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
        spritesheet,
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
  const spritesheet = SPRITES.dialogBox;
  if (!spritesheet?.complete) {
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
  ctx.drawImage(spritesheet, sx, sy, c, c, x, y, c, c);
  // Top-right corner
  ctx.drawImage(spritesheet, sx + sw - c, sy, c, c, x + w - c, y, c, c);
  // Bottom-left corner
  ctx.drawImage(spritesheet, sx, sy + sh - c, c, c, x, y + h - c, c, c);
  // Bottom-right corner
  ctx.drawImage(
    spritesheet,
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
  ctx.drawImage(spritesheet, sx + c, sy, sw - 2 * c, c, x + c, y, w - 2 * c, c);
  // Bottom edge
  ctx.drawImage(
    spritesheet,
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
  ctx.drawImage(spritesheet, sx, sy + c, c, sh - 2 * c, x, y + c, c, h - 2 * c);
  // Right edge
  ctx.drawImage(
    spritesheet,
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
    spritesheet,
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
