import { useEffect, useRef, useState } from "react";

// === SPRITE LOADER ===
const SPRITES = {};
const SPRITE_PROMISES = [];
const loadImg = (key, src) => {
  const img = new Image();
  img.src = src;
  SPRITES[key] = img;
  SPRITE_PROMISES.push(
    new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // don't block on missing assets
    }),
  );
};

// Tiles
loadImg("grassTiles", "/assets/tiles/grass-spring.png");
loadImg("waterTiles", "/assets/tiles/water-anim.png");
loadImg("pathTiles", "/assets/tiles/tilled-soil.png");
loadImg("propsTiles", "/assets/tiles/props.png");
loadImg("fenceTiles", "/assets/tiles/fence-wood.png");

// Buildings (pre-composed)
loadImg("home", "/assets/buildings/home.png");
loadImg("workshop", "/assets/buildings/workshop.png");
loadImg("library", "/assets/buildings/library.png");
loadImg("garden", "/assets/buildings/garden.png");

// Characters (32×32 per frame)
loadImg("playerIdle", "/assets/characters/player-idle.png");
loadImg("playerWalk", "/assets/characters/player-walk.png");
loadImg("npcGuideIdle", "/assets/characters/npc-guide-idle.png");
loadImg("npcSageIdle", "/assets/characters/npc-sage-idle.png");
loadImg("cat", "/assets/characters/cat.png");

// UI
loadImg("dialogBox", "/assets/ui/dialogue-box.png");

// Character sprite frame size (32×32 per frame in this pack)
const CF = 32;

// === CONFIG ===
const T = 16,
  SC = 3,
  VW = 21,
  VH = 15,
  MW = 40,
  MH = 30,
  SPD = 1.4;
const TILE = { GRASS: 0, PATH: 1, WATER: 2, FLOWER: 3, TREE: 4, FENCE: 5 };
const SOLID = new Set([TILE.WATER, TILE.TREE, TILE.FENCE]);

