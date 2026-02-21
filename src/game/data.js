import { TILE_SIZE } from "./constants";

// === BUILDINGS ===
export const BUILDINGS = [
  {
    x: 3,
    y: 3,
    w: 8,
    h: 6,
    name: "Home",
    spriteKey: "home",
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
    x: 27,
    y: 3,
    w: 8,
    h: 6,
    name: "Workshop",
    spriteKey: "workshop",
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
    w: 5,
    h: 6,
    name: "Library",
    spriteKey: "library",
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
    h: 5,
    name: "Garden",
    spriteKey: "garden",
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
