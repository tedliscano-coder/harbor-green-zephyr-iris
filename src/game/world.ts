import { mulberry32, pick, randInt, xmur3, type Rng } from "./rng";
import { TILE, Tile, type Level, type Prop, type PropKind, type Theme, type Vec } from "./types";

export const THEMES: Theme[] = [
  { id: "house", name: "THE HOUSE", indoor: true, outdoor: false, floor: Tile.Wood, floorAlt: Tile.Carpet },
  { id: "yard", name: "THE YARD", indoor: false, outdoor: true, floor: Tile.Grass, floorAlt: Tile.Concrete },
  { id: "estate", name: "THE ESTATE", indoor: true, outdoor: true, floor: Tile.Wood, floorAlt: Tile.Grass },
  { id: "warehouse", name: "THE WAREHOUSE", indoor: true, outdoor: false, floor: Tile.Concrete, floorAlt: Tile.Asphalt },
  { id: "forest", name: "THE TREELINE", indoor: false, outdoor: true, floor: Tile.Grass, floorAlt: Tile.Wood },
  { id: "mansion", name: "THE MANSION", indoor: true, outdoor: false, floor: Tile.Carpet, floorAlt: Tile.Wood },
  { id: "lot", name: "THE LOT", indoor: false, outdoor: true, floor: Tile.Asphalt, floorAlt: Tile.Concrete },
  { id: "grounds", name: "THE GROUNDS", indoor: true, outdoor: true, floor: Tile.Carpet, floorAlt: Tile.Grass },
];

type Room = { x: number; y: number; w: number; h: number };

function idx(level: Pick<Level, "width">, x: number, y: number) {
  return y * level.width + x;
}

function setTile(level: Level, x: number, y: number, t: number) {
  if (x < 0 || y < 0 || x >= level.width || y >= level.height) return;
  level.tiles[idx(level, x, y)] = t;
}

function getTile(level: Level, x: number, y: number) {
  if (x < 0 || y < 0 || x >= level.width || y >= level.height) return Tile.Wall;
  return level.tiles[idx(level, x, y)]!;
}

function carveRoom(level: Level, r: Room, floor: number, alt: number, rng: Rng) {
  for (let y = r.y; y < r.y + r.h; y++) {
    for (let x = r.x; x < r.x + r.w; x++) {
      const edge = x === r.x || y === r.y || x === r.x + r.w - 1 || y === r.y + r.h - 1;
      if (edge) setTile(level, x, y, Tile.Wall);
      else setTile(level, x, y, rng() < 0.18 ? alt : floor);
    }
  }
}

function carveHall(level: Level, x0: number, y0: number, x1: number, y1: number, floor: number) {
  let x = x0;
  let y = y0;
  while (x !== x1) {
    setTile(level, x, y, floor);
    setTile(level, x, y - 1, getTile(level, x, y - 1) === Tile.Wall ? Tile.Wall : getTile(level, x, y - 1) || floor);
    if (getTile(level, x, y) === Tile.Wall) setTile(level, x, y, floor);
    x += x < x1 ? 1 : -1;
    setTile(level, x, y, floor);
  }
  while (y !== y1) {
    setTile(level, x, y, floor);
    y += y < y1 ? 1 : -1;
    setTile(level, x, y, floor);
  }
}

function center(r: Room): Vec {
  return {
    x: (r.x + r.w / 2) * TILE,
    y: (r.y + r.h / 2) * TILE,
  };
}

function isFloor(t: number) {
  return t !== Tile.Wall && t !== Tile.Void;
}

function flood(level: Level, sx: number, sy: number) {
  const seen = new Uint8Array(level.width * level.height);
  const q: number[] = [];
  const i0 = sy * level.width + sx;
  if (!isFloor(level.tiles[i0]!)) return seen;
  seen[i0] = 1;
  q.push(i0);
  const dirs = [1, -1, level.width, -level.width];
  while (q.length) {
    const i = q.pop()!;
    for (const d of dirs) {
      const n = i + d;
      if (n < 0 || n >= seen.length) continue;
      if (d === 1 && n % level.width === 0) continue;
      if (d === -1 && i % level.width === 0) continue;
      if (seen[n] || !isFloor(level.tiles[n]!)) continue;
      seen[n] = 1;
      q.push(n);
    }
  }
  return seen;
}

function carveTo(level: Level, ax: number, ay: number, bx: number, by: number, floor: number) {
  let x = ax;
  let y = ay;
  while (x !== bx || y !== by) {
    setTile(level, x, y, floor);
    if (x !== bx) x += x < bx ? 1 : -1;
    else if (y !== by) y += y < by ? 1 : -1;
  }
  setTile(level, bx, by, floor);
}

const INDOOR_KINDS: PropKind[] = ["lamp", "plant", "box", "chair", "bin", "nightstand", "vase", "boombox", "crate"];
const OUTDOOR_KINDS: PropKind[] = ["plant", "crate", "bin", "box", "boombox"];

