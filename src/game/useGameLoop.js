import { useEffect } from "react";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  PLAYER_SPEED,
  SCALE,
  SOLID,
  TILE_SIZE,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "./constants";
import { BUILDINGS, NPCS } from "./data";
import {
  drawBuilding,
  drawChar,
  drawDialogBg,
  drawFountain,
  drawTile,
} from "./draw";
import { MAP } from "./map";

export function useGameLoop(
  canvasRef,
  started,
  dialogRef,
  nightRef,
  gs,
  promptRef,
  setDialog,
  setPrompt,
) {
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
      const tx = Math.floor(px / TILE_SIZE),
        ty = Math.floor(py / TILE_SIZE);
      if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) return true;
      if (SOLID.has(MAP[ty][tx])) return true;
      for (const b of BUILDINGS)
        if (
          px >= b.x * TILE_SIZE &&
          px < (b.x + b.w) * TILE_SIZE &&
          py >= b.y * TILE_SIZE &&
          py < (b.y + b.h) * TILE_SIZE
        )
          return true;
      // Fountain
      if (
        px >= 19 * TILE_SIZE - 2 &&
        px <= 20 * TILE_SIZE + 2 &&
        py >= 12 * TILE_SIZE &&
        py <= 13 * TILE_SIZE
      )
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
        const dx = cx - (b.x * TILE_SIZE + (b.w * TILE_SIZE) / 2),
          dy = cy - (b.y + b.h) * TILE_SIZE;
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
          dy = -PLAYER_SPEED;
          s.dir = 1;
        }
        if (k.ArrowDown || k.s || k.S) {
          dy = PLAYER_SPEED;
          s.dir = 0;
        }
        if (k.ArrowLeft || k.a || k.A) {
          dx = -PLAYER_SPEED;
          s.dir = 2;
        }
        if (k.ArrowRight || k.d || k.D) {
          dx = PLAYER_SPEED;
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

      const cw = canvas.width / SCALE,
        ch = canvas.height / SCALE;
      ctx.save();
      ctx.scale(SCALE, SCALE);
      let camX = Math.max(
        0,
        Math.min(MAP_WIDTH * TILE_SIZE - cw, s.px - cw / 2 + 8),
      );
      let camY = Math.max(
        0,
        Math.min(MAP_HEIGHT * TILE_SIZE - ch, s.py - ch / 2 + 8),
      );
      ctx.translate(-Math.round(camX), -Math.round(camY));

      const sx = Math.floor(camX / TILE_SIZE),
        sy = Math.floor(camY / TILE_SIZE);
      for (let y = sy; y < Math.min(MAP_HEIGHT, sy + VIEW_HEIGHT + 2); y++)
        for (let x = sx; x < Math.min(MAP_WIDTH, sx + VIEW_WIDTH + 2); x++)
          drawTile(ctx, MAP[y][x], x, y, s.tick);

      // Collect all entities and sort by Y for depth
      const entities = [
        ...BUILDINGS.map((b) => ({
          type: "b",
          y: (b.y + b.h) * TILE_SIZE,
          data: b,
        })),
        { type: "f", y: 13 * TILE_SIZE, data: null },
        ...NPCS.map((n) => ({ type: "n", y: n.y + TILE_SIZE, data: n })),
        { type: "p", y: s.py + TILE_SIZE, data: null },
      ].sort((a, b) => a.y - b.y);

      // Track if player is moving for walk animation
      const k = s.keys;
      const playerMoving =
        k.ArrowUp ||
        k.w ||
        k.W ||
        k.ArrowDown ||
        k.s ||
        k.S ||
        k.ArrowLeft ||
        k.a ||
        k.A ||
        k.ArrowRight ||
        k.d ||
        k.D;

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
}
