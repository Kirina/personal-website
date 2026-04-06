// === SPRITE LOADER ===
export const SPRITES = {};
export const SPRITE_PROMISES = [];

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
loadImg("waterTiles", "/assets/tiles/grass-water-spring.png");
loadImg("pathTiles", "/assets/tiles/tilled-soil.png");
loadImg("waterfallCliff", "/assets/tiles/waterfall-cliff.png");

// Props
loadImg("propsTiles", "/assets/props/grass-water.png");
loadImg("mahoganyTreeTiles", "/assets/props/mahogany-tree.png");
loadImg("fenceTiles", "/assets/props/fence-wood.png");
loadImg("cherryTreeTiles", "/assets/props/cherry-tree.png");

// Buildings (pre-composed)
loadImg("home", "/assets/buildings/home.png");
loadImg("workshop", "/assets/buildings/workshop.png");
loadImg("oldHouse", "/assets/buildings/old-house.png");
loadImg("trailer", "/assets/buildings/trailer.png");
loadImg("houses", "/assets/buildings/houses.png");

// Characters (32×32 per frame)
loadImg("playerIdle", "/assets/characters/player-idle.png");
loadImg("playerWalk", "/assets/characters/player-walk.png");
loadImg("npcGuideIdle", "/assets/characters/npc-guide-idle.png");
loadImg("npcSageIdle", "/assets/characters/npc-sage-idle.png");

// Animals
loadImg("cat", "/assets/animals/cat.png");

// UI
loadImg("dialogBox", "/assets/ui/dialogue-box.png");
