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
loadImg("waterTiles", "/assets/tiles/water-anim.png");
loadImg("pathTiles", "/assets/tiles/tilled-soil.png");
loadImg("propsTiles", "/assets/tiles/props.png");
loadImg("mahoganyTreeTiles", "/assets/tiles/mahogany-tree.png");
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