// === MAP ===
const MAP = (() => {
  const m = Array.from({ length: MH }, () => Array(MW).fill(0));
  const fill = (ys, xs, t) =>
    ys.forEach((y) =>
      xs.forEach((x) => {
        if (y >= 0 && y < MH && x >= 0 && x < MW) m[y][x] = t;
      }),
    );
  const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);

  // Border trees
  fill([0, 1, MH - 1, MH - 2], range(0, MW), TILE.TREE);
  fill(range(0, MH), [0, 1, MW - 1, MW - 2], TILE.TREE);

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

// === BUILDINGS ===
const BUILDINGS = [
  {
    x: 5,
    y: 4,
    w: 5,
    h: 4,
    name: "Home",
    spriteKey: "home",
    roof: "#c44",
    wall: "#e8b87a",
    content: {
      title: "\u{1F3E0} About Me",
      pages: [
        "Hi there! I'm [Your Name], a passionate developer and creative thinker based in [Location].",
        "I love building things that bring ideas to life \u2014 from web apps to game prototypes.",
        "This little town is my portfolio! Explore the buildings to learn more about me.",
      ],
    },
  },
  {
    x: 28,
    y: 4,
    w: 5,
    h: 4,
    name: "Workshop",
    spriteKey: "workshop",
    roof: "#4a8",
    wall: "#8cb4d4",
    content: {
      title: "\u{1F527} Skills & Projects",
      pages: [
        "SKILLS: JavaScript, React, Python, Node.js, TypeScript, HTML/CSS, Git, SQL, Docker.",
        "PROJECT 1: Portfolio RPG \u2014 This pixel-art portfolio website built with Canvas & React!",
        "PROJECT 2: [Project Name] \u2014 A brief description of your awesome project here.",
        "PROJECT 3: [Project Name] \u2014 Another cool thing you built. Replace this text!",
      ],
    },
  },
  {
    x: 5,
    y: 18,
    w: 5,
    h: 4,
    name: "Library",
    spriteKey: "library",
    roof: "#84c",
    wall: "#c4a8d8",
    content: {
      title: "\u{1F4DA} Education & Experience",
      pages: [
        "EDUCATION: B.S. in Computer Science, [University Name], Class of [Year].",
        "ROLE: Software Engineer at [Company] \u2014 Building scalable web applications.",
        "PREVIOUSLY: Intern at [Company] \u2014 Shipped features used by thousands of users.",
      ],
    },
  },
  {
    x: 28,
    y: 18,
    w: 5,
    h: 4,
    name: "Garden",
    spriteKey: "garden",
    roof: "#4c4",
    wall: "#a8d8a4",
    content: {
      title: "\u{1F33F} Hobbies & Contact",
      pages: [
        "When I'm not coding: [hobby 1], [hobby 2], and [hobby 3].",
        "CONTACT: email@example.com | github.com/you | linkedin.com/in/you",
        "Thanks for visiting Portfolio Town! Let's connect! \u{1F4AC}",
      ],
    },
  },
];

// === NPCs ===
const NPCS = [
  {
    x: 17 * T,
    y: 13 * T,
    name: "Guide",
    spriteKey: "npcGuide",
    hair: "#e44",
    shirt: "#44e",
    dialog: [
      "Welcome to Portfolio Town! \u{1F3AE}",
      "Explore the buildings to learn about me \u2014 just walk up to a door and press SPACE!",
      "There are a few friendly faces around too. Say hi!",
    ],
  },
  {
    x: 33 * T,
    y: 21 * T,
    name: "Whiskers",
    spriteKey: "cat",
    hair: "#f90",
    shirt: "#f90",
    isCat: true,
    dialog: [
      "Meow! \u{1F431}",
      "Purrr... (The owner of this town is pretty cool.)",
      "*stretches* Meow~",
    ],
  },
  {
    x: 12 * T,
    y: 15 * T,
    name: "Sage",
    spriteKey: "npcSage",
    hair: "#ccc",
    shirt: "#864",
    dialog: [
      "Ah, a visitor! Welcome, welcome.",
      "Each building holds part of the story. The Workshop has some great projects!",
      "Take your time \u2014 there's no rush in Portfolio Town.",
    ],
  },
];

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

function drawTile(ctx, type, x, y, tick) {
  const px = x * T,
    py = y * T;

  // Always fill a base grass color first (covers any sprite transparency)
  ctx.fillStyle = (x + y) % 2 ? "#5b8c3e" : "#528536";
  ctx.fillRect(px, py, T, T);

  if (type === TILE.GRASS) {
    const gt = SPRITES.grassTiles;
    if (gt?.complete) {
      const [sx, sy] = GRASS_TILES[(x + y) % 2];
      ctx.drawImage(gt, sx, sy, T, T, px, py, T, T);
    }
  } else if (type === TILE.FLOWER) {
    // Draw grass base from tileset
    const gt = SPRITES.grassTiles;
    if (gt?.complete) {
      const [sx, sy] = GRASS_TILES[(x + y) % 2];
      ctx.drawImage(gt, sx, sy, T, T, px, py, T, T);
    }
    // Overlay flower decoration from props sheet
    const pt = SPRITES.propsTiles;
    if (pt?.complete) {
      const [fx, fy] = FLOWER_SRC;
      ctx.drawImage(pt, fx, fy, T, T, px, py, T, T);
    }
  } else if (type === TILE.PATH) {
    const pt = SPRITES.pathTiles;
    if (pt?.complete) {
      const [sx, sy] = PATH_TILE;
      ctx.drawImage(pt, sx, sy, T, T, px, py, T, T);
    } else {
      ctx.fillStyle = "#c9a96e";
      ctx.fillRect(px, py, T, T);
    }
  } else if (type === TILE.WATER) {
    const wt = SPRITES.waterTiles;
    if (wt?.complete) {
      const frame = Math.floor(tick / 15) % WATER_FRAMES.length;
      const [sx, sy] = WATER_FRAMES[frame];
      ctx.drawImage(wt, sx, sy, T, T, px, py, T, T);
    } else {
      ctx.fillStyle = "#3d7dca";
      ctx.fillRect(px, py, T, T);
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
      ctx.drawImage(pt, tx, ty, T, T, px, py, T, T);
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
      ctx.drawImage(ft, sx, sy, T, T, px, py, T, T);
    } else {
      ctx.fillStyle = "#c8a05a";
      ctx.fillRect(px, py + 5, T, 2);
      ctx.fillRect(px, py + 10, T, 2);
      ctx.fillStyle = "#a08040";
      ctx.fillRect(px + 1, py + 3, 2, 11);
      ctx.fillRect(px + 13, py + 3, 2, 11);
    }
  }
}

function drawBuilding(ctx, b) {
  const px = b.x * T,
    py = b.y * T,
    pw = b.w * T,
    ph = b.h * T;
  const img = SPRITES[b.spriteKey];

  if (img?.complete) {
    // Draw shadow
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(px + 4, py + 4, pw, ph);
    // Draw the pre-composed building image, scaled to fit the building area.
    // Offset upward by T to allow roof overhang above the collision zone.
    ctx.drawImage(img, px, py - T, pw, ph + T);
  } else {
    // Fallback: procedural building (original style)
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(px + 4, py + 4, pw, ph);
    ctx.fillStyle = b.wall;
    ctx.fillRect(px, py + T, pw, ph - T);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(px, py + T, pw, 2);
    ctx.fillRect(px, py + T, 2, ph - T);
    ctx.fillRect(px + pw - 2, py + T, 2, ph - T);
    ctx.fillStyle = b.roof;
    ctx.fillRect(px - 3, py - 2, pw + 6, T + 4);
    ctx.fillStyle = shade(b.roof, -25);
    ctx.fillRect(px - 3, py - 2, pw + 6, 4);
    ctx.fillStyle = shade(b.roof, 20);
    ctx.fillRect(px - 1, py + T - 1, pw + 2, 3);
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(px + pw / 2 - 5, py + ph - 14, 10, 14);
    ctx.fillStyle = "#7a5a3a";
    ctx.fillRect(px + pw / 2 - 4, py + ph - 13, 8, 12);
    ctx.fillStyle = "#ee4";
    ctx.fillRect(px + pw / 2 + 1, py + ph - 8, 2, 2);
    const wy = py + T + 8;
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
  ctx.fillText(b.name, px + pw / 2, py - T - 4);
}

// Draw a character or cat using spritesheet.
// spriteKey: base key in SPRITES (e.g. "player", "npcGuide", "cat")
// For humanoids: looks up spriteKey+"Idle" or spriteKey+"Walk"
// Pack layout: Row 0 = Down, Row 1 = Right, Row 2 = Up
// Left = flip Right sprites horizontally.
// Idle: 4 frames (128/32), Walk: 6 frames (192/32). Frame size: 32×32.
function drawChar(ctx, x, y, dir, frame, spriteKey, isMoving, isCat) {
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
        col * CF,
        catRow * CF,
        CF,
        CF,
        x - 8,
        y - 16,
        CF,
        CF,
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
    const dirMap = { 0: 0, 1: 2, 2: 1, 3: 1 };
    const row = dirMap[dir];
    const flipX = dir === 2; // Left = flip Right sprites

    const maxFrames = isMoving ? 6 : 4;
    const col = Math.floor(frame) % maxFrames;

    // Draw offset: center the 32×32 sprite so feet align with the 16×16 position
    const dx = x - 8;
    const dy = y - 16;

    ctx.save();
    if (flipX) {
      ctx.translate(dx + CF, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, col * CF, row * CF, CF, CF, 0, 0, CF, CF);
    } else {
      ctx.drawImage(img, col * CF, row * CF, CF, CF, dx, dy, CF, CF);
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

function drawFountain(ctx, tick) {
  const cx = 19 * T + 8,
    cy = 12 * T + 8;
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

function drawDialogBg(ctx, x, y, w, h) {
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
  ctx.drawImage(img, sx + sw - c, sy + sh - c, c, c, x + w - c, y + h - c, c, c);
  // Top edge
  ctx.drawImage(img, sx + c, sy, sw - 2 * c, c, x + c, y, w - 2 * c, c);
  // Bottom edge
  ctx.drawImage(img, sx + c, sy + sh - c, sw - 2 * c, c, x + c, y + h - c, w - 2 * c, c);
  // Left edge
  ctx.drawImage(img, sx, sy + c, c, sh - 2 * c, x, y + c, c, h - 2 * c);
  // Right edge
  ctx.drawImage(img, sx + sw - c, sy + c, c, sh - 2 * c, x + w - c, y + c, c, h - 2 * c);
  // Center fill
  ctx.drawImage(img, sx + c, sy + c, sw - 2 * c, sh - 2 * c, x + c, y + c, w - 2 * c, h - 2 * c);
}

// === MAIN COMPONENT ===
export default function RPGPortfolio() {
  const canvasRef = useRef(null);
  const [dialog, setDialog] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [night, setNight] = useState(false);
  const [started, setStarted] = useState(false);
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const dialogRef = useRef(null);
  const nightRef = useRef(false);
  const gs = useRef({
    px: 19 * T,
    py: 11 * T,
    dir: 0,
    frame: 0,
    keys: {},
    tick: 0,
    near: null,
  });
  const promptRef = useRef(null);

  useEffect(() => {
    Promise.all(SPRITE_PROMISES).then(() => setSpritesLoaded(true));
  }, []);

  useEffect(() => {
    dialogRef.current = dialog;
  }, [dialog]);
  useEffect(() => {
    nightRef.current = night;
  }, [night]);

  // Touch controls
  const setKey = (key, val) => {
    gs.current.keys[key] = val;
  };

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const onKD = (e) => {
      gs.current.keys[e.key] = true;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      )
        e.preventDefault();
      if (
        (e.key === " " || e.key === "e" || e.key === "E") &&
        !dialogRef.current &&
        gs.current.near
      ) {
        const ent = gs.current.near;
        setDialog({
          title: ent.content?.title || ent.name,
          pages: ent.content?.pages || ent.dialog,
          page: 0,
        });
      } else if (
        (e.key === " " ||
          e.key === "e" ||
          e.key === "E" ||
          e.key === "Enter") &&
        dialogRef.current
      ) {
        const d = dialogRef.current;
        if (d.page < d.pages.length - 1) setDialog({ ...d, page: d.page + 1 });
        else setDialog(null);
      }
    };
    const onKU = (e) => {
      gs.current.keys[e.key] = false;
    };
    window.addEventListener("keydown", onKD);
    window.addEventListener("keyup", onKU);

    const isSolid = (px, py) => {
      const tx = Math.floor(px / T),
        ty = Math.floor(py / T);
      if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true;
      if (SOLID.has(MAP[ty][tx])) return true;
      for (const b of BUILDINGS)
        if (
          px >= b.x * T &&
          px < (b.x + b.w) * T &&
          py >= b.y * T &&
          py < (b.y + b.h) * T
        )
          return true;
      // Fountain
      if (px >= 19 * T - 2 && px <= 20 * T + 2 && py >= 12 * T && py <= 13 * T)
        return true;
      return false;
    };
    const canMove = (nx, ny) => {
      const hx = nx + 4,
        hy = ny + 10,
        hw = 8,
        hh = 5;
      return (
        !isSolid(hx, hy) &&
        !isSolid(hx + hw, hy) &&
        !isSolid(hx, hy + hh) &&
        !isSolid(hx + hw, hy + hh)
      );
    };
    const findNear = (px, py) => {
      const cx = px + 8,
        cy = py + 8;
      for (const b of BUILDINGS) {
        const dx = cx - (b.x * T + (b.w * T) / 2),
          dy = cy - (b.y + b.h) * T;
        if (Math.abs(dx) < 18 && dy > -4 && dy < 22) return b;
      }
      for (const n of NPCS) {
        if (Math.abs(cx - n.x - 8) < 22 && Math.abs(cy - n.y - 8) < 22)
          return n;
      }
      return null;
    };

    let aid;
    const loop = () => {
      const s = gs.current;
      s.tick++;
      if (!dialogRef.current) {
        const k = s.keys;
        let dx = 0,
          dy = 0;
        if (k.ArrowUp || k.w || k.W) {
          dy = -SPD;
          s.dir = 1;
        }
        if (k.ArrowDown || k.s || k.S) {
          dy = SPD;
          s.dir = 0;
        }
        if (k.ArrowLeft || k.a || k.A) {
          dx = -SPD;
          s.dir = 2;
        }
        if (k.ArrowRight || k.d || k.D) {
          dx = SPD;
          s.dir = 3;
        }
        if (dx && dy) {
          dx *= 0.707;
          dy *= 0.707;
        }
        if (dx && canMove(s.px + dx, s.py)) s.px += dx;
        if (dy && canMove(s.px, s.py + dy)) s.py += dy;
        if (dx || dy) {
          if (s.tick % 8 === 0) s.frame++;
        }
        const near = findNear(s.px, s.py);
        s.near = near;
        const pName = near ? near.name : null;
        if (pName !== promptRef.current) {
          promptRef.current = pName;
          setPrompt(pName);
        }
      }

      const cw = canvas.width / SC,
        ch = canvas.height / SC;
      ctx.save();
      ctx.scale(SC, SC);
      let camX = Math.max(0, Math.min(MW * T - cw, s.px - cw / 2 + 8));
      let camY = Math.max(0, Math.min(MH * T - ch, s.py - ch / 2 + 8));
      ctx.translate(-Math.round(camX), -Math.round(camY));

      const sx = Math.floor(camX / T),
        sy = Math.floor(camY / T);
      for (let y = sy; y < Math.min(MH, sy + VH + 2); y++)
        for (let x = sx; x < Math.min(MW, sx + VW + 2); x++)
          drawTile(ctx, MAP[y][x], x, y, s.tick);

      // Collect all entities and sort by Y for depth
      const entities = [
        ...BUILDINGS.map((b) => ({ type: "b", y: (b.y + b.h) * T, data: b })),
        { type: "f", y: 13 * T, data: null },
        ...NPCS.map((n) => ({ type: "n", y: n.y + T, data: n })),
        { type: "p", y: s.py + T, data: null },
      ].sort((a, b) => a.y - b.y);

      // Track if player is moving for walk animation
      const k = s.keys;
      const playerMoving =
        k.ArrowUp || k.w || k.W ||
        k.ArrowDown || k.s || k.S ||
        k.ArrowLeft || k.a || k.A ||
        k.ArrowRight || k.d || k.D;

      entities.forEach((e) => {
        if (e.type === "b") drawBuilding(ctx, e.data);
        else if (e.type === "f") drawFountain(ctx, s.tick);
        else if (e.type === "n") {
          const n = e.data,
            bob = Math.sin(s.tick * 0.04 + n.x) * 1;
          drawChar(
            ctx,
            n.x,
            n.y + bob,
            0,
            Math.floor(s.tick / 20),
            n.spriteKey,
            false,
            n.isCat,
          );
          ctx.fillStyle = "#fff";
          ctx.font = "6px monospace";
          ctx.textAlign = "center";
          ctx.fillText(n.name, n.x + 8, n.y - 4 + bob);
        } else {
          drawChar(
            ctx,
            s.px,
            s.py,
            s.dir,
            s.frame,
            "player",
            !!playerMoving,
            false,
          );
        }
      });

      if (nightRef.current) {
        ctx.fillStyle = "rgba(10,10,50,0.45)";
        ctx.fillRect(camX, camY, cw, ch);
        // Glow around player
        const grd = ctx.createRadialGradient(
          s.px + 8,
          s.py + 8,
          10,
          s.px + 8,
          s.py + 8,
          70,
        );
        grd.addColorStop(0, "rgba(255,240,180,0.18)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(s.px - 70, s.py - 70, 156, 156);
      }
      // Draw dialog box on canvas using 9-slice sprite
      if (dialogRef.current) {
        const d = dialogRef.current;
        const dlgX = camX + 8;
        const dlgY = camY + ch - 52;
        const dlgW = cw - 16;
        const dlgH = 46;
        drawDialogBg(ctx, dlgX, dlgY, dlgW, dlgH);

        // Title
        ctx.fillStyle = "#5af";
        ctx.font = "bold 7px monospace";
        ctx.textAlign = "left";
        ctx.fillText(d.title, dlgX + 10, dlgY + 11);

        // Body text
        ctx.fillStyle = "#fff";
        ctx.font = "6px monospace";
        const text = d.pages[d.page];
        // Simple word-wrap for canvas text
        const maxW = dlgW - 20;
        const words = text.split(" ");
        let line = "";
        let ly = dlgY + 22;
        for (const word of words) {
          const test = line + (line ? " " : "") + word;
          if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line, dlgX + 10, ly);
            line = word;
            ly += 8;
          } else {
            line = test;
          }
        }
        if (line) ctx.fillText(line, dlgX + 10, ly);

        // Page indicator
        ctx.fillStyle = "#888";
        ctx.font = "5px monospace";
        ctx.textAlign = "right";
        const hint =
          d.page < d.pages.length - 1 ? "SPACE to continue" : "SPACE to close";
        ctx.fillText(
          `${hint}  ${d.page + 1}/${d.pages.length}`,
          dlgX + dlgW - 10,
          dlgY + dlgH - 5,
        );
      }

      ctx.restore();
      aid = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(aid);
      window.removeEventListener("keydown", onKD);
      window.removeEventListener("keyup", onKU);
    };
  }, [started]);

  const advanceDialog = () => {
    if (!dialogRef.current) {
      if (gs.current.near) {
        const e = gs.current.near;
        setDialog({
          title: e.content?.title || e.name,
          pages: e.content?.pages || e.dialog,
          page: 0,
        });
      }
      return;
    }
    const d = dialogRef.current;
    if (d.page < d.pages.length - 1) setDialog({ ...d, page: d.page + 1 });
    else setDialog(null);
  };

  if (!started)
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          background: "#1a1a2e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: 4, marginBottom: 8 }}>
          {"\u2728"} PORTFOLIO TOWN {"\u2728"}
        </div>
        <div style={{ color: "#8af", fontSize: 14, marginBottom: 32 }}>
          A pixel-art RPG portfolio experience
        </div>
        <button
          onClick={() => spritesLoaded && setStarted(true)}
          style={{
            padding: "12px 40px",
            fontSize: 18,
            fontFamily: "monospace",
            background: spritesLoaded ? "#4a7" : "#555",
            color: "#fff",
            border: `3px solid ${spritesLoaded ? "#5b8" : "#666"}`,
            borderRadius: 8,
            cursor: spritesLoaded ? "pointer" : "wait",
            letterSpacing: 2,
          }}
        >
          {spritesLoaded ? "START GAME" : "LOADING..."}
        </button>
        <div style={{ color: "#666", fontSize: 12, marginTop: 24 }}>
          WASD / Arrows to move &middot; SPACE to interact
        </div>
      </div>
    );

  const TB = {
    background: "rgba(40,40,60,0.85)",
    border: "2px solid #5af",
    color: "#fff",
    borderRadius: 8,
    fontFamily: "monospace",
    fontSize: 22,
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
    WebkitUserSelect: "none",
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#1a1a2e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          color: "#fff8",
          fontSize: 13,
          letterSpacing: 2,
          marginBottom: 6,
        }}
      >
        {"\u2728"} PORTFOLIO TOWN {"\u2728"}
      </div>
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={VW * T * SC}
          height={VH * T * SC}
          style={{
            imageRendering: "pixelated",
            borderRadius: 4,
            border: "3px solid #333",
            maxWidth: "95vw",
            maxHeight: "70vh",
          }}
        />
        {prompt && !dialog && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.85)",
              color: "#fff",
              padding: "5px 14px",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "nowrap",
              border: "1px solid #5af",
            }}
          >
            Press SPACE to interact with {prompt}
          </div>
        )}
        {dialog && (
          <div
            onClick={advanceDialog}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              cursor: "pointer",
            }}
          />
        )}
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}
      >
        <div style={{ color: "#666", fontSize: 11 }}>
          WASD / Arrows to move &middot; SPACE to interact
        </div>
        <button
          onClick={() => setNight((n) => !n)}
          style={{
            background: "none",
            border: "1px solid #555",
            color: "#aaa",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "monospace",
          }}
        >
          {night ? "\u2600\uFE0F Day" : "\u{1F319} Night"}
        </button>
      </div>
      {/* Touch Controls */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: 16,
          display: "grid",
          gridTemplateColumns: "48px 48px 48px",
          gridTemplateRows: "48px 48px 48px",
          gap: 2,
          opacity: 0.7,
        }}
        className="touch-controls"
      >
        <div />
        <div
          style={TB}
          onTouchStart={() => setKey("w", true)}
          onTouchEnd={() => setKey("w", false)}
          onMouseDown={() => setKey("w", true)}
          onMouseUp={() => setKey("w", false)}
        >
          {"\u25B2"}
        </div>
        <div />
        <div
          style={TB}
          onTouchStart={() => setKey("a", true)}
          onTouchEnd={() => setKey("a", false)}
          onMouseDown={() => setKey("a", true)}
          onMouseUp={() => setKey("a", false)}
        >
          {"\u25C0"}
        </div>
        <div />
        <div
          style={TB}
          onTouchStart={() => setKey("d", true)}
          onTouchEnd={() => setKey("d", false)}
          onMouseDown={() => setKey("d", true)}
          onMouseUp={() => setKey("d", false)}
        >
          {"\u25B6"}
        </div>
        <div />
        <div
          style={TB}
          onTouchStart={() => setKey("s", true)}
          onTouchEnd={() => setKey("s", false)}
          onMouseDown={() => setKey("s", true)}
          onMouseUp={() => setKey("s", false)}
        >
          {"\u25BC"}
        </div>
        <div />
      </div>
      <div
        style={{ position: "fixed", bottom: 32, right: 24, opacity: 0.7 }}
        className="touch-controls"
      >
        <div
          style={{
            ...TB,
            width: 56,
            height: 56,
            fontSize: 12,
            borderRadius: 28,
            letterSpacing: 1,
          }}
          onTouchStart={advanceDialog}
          onMouseDown={advanceDialog}
        >
          ACT
        </div>
      </div>
      <style>{`@media (min-width: 769px) { .touch-controls { display: none !important; } }`}</style>
    </div>
  );
}
