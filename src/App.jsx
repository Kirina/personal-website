import { useEffect, useRef, useState } from "react";
import { SCALE, TILE_SIZE, VIEW_HEIGHT, VIEW_WIDTH } from "./game/constants";
import { useGameLoop } from "./game/useGameLoop";

// === MAIN COMPONENT ===
export default function RPGPortfolio() {
  const canvasRef = useRef(null);
  const [dialog, setDialog] = useState(null);
  const [prompt, setPrompt] = useState(null);
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
    dialogRef.current = dialog;
  }, [dialog]);

  // Touch controls
  const setKey = (key, val) => {
    gs.current.keys[key] = val;
  };

  useGameLoop(canvasRef, true, dialogRef, gs, promptRef, setDialog, setPrompt);

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
        position: "fixed",
        inset: 0,
        background: "#1a1a2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={VIEW_WIDTH * TILE_SIZE * SCALE}
          height={VIEW_HEIGHT * TILE_SIZE * SCALE}
          style={{
            imageRendering: "pixelated",
            maxWidth: "100vw",
            maxHeight: "100vh",
            display: "block",
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
