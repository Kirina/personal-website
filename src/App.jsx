import { useEffect, useRef, useState } from "react";
import { SCALE, TILE_SIZE, VIEW_HEIGHT, VIEW_WIDTH } from "./game/constants";
import { SPRITE_PROMISES } from "./game/sprites";
import { useGameLoop } from "./game/useGameLoop";

// === MAIN COMPONENT ===
export default function RPGPortfolio() {
  const canvasRef = useRef(null);
  const [dialog, setDialog] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [night, setNight] = useState(false);
  const [started, setStarted] = useState(false);
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const dialogRef = useRef(null);
  const gs = useRef({
    px: 19 * TILE_SIZE,
    py: 11 * TILE_SIZE,
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

  // Touch controls
  const setKey = (key, val) => {
    gs.current.keys[key] = val;
  };

  useGameLoop(
    canvasRef,
    started,
    dialogRef,
    gs,
    promptRef,
    setDialog,
    setPrompt,
  );

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
          width={VIEW_WIDTH * TILE_SIZE * SCALE}
          height={VIEW_HEIGHT * TILE_SIZE * SCALE}
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