function placeProp(level: Level, kind: PropKind, tx: number, ty: number, solid: boolean) {
  const p: Prop = {
    kind,
    x: tx * TILE + TILE / 2,
    y: ty * TILE + TILE / 2,
    w: kind === "crate" || kind === "box" || kind === "nightstand" ? 28 : 22,
    h: kind === "plant" ? 26 : 22,
    solid,
  };
  level.props.push(p);
  if (solid) {
    const i = ty * level.width + tx;
    if (i >= 0 && i < level.blocked.length) level.blocked[i] = 1;
  }
}

export function generateLevel(levelNum: number, seedOverride?: number): Level {
  const seed = seedOverride ?? xmur3(`rfo-${levelNum}-v3`);
  const rng = mulberry32(seed);
  const theme = THEMES[(levelNum - 1) % THEMES.length]!;
  const gw = 24 + Math.min(levelNum * 2, 28);
  const gh = 18 + Math.min(levelNum, 16);
  const keysNeeded = Math.min(1 + Math.floor((levelNum - 1) / 2), 4);
  const hunterCount = 1 + Math.floor((levelNum - 1) / 10);

  const level: Level = {
    width: gw,
    height: gh,
    tiles: new Uint8Array(gw * gh),
    blocked: new Uint8Array(gw * gh),
    theme,
    name: theme.name,
    playerSpawn: { x: TILE * 2, y: TILE * 2 },
    hunterSpawns: [],
    exit: { x: 0, y: 0 },
    keys: [],
    props: [],
    seed,
    levelNum,
    keysNeeded,
  };
  level.tiles.fill(Tile.Wall);

  const split = theme.indoor && theme.outdoor ? Math.floor(gw * 0.58) : theme.outdoor && !theme.indoor ? 0 : gw;
  const rooms: Room[] = [];

  if (theme.indoor) {
    const maxRooms = 5 + Math.min(levelNum, 8);
    const xMax = Math.max(8, split - 2);
    for (let n = 0; n < 80 && rooms.length < maxRooms; n++) {
      const w = randInt(rng, 5, 9);
      const h = randInt(rng, 5, 8);
      const x = randInt(rng, 1, Math.max(1, xMax - w - 1));
      const y = randInt(rng, 1, gh - h - 2);
      const next = { x, y, w, h };
      if (rooms.some((r) => !(next.x + next.w < r.x - 1 || next.x > r.x + r.w + 1 || next.y + next.h < r.y - 1 || next.y > r.y + r.h + 1))) {
        continue;
      }
      rooms.push(next);
      carveRoom(level, next, theme.floor, theme.floorAlt, rng);
    }
    if (!rooms.length) {
      const r = { x: 2, y: 2, w: 8, h: 7 };
      rooms.push(r);
      carveRoom(level, r, theme.floor, theme.floorAlt, rng);
    }
    for (let i = 1; i < rooms.length; i++) {
      const a = center(rooms[i - 1]!);
      const b = center(rooms[i]!);
      carveHall(level, Math.floor(a.x / TILE), Math.floor(a.y / TILE), Math.floor(b.x / TILE), Math.floor(b.y / TILE), theme.floor);
    }
    if (rooms.length > 2) {
      const a = center(rooms[0]!);
      const b = center(rooms[rooms.length - 1]!);
      carveHall(level, Math.floor(a.x / TILE), Math.floor(a.y / TILE), Math.floor(b.x / TILE), Math.floor(b.y / TILE), theme.floor);
    }
  }

  if (theme.outdoor) {
    const x0 = theme.indoor ? split : 1;
    const floor = theme.outdoor && theme.indoor ? Tile.Grass : theme.floor;
    const alt = theme.outdoor && theme.indoor ? Tile.Concrete : theme.floorAlt;
    for (let y = 1; y < gh - 1; y++) {
      for (let x = x0; x < gw - 1; x++) {
        const path = Math.abs(y - Math.floor(gh / 2)) <= 1 || Math.abs(x - x0 - 4) <= 0;
        setTile(level, x, y, path ? alt : floor);
      }
    }
    if (theme.indoor && rooms.length) {
      const doorY = Math.floor(gh / 2);
      setTile(level, split - 1, doorY, theme.floor);
      setTile(level, split, doorY, Tile.Grass);
      setTile(level, split - 1, doorY - 1, theme.floor);
      setTile(level, split, doorY - 1, Tile.Grass);
    }
  }

  // Perimeter
  for (let x = 0; x < gw; x++) {
    setTile(level, x, 0, Tile.Wall);
    setTile(level, x, gh - 1, Tile.Wall);
  }
  for (let y = 0; y < gh; y++) {
    setTile(level, 0, y, Tile.Wall);
    setTile(level, gw - 1, y, Tile.Wall);
  }

  const floors: { x: number; y: number }[] = [];
  for (let y = 1; y < gh - 1; y++) {
    for (let x = 1; x < gw - 1; x++) {
      if (isFloor(getTile(level, x, y))) floors.push({ x, y });
    }
  }

  const spawnRoom = rooms[0];
  if (spawnRoom) {
    level.playerSpawn = {
      x: (spawnRoom.x + 2) * TILE + TILE / 2,
      y: (spawnRoom.y + 2) * TILE + TILE / 2,
    };
  } else if (floors.length) {
    const s = floors[0]!;
    level.playerSpawn = { x: s.x * TILE + TILE / 2, y: s.y * TILE + TILE / 2 };
  }

  const far = [...floors].sort((a, b) => {
    const da = (a.x * TILE - level.playerSpawn.x) ** 2 + (a.y * TILE - level.playerSpawn.y) ** 2;
    const db = (b.x * TILE - level.playerSpawn.x) ** 2 + (b.y * TILE - level.playerSpawn.y) ** 2;
    return db - da;
  });

  const exitCell = far[0] ?? floors[floors.length - 1]!;
  level.exit = { x: exitCell.x * TILE + TILE / 2, y: exitCell.y * TILE + TILE / 2 };

  const used = new Set<string>([`${exitCell.x},${exitCell.y}`]);
  const keyCells = far.filter((c) => {
    const k = `${c.x},${c.y}`;
    if (used.has(k)) return false;
    const d = Math.hypot(c.x * TILE - level.playerSpawn.x, c.y * TILE - level.playerSpawn.y);
    return d > TILE * 4;
  });
  for (let i = 0; i < keysNeeded; i++) {
    const c = keyCells[Math.floor((i * keyCells.length) / Math.max(keysNeeded, 1))] ?? far[i + 1] ?? floors[0]!;
    used.add(`${c.x},${c.y}`);
    level.keys.push({ x: c.x * TILE + TILE / 2, y: c.y * TILE + TILE / 2 });
  }

  const hunterPool = far.filter((c) => Math.hypot(c.x * TILE - level.playerSpawn.x, c.y * TILE - level.playerSpawn.y) > TILE * 8);
  for (let i = 0; i < hunterCount; i++) {
    const c = hunterPool[Math.floor((i * hunterPool.length) / Math.max(hunterCount, 1))] ?? far[Math.min(3 + i, far.length - 1)]!;
    level.hunterSpawns.push({ x: c.x * TILE + TILE / 2, y: c.y * TILE + TILE / 2 });
  }
  if (!level.hunterSpawns.length && far.length) {
    const c = far[0]!;
    level.hunterSpawns.push({ x: c.x * TILE + TILE / 2, y: c.y * TILE + TILE / 2 });
  }

  // Furniture
  const kinds = theme.outdoor && !theme.indoor ? OUTDOOR_KINDS : INDOOR_KINDS;
  if (rooms.length) {
    for (const r of rooms) {
      const n = randInt(rng, 1, 3);
      for (let k = 0; k < n; k++) {
        const tx = randInt(rng, r.x + 2, r.x + r.w - 3);
        const ty = randInt(rng, r.y + 2, r.y + r.h - 3);
        if (!isFloor(getTile(level, tx, ty))) continue;
        if (Math.hypot(tx * TILE - level.playerSpawn.x, ty * TILE - level.playerSpawn.y) < TILE * 2) continue;
        const kind = pick(rng, kinds);
        placeProp(level, kind, tx, ty, kind !== "lamp" && kind !== "vase");
      }
    }
  } else {
    for (let k = 0; k < 10 + levelNum; k++) {
      const c = pick(rng, floors);
      if (Math.hypot(c.x * TILE - level.playerSpawn.x, c.y * TILE - level.playerSpawn.y) < TILE * 3) continue;
      const kind = pick(rng, OUTDOOR_KINDS);
      placeProp(level, kind, c.x, c.y, true);
    }
  }

  level.props.push({
    kind: "door",
    x: level.exit.x,
    y: level.exit.y,
    w: 28,
    h: 36,
    solid: false,
  });

  // Connectivity
  const ps = { x: Math.floor(level.playerSpawn.x / TILE), y: Math.floor(level.playerSpawn.y / TILE) };
  let seen = flood(level, ps.x, ps.y);
  const must: Vec[] = [level.exit, ...level.keys, ...level.hunterSpawns];
  for (const m of must) {
    const cx = Math.floor(m.x / TILE);
    const cy = Math.floor(m.y / TILE);
    const i = cy * gw + cx;
    if (!seen[i]) {
      carveTo(level, ps.x, ps.y, cx, cy, theme.floor);
      level.blocked[i] = 0;
    }
  }
  seen = flood(level, ps.x, ps.y);
  for (const m of must) {
    const cx = Math.floor(m.x / TILE);
    const cy = Math.floor(m.y / TILE);
    if (!seen[cy * gw + cx]) {
      carveTo(level, ps.x, ps.y, cx, cy, theme.floor);
    }
  }

  return level;
}

export function tileName(t: number): keyof Level["theme"] | string {
  switch (t) {
    case Tile.Wood:
      return "wood";
    case Tile.Grass:
      return "grass";
    case Tile.Concrete:
      return "concrete";
    case Tile.Asphalt:
      return "asphalt";
    case Tile.Carpet:
      return "carpet";
    case Tile.Wall:
      return "wall";
    default:
      return "wood";
  }
}
