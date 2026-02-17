import { CHAR_SIZE, TILE, TILE_SIZE } from "./constants";
import { SPRITES } from "./sprites";

// === DRAW HELPERS ===
const shade = (hex, n) => {
  const c = [1, 3, 5].map((i) =>
    Math.max(0, Math.min(255, parseInt(hex.slice(i, i + 2), 16) + n)),
  );
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

// Tile source rects in tilesets — adjust these to match your tileset layout.
// Format: [sourceX, sourceY] in pixels within the spritesheet.
// The grass tileset uses autotile blocks (4 cols × 6 rows per terrain).
// Inner fill tiles (no edges) are at offset (1,2) within each block.
const GRASS_TILES = [
  [16, 32], // variant 1: inner fill from first autotile block
  [32, 32], // variant 2
];
// Tilled soil inner fill tile
const PATH_TILE = [16, 16];
// Water animation: 4 frames from the water tileset.
// Each autotile block is 6 tiles (96px) wide; inner fill at col offset +1.
const WATER_FRAMES = [
  [16, 16],
  [112, 16],
  [208, 16],
  [304, 16],
];
// Fence tile from fence-wood sheet (horizontal rail segment)
const FENCE_TILE = [16, 32];
// Flower position in ALL props seasons sheet (small flower cluster)
const FLOWER_SRC = [0, 0];
// Tree position in ALL props seasons sheet (small tree/bush, 16×16)
const TREE_SRC = [0, 16];

export function drawTile(ctx, type, x, y, tick) {
  const px = x * TILE_SIZE,
    py = y * TILE_SIZE;

  // Always fill a base grass color first (covers any sprite transparency)
  ctx.fillStyle = (x + y) % 2 ? "#5b8c3e" : "#528536";
  ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

  if (type === TILE.GRASS) {
    const gt = SPRITES.grassTiles;
    if (gt?.complete) {
      const [sx, sy] = GRASS_TILES[(x + y) % 2];
      ctx.drawImage(
        gt,
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
  } else if (type === TILE.FLOWER) {
    // Draw grass base from tileset
    const gt = SPRITES.grassTiles;
    if (gt?.complete) {
      const [sx, sy] = GRASS_TILES[(x + y) % 2];
      ctx.drawImage(
        gt,
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
    const pt = SPRITES.pathTiles;
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
    } else {
      ctx.fillStyle = "#c9a96e";
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    }
  } else if (type === TILE.WATER) {
    const wt = SPRITES.waterTiles;
    if (wt?.complete) {
      const frame = Math.floor(tick / 15) % WATER_FRAMES.length;
      const [sx, sy] = WATER_FRAMES[frame];
      ctx.drawImage(
        wt,
        sx,
        sy,
        TILE_SIZE,
        TILE_SIZE,
        px,
        py,
        TILE_SIZE,
        TILE_SIZE,
      );
    } else {
      ctx.fillStyle = "#3d7dca";
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      const w = Math.sin(tick * 0.06 + x * 1.5 + y) * 2;
      ctx.fillStyle = "#5a9de0";
      ctx.fillRect(px + 2 + w, py + 4, 5, 1);
      ctx.fillRect(px + 7 - w, py + 10, 5, 1);
    }
  } else if (type === TILE.TREE) {
    // Grass base already drawn; overlay tree from props sheet
    const pt = SPRITES.propsTiles;
    if (pt?.complete) {
      const [tx, ty] = TREE_SRC;
      ctx.drawImage(
        pt,
        tx,
        ty,
        TILE_SIZE,
        TILE_SIZE,
        px,
        py,
        TILE_SIZE,
        TILE_SIZE,
      );
    } else {
      ctx.fillStyle = "#6b4226";
      ctx.fillRect(px + 6, py + 9, 4, 7);
      ctx.fillStyle = "#2d7a1e";
      ctx.fillRect(px + 2, py + 2, 12, 9);
      ctx.fillStyle = "#3d8a2e";
      ctx.fillRect(px + 4, py + 1, 8, 4);
    }
  } else if (type === TILE.FENCE) {
    // Grass base already drawn; overlay fence from fence sheet
    const ft = SPRITES.fenceTiles;
    if (ft?.complete) {
      const [sx, sy] = FENCE_TILE;
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
    } else {
      ctx.fillStyle = "#c8a05a";
      ctx.fillRect(px, py + 5, TILE_SIZE, 2);
      ctx.fillRect(px, py + 10, TILE_SIZE, 2);
      ctx.fillStyle = "#a08040";
      ctx.fillRect(px + 1, py + 3, 2, 11);
      ctx.fillRect(px + 13, py + 3, 2, 11);
    }
  }
}

export function drawBuilding(ctx, b) {
  const px = b.x * TILE_SIZE,
    py = b.y * TILE_SIZE,
    pw = b.w * TILE_SIZE,
    ph = b.h * TILE_SIZE;
  const img = SPRITES[b.spriteKey];

  if (img?.complete) {
    // Draw shadow
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(px + 4, py + 4, pw, ph);
    // Draw the pre-composed building image, scaled to fit the building area.
    // Offset upward by T to allow roof overhang above the collision zone.
    ctx.drawImage(img, px, py - TILE_SIZE, pw, ph + TILE_SIZE);
  } else {
    // Fallback: procedural building (original style)
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(px + 4, py + 4, pw, ph);
    ctx.fillStyle = b.wall;
    ctx.fillRect(px, py + TILE_SIZE, pw, ph - TILE_SIZE);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(px, py + TILE_SIZE, pw, 2);
    ctx.fillRect(px, py + TILE_SIZE, 2, ph - TILE_SIZE);
    ctx.fillRect(px + pw - 2, py + TILE_SIZE, 2, ph - TILE_SIZE);
    ctx.fillStyle = b.roof;
    ctx.fillRect(px - 3, py - 2, pw + 6, TILE_SIZE + 4);
    ctx.fillStyle = shade(b.roof, -25);
    ctx.fillRect(px - 3, py - 2, pw + 6, 4);
    ctx.fillStyle = shade(b.roof, 20);
    ctx.fillRect(px - 1, py + TILE_SIZE - 1, pw + 2, 3);
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(px + pw / 2 - 5, py + ph - 14, 10, 14);
    ctx.fillStyle = "#7a5a3a";
    ctx.fillRect(px + pw / 2 - 4, py + ph - 13, 8, 12);
    ctx.fillStyle = "#ee4";
    ctx.fillRect(px + pw / 2 + 1, py + ph - 8, 2, 2);
    const wy = py + TILE_SIZE + 8;
    ctx.fillStyle = "#8ce";
    ctx.fillRect(px + 6, wy, 10, 8);
    ctx.fillRect(px + pw - 16, wy, 10, 8);
    ctx.fillStyle = "#bef";
    ctx.fillRect(px + 7, wy + 1, 4, 3);
    ctx.fillRect(px + pw - 15, wy + 1, 4, 3);
    ctx.fillStyle = "#543";
    ctx.fillRect(px + 6, wy + 4, 10, 1);
    ctx.fillRect(px + 11, wy, 1, 8);
    ctx.fillRect(px + pw - 16, wy + 4, 10, 1);
    ctx.fillRect(px + pw - 11, wy, 1, 8);
  }

  // Name label
  ctx.fillStyle = "#fff";
  ctx.font = "7px monospace";
  ctx.textAlign = "center";
  ctx.fillText(b.name, px + pw / 2, py - TILE_SIZE - 4);
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
    } else {
      // Fallback procedural cat
      const w = frame % 2;
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(x + 3, y + 13, 10, 2);
      ctx.fillStyle = "#f90";
      ctx.fillRect(x + 3, y + 6, 10, 6);
      ctx.fillRect(x + 5, y + 3, 6, 5);
      ctx.fillRect(x + 4, y + 1, 3, 3);
      ctx.fillRect(x + 9, y + 1, 3, 3);
      ctx.fillStyle = "#000";
      ctx.fillRect(x + 6, y + 5, 1, 2);
      ctx.fillRect(x + 9, y + 5, 1, 2);
      ctx.fillStyle = "#f88";
      ctx.fillRect(x + 7, y + 7, 2, 1);
      ctx.fillStyle = "#f90";
      ctx.fillRect(x + 12, y + 5 + w, 3, 2);
      ctx.fillRect(x + 4, y + 12, 2, 2 + w);
      ctx.fillRect(x + 10, y + 12, 2, 2 + (1 - w));
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
  } else {
    // Fallback procedural character
    const w = frame % 2;
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(x + 3, y + 14, 10, 2);
    ctx.fillStyle = "#346";
    if (w) {
      ctx.fillRect(x + 4, y + 11, 3, 5);
      ctx.fillRect(x + 9, y + 12, 3, 4);
    } else {
      ctx.fillRect(x + 4, y + 11, 3, 5);
      ctx.fillRect(x + 9, y + 11, 3, 5);
    }
    ctx.fillStyle = "#222";
    ctx.fillRect(x + 4, y + 14, 3, 2);
    ctx.fillRect(x + 9, y + 14, 3, 2);
    ctx.fillStyle = "#4a7";
    ctx.fillRect(x + 3, y + 6, 10, 6);
    ctx.fillRect(x + 1, y + 7 + (w ? 1 : 0), 3, 4);
    ctx.fillRect(x + 12, y + 7 + (w ? 0 : 1), 3, 4);
    ctx.fillStyle = "#f5c7a1";
    ctx.fillRect(x + 4, y + 1, 8, 6);
    ctx.fillStyle = "#543";
    ctx.fillRect(x + 3, y, 10, 3);
    if (dir === 0) {
      ctx.fillStyle = "#000";
      ctx.fillRect(x + 5, y + 3, 2, 2);
      ctx.fillRect(x + 9, y + 3, 2, 2);
    }
  }
}

export function drawFountain(ctx, tick) {
  const cx = 19 * TILE_SIZE + 8,
    cy = 12 * TILE_SIZE + 8;
  ctx.fillStyle = "#888";
  ctx.fillRect(cx - 10, cy - 8, 20, 16);
  ctx.fillStyle = "#999";
  ctx.fillRect(cx - 8, cy - 6, 16, 12);
  ctx.fillStyle = "#4a9de8";
  ctx.fillRect(cx - 6, cy - 4, 12, 8);
  const h = Math.sin(tick * 0.08) * 2;
  ctx.fillStyle = "#8cf";
  ctx.fillRect(cx - 1, cy - 8 - 4 + h, 2, 5);
  ctx.fillRect(cx - 3, cy - 8 - 2 + h, 1, 2);
  ctx.fillRect(cx + 2, cy - 8 - 2 + h, 1, 2);
  ctx.fillStyle = "#5ab";
  ctx.fillRect(cx - 5 + Math.sin(tick * 0.05) * 1, cy - 2, 4, 1);
  ctx.fillRect(cx + 2 - Math.sin(tick * 0.05) * 1, cy + 2, 3, 1);
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
