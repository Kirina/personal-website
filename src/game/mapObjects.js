import { MAP_HEIGHT, MAP_WIDTH, OBJ, TILE_SIZE } from "./spriteConstants";

// === BUILDINGS ===
export const BUILDINGS = [
  {
    x: 3,
    y: 1,
    spriteWidth: 5,
    spriteHeight: 7,
    spriteX: 16 * 5,
    spriteY: 16 * 0,
    name: "Workshop",
    spriteKey: "workshop",
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
    x: 24,
    y: 4,
    spriteWidth: 5,
    spriteHeight: 8,
    spriteX: 16 * 6,
    spriteY: 16 * 12,
    name: "Houses",
    spriteKey: "houses",
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
    x: 3,
    y: 18,
    spriteWidth: 5,
    spriteHeight: 6,
    name: "Old House",
    spriteKey: "oldHouse",
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
    spriteWidth: 7,
    spriteHeight: 5,
    spriteX: 16 * 7,
    spriteY: 16,
    name: "Trailer",
    spriteKey: "trailer",
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

// === MAP OBJECTS ===
// All objects placed on top of floor tiles: trees, flowers, fences.
// Stored as a 2D array parallel to MAP. null = no object.
export const MAP_OBJECTS = (() => {
  const m = Array.from({ length: MAP_HEIGHT }, () =>
    Array(MAP_WIDTH).fill(null),
  );
  const set = (y, x, t) => {
    if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) m[y][x] = t;
  };
  const fill = (ys, xs, t) =>
    ys.forEach((y) => xs.forEach((x) => set(y, x, t)));
  const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);

  // ── BORDERS ──────────────────────────────────────────────────────────────────
  fill([MAP_HEIGHT - 1, MAP_HEIGHT - 2], range(0, MAP_WIDTH), OBJ.TREE);
  fill(range(0, MAP_HEIGHT), [0, 1, MAP_WIDTH - 1, MAP_WIDTH - 2], OBJ.TREE);
  // Clear left-border trees where water extends to the edge (rows 11-13)
  [11, 12, 13].forEach((y) => {
    set(y, 0, null);
    set(y, 1, null);
  });

  // ── CHERRY BLOSSOM GROVE ─────────────────────────────────────────────────────
  [
    [17, 3],
    [25, 20],
    [24, 37],
  ].forEach(([y, x]) => set(y, x, OBJ.CHERRY_TREE));

  // ── DECORATIVE TREES ─────────────────────────────────────────────────────────
  [
    [15, 3],
    [16, 3],
    [22, 3],
    [25, 3],
    [26, 3],
    [15, 37],
    [16, 37],
    [22, 37],
    [25, 37],
    [26, 37],
    [16, 22],
    [16, 26],
    [22, 22],
    [22, 26],
    [25, 24],
    [26, 22],
    [2, 31],
    [2, 34],
    [3, 35],
    [3, 30],
    [2, 29],
    [0, 30],
    [0, 35],
    [1, 28],
    [1, 36],
    [2, 37],
    [3, 36],
  ].forEach(([y, x]) => set(y, x, OBJ.TREE));
  fill([0], range(19, 29), OBJ.TREE);
  set(0, 25, OBJ.BIRCH_TREE);

  // ── FLOWERS ──────────────────────────────────────────────────────────────────
  [
    [9, 25],
    [10, 25],
    [12, 20],
    [12, 25],
    [15, 4],
    [15, 8],
    [15, 20],
    [15, 25],
    [17, 8],
    [17, 9],
    [17, 26],
    [17, 27],
    [22, 8],
    [23, 8],
    [22, 26],
    [23, 26],
    [16, 15],
    [16, 17],
    [16, 23],
    [16, 27],
    [24, 17],
    [24, 25],
    [26, 17],
    [26, 25],
    [11, 23],
    [11, 25],
  ].forEach(([y, x]) => set(y, x, OBJ.FLOWER));

  // ── FARM FENCE ───────────────────────────────────────────────────────────────
  fill([19], range(9, 16), OBJ.FENCE);
  fill(range(20, 25), [15], OBJ.FENCE);
  set(19, 15, OBJ.FENCE); // top-right corner

  fill([3], [18], OBJ.FENCE);
  fill(range(3, 6), [19], OBJ.FENCE);
  fill([6], range(19, 22), OBJ.FENCE);
  // fill([6], [22], OBJ.FENCE);

  // ── TREE PORTAL ──────────────────────────────────────────────────────────────
  set(3, 32, OBJ.TREE_PORTAL);

  return m;
})();

// === NPCs ===
export const NPCS = [
  {
    x: 17 * TILE_SIZE,
    y: 13 * TILE_SIZE,
    name: "Guide",
    spriteKey: "npcGuide",
    dialog: [
      "Welcome to Portfolio Town! \u{1F3AE}",
      "Explore the buildings to learn about me \u2014 just walk up to a door and press SPACE!",
      "There are a few friendly faces around too. Say hi!",
    ],
  },
  {
    x: 34 * TILE_SIZE,
    y: 21 * TILE_SIZE,
    name: "Whiskers",
    spriteKey: "cat",
    isCat: true,
    dialog: [
      "Meow! \u{1F431}",
      "Purrr... (The owner of this town is pretty cool.)",
      "*stretches* Meow~",
    ],
  },
  {
    x: 12 * TILE_SIZE,
    y: 15 * TILE_SIZE,
    name: "Sage",
    spriteKey: "npcSage",
    dialog: [
      "Ah, a visitor! Welcome, welcome.",
      "Each building holds part of the story. The Workshop has some great projects!",
      "Take your time \u2014 there's no rush in Portfolio Town.",
    ],
  },
];
