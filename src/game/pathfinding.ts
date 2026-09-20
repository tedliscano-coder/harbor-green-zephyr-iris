import { TILE, Tile, type Level } from "./types";

type Node = { i: number; g: number; f: number };

class MinHeap {
  data: Node[] = [];
  push(n: Node) {
    this.data.push(n);
    this.up(this.data.length - 1);
  }
  pop(): Node | undefined {
    const { data } = this;
    if (!data.length) return;
    const top = data[0]!;
    const last = data.pop()!;
    if (data.length) {
      data[0] = last;
      this.down(0);
    }
    return top;
  }
  private up(i: number) {
    const { data } = this;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (data[p]!.f <= data[i]!.f) break;
      [data[p], data[i]] = [data[i]!, data[p]!];
      i = p;
    }
  }
  private down(i: number) {
    const { data } = this;
    for (;;) {
      let s = i;
      const l = i * 2 + 1;
      const r = l + 1;
      if (l < data.length && data[l]!.f < data[s]!.f) s = l;
      if (r < data.length && data[r]!.f < data[s]!.f) s = r;
      if (s === i) break;
      [data[s], data[i]] = [data[i]!, data[s]!];
      i = s;
    }
  }
}

export function walkable(level: Level, tx: number, ty: number) {
  if (tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) return false;
  const i = ty * level.width + tx;
  const t = level.tiles[i]!;
  if (t === Tile.Wall || t === Tile.Void) return false;
  if (level.blocked[i]) return false;
  return true;
}

export function worldToCell(x: number, y: number) {
  return { tx: Math.floor(x / TILE), ty: Math.floor(y / TILE) };
}

const DIRS: [number, number, number][] = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, 1.414],
  [1, -1, 1.414],
  [-1, 1, 1.414],
  [-1, -1, 1.414],
];

export function astar(
  level: Level,
  sx: number,
  sy: number,
  gx: number,
  gy: number,
): { x: number; y: number }[] | null {
  if (!walkable(level, gx, gy)) return null;
  if (sx === gx && sy === gy) return [{ x: gx, y: gy }];
  const w = level.width;
  const h = level.height;
  const start = sy * w + sx;
  const goal = gy * w + gx;
  const open = new MinHeap();
  const gScore = new Float32Array(w * h).fill(Infinity);
  const came = new Int32Array(w * h).fill(-1);
  gScore[start] = 0;
  open.push({ i: start, g: 0, f: octile(sx, sy, gx, gy) });
  const closed = new Uint8Array(w * h);
  let guard = 0;
  const cap = w * h;

  while (open.data.length && guard++ < cap) {
    const cur = open.pop()!;
    if (closed[cur.i]) continue;
    closed[cur.i] = 1;
    if (cur.i === goal) {
      const path: { x: number; y: number }[] = [];
      let i = goal;
      while (i !== -1) {
        path.push({ x: i % w, y: Math.floor(i / w) });
        i = came[i]!;
      }
      path.reverse();
      return path;
    }
    const cx = cur.i % w;
    const cy = Math.floor(cur.i / w);
    for (const [dx, dy, cost] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      if (!walkable(level, nx, ny)) continue;
      if (dx !== 0 && dy !== 0) {
        if (!walkable(level, cx + dx, cy) || !walkable(level, cx, cy + dy)) continue;
      }
      const ni = ny * w + nx;
      if (closed[ni]) continue;
      const g = cur.g + cost;
      if (g >= gScore[ni]!) continue;
      gScore[ni] = g;
      came[ni] = cur.i;
      open.push({ i: ni, g, f: g + octile(nx, ny, gx, gy) });
    }
  }
  return null;
}

function octile(x: number, y: number, gx: number, gy: number) {
  const dx = Math.abs(x - gx);
  const dy = Math.abs(y - gy);
  return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
}

export function hasLos(level: Level, x0: number, y0: number, x1: number, y1: number) {
  let cx = Math.floor(x0 / TILE);
  let cy = Math.floor(y0 / TILE);
  const gx = Math.floor(x1 / TILE);
  const gy = Math.floor(y1 / TILE);
  const dx = Math.abs(gx - cx);
  const dy = Math.abs(gy - cy);
  const sx = cx < gx ? 1 : -1;
  const sy = cy < gy ? 1 : -1;
  let err = dx - dy;
  const steps = dx + dy + 2;
  for (let i = 0; i < steps; i++) {
    if (!walkable(level, cx, cy) && !(cx === Math.floor(x0 / TILE) && cy === Math.floor(y0 / TILE))) {
      return false;
    }
    if (cx === gx && cy === gy) return true;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
  return true;
}
