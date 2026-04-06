import { useEffect } from "react";
import {
  drawBuilding,
  drawChar,
  drawDialogBg,
  drawFlatObject,
  drawTile,
  drawTree,
} from "./draw";
import { BUILDINGS, MAP_OBJECTS, NPCS } from "./mapObjects";
import { MAP } from "./mapTextures";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  OBJ,
  OBJ_SOLID,
  PLAYER_SPEED,
  SCALE,
  SOLID,
  TILE,
  TILE_SIZE,
  TREE_PORTAL,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "./spriteConstants";
import { SPRITES } from "./spriteFiles";

export function useGameLoop(
  canvasRef,
  started,
  dialogRef,
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

    const isLand = (t) => t !== TILE.WATER && t !== TILE.WATERFALL && t !== TILE.RIVER && !SOLID.has(t);
    const isSolid = (px, py) => {
      const tx = Math.floor(px / TILE_SIZE),
        ty = Math.floor(py / TILE_SIZE);
      if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) return true;
      const tile = MAP[ty][tx];
      if (tile === TILE.WATER || tile === TILE.WATERFALL) {
        // The top edge of a water tile (land above) is walkable shore.
        const localY = py - ty * TILE_SIZE;
        if (ty > 0 && isLand(MAP[ty - 1][tx]) && localY < TILE_SIZE / 2)
          return false;
        return true;
      }
      if (tile === TILE.RIVER) {
        // All four borders are walkable up to the tile midpoint.
        const localX = px - tx * TILE_SIZE;
        const localY = py - ty * TILE_SIZE;
        const half = TILE_SIZE / 2;
        const isLandOrCliff = (t) => t !== undefined && (isLand(t) || t === TILE.CLIFF);
        if (isLandOrCliff(MAP[ty - 1]?.[tx]) && localY < half) return false;
        if (isLandOrCliff(MAP[ty + 1]?.[tx]) && localY >= half) return false;
        if (isLandOrCliff(MAP[ty]?.[tx - 1]) && localX < half) return false;
        if (isLandOrCliff(MAP[ty]?.[tx + 1]) && localX >= half) return false;
        return true;
      }
      if (tile === TILE.CLIFF) {
        // Only the top cliff tile (no cliff above it) is walkable.
        return MAP[ty - 1]?.[tx] === TILE.CLIFF;
      }
      if (SOLID.has(tile)) return true;
      if (MAP_OBJECTS[ty][tx] === OBJ.FENCE) {
        const localY = py - ty * TILE_SIZE;
        const localX = px - tx * TILE_SIZE;
        const isFence = (nx, ny) =>
          nx >= 0 &&
          nx < MAP_WIDTH &&
          ny >= 0 &&
          ny < MAP_HEIGHT &&
          MAP_OBJECTS[ny][nx] === OBJ.FENCE;
        const fenceLeft = isFence(tx - 1, ty),
          fenceRight = isFence(tx + 1, ty);
        const fenceUp = isFence(tx, ty - 1),
          fenceDown = isFence(tx, ty + 1);

        const horizontalRailY = localY >= 12 && localY <= 16;
        const verticalRailX = localX >= 3 && localX <= 12;
        const onPost = horizontalRailY && verticalRailX;
        const onRailLeft =
          fenceLeft && localX >= 0 && localX <= 8 && horizontalRailY;
        const onRailRight =
          fenceRight && localX >= 8 && localX <= 16 && horizontalRailY;
        const onRailUp =
          fenceUp && localY >= 0 && localY <= 16 && verticalRailX;
        const onRailDown =
          fenceDown && localY >= 0 && localY >= 16 && verticalRailX;
        return onPost || onRailLeft || onRailRight || onRailUp || onRailDown;
      }
      {
        // Portal sprite is drawn at anchor*TILE_SIZE - TILE_SIZE/2, spanning TREE_PORTAL.width.
        // Candidate anchors: tx-2 through tx+1 (sprite can start up to 8px into prev tile).
        let anchorTx = null;
        for (const c of [tx - 2, tx - 1, tx, tx + 1]) {
          if (c >= 0 && MAP_OBJECTS[ty]?.[c] === OBJ.TREE_PORTAL) {
            const sl = c * TILE_SIZE - TILE_SIZE / 2;
            if (px >= sl && px < sl + TREE_PORTAL.width) { anchorTx = c; break; }
          }
        }
        if (anchorTx !== null) {
          const localY = py - ty * TILE_SIZE;
          if (localY < TILE_SIZE * 0.75) return false;
          const spriteLeft = anchorTx * TILE_SIZE - TILE_SIZE / 2;
          const third = TREE_PORTAL.width / 3;
          const localX = px - spriteLeft;
          const isCentre = localX >= third && localX < third * 2;
          return !isCentre;
        }
      }
      if (OBJ_SOLID.has(MAP_OBJECTS[ty][tx])) return true;
      for (const b of BUILDINGS)
        if (
          px >= b.x * TILE_SIZE &&
          px < (b.x + b.spriteWidth) * TILE_SIZE &&
          py >= (b.y + 2) * TILE_SIZE &&
          py < (b.y + b.spriteHeight - 1) * TILE_SIZE
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

      // Flat object pass: flowers only
      for (let y = sy; y < Math.min(MAP_HEIGHT, sy + VIEW_HEIGHT + 2); y++)
        for (let x = sx; x < Math.min(MAP_WIDTH, sx + VIEW_WIDTH + 2); x++)
          if (MAP_OBJECTS[y][x] === OBJ.FLOWER)
            drawFlatObject(ctx, OBJ.FLOWER, x, y, MAP_OBJECTS);

      // Collect visible trees and fences for depth-sorted rendering
      const trees = [];
      for (let y = sy; y < Math.min(MAP_HEIGHT, sy + VIEW_HEIGHT + 2); y++)
        for (let x = sx; x < Math.min(MAP_WIDTH, sx + VIEW_WIDTH + 2); x++) {
          const obj = MAP_OBJECTS[y][x];
          if (obj === OBJ.TREE)
            trees.push({ type: "t", y: (y + 1) * TILE_SIZE, data: { x, y } });
          else if (obj === OBJ.CHERRY_TREE)
            trees.push({ type: "ct", y: (y + 1) * TILE_SIZE, data: { x, y } });
          else if (obj === OBJ.TREE_PORTAL)
            trees.push({ type: "tp", y: (y + 1) * TILE_SIZE, data: { x, y } });
          else if (obj === OBJ.FENCE)
            trees.push({ type: "f", y: (y + 1) * TILE_SIZE, data: { x, y } });
        }

      // Collect all entities and sort by Y for depth
      const entities = [
        ...BUILDINGS.map((b) => ({
          type: "b",
          y: (b.y + b.spriteHeight - 1) * TILE_SIZE,
          data: b,
        })),
        ...trees,
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
        if (e.type === "t")
          drawTree(ctx, e.data.x, e.data.y, SPRITES.mahoganyTreeTiles);
        else if (e.type === "ct")
          drawTree(ctx, e.data.x, e.data.y, SPRITES.cherryTreeTiles);
        else if (e.type === "tp")
          drawTree(ctx, e.data.x, e.data.y, SPRITES.treePortal);
        else if (e.type === "f")
          drawFlatObject(ctx, OBJ.FENCE, e.data.x, e.data.y, MAP_OBJECTS);
        else if (e.type === "b") drawBuilding(ctx, e.data);
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
