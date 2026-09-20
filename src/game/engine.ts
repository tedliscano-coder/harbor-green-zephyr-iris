import { loadAssets, PROP_INDEX, type Atlas } from "./assets";
import { audio } from "./audio";
import { input } from "./input";
import { astar, hasLos, walkable, worldToCell } from "./pathfinding";
import { persistBest, persistVip, useGame } from "./store";
import { DEFAULT_VIP, TILE, Tile, type Level, type Mode, type VipState } from "./types";
import { generateLevel, tileName } from "./world";

type Actor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  yaw: number;
  speed: number;
  anim: number;
  dir: "down" | "left" | "right" | "up";
};

type Hunter = Actor & {
  state: "patrol" | "chase" | "search";
  path: { x: number; y: number }[];
  pathI: number;
  repath: number;
  lastSeen: { x: number; y: number } | null;
  spottedAt: number;
};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string };

type KeyItem = { x: number; y: number; taken: boolean; bob: number };

const STEP = 1 / 60;
const PLAYER_R = 10;
const HUNTER_R = 13;
const CATCH_R = 18;

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function facingFrom(dx: number, dy: number): Actor["dir"] {
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "left" : "right";
  return dy < 0 ? "up" : "down";
}

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  light: HTMLCanvasElement;
  lctx: CanvasRenderingContext2D;
  assets: Atlas | null = null;
  level: Level | null = null;
  player: Actor;
  hunters: Hunter[] = [];
  keys: KeyItem[] = [];
  collected = 0;
  mode: Mode = "title";
  vip: VipState = { ...DEFAULT_VIP, ...useGame.getState().vip, open: false };
  cam = { x: 0, y: 0 };
  shake = 0;
  time = 0;
  spottedUntil = 0;
  particles: Particle[] = [];
  running = false;
  raf = 0;
  acc = 0;
  last = 0;
  muted = false;
  preview = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("No 2D context");
    this.ctx = ctx;
    this.light = document.createElement("canvas");
    const lctx = this.light.getContext("2d");
    if (!lctx) throw new Error("No light context");
    this.lctx = lctx;
    this.player = this.makeActor(0, 0);
  }

  async boot() {
    input.attach();
    try {
      this.assets = await loadAssets();
    } catch (err) {
      console.warn("asset load", err);
    }
    this.level = generateLevel(1, 1);
    this.resetActors(this.level, true);
    this.mode = "title";
    this.bindStore();
    useGame.setState({ ready: true, mode: "title", vip: this.vip });
    this.wireControlsTest();
    this.running = true;
    this.last = performance.now();
    this.loop(this.last);
    document.addEventListener("visibilitychange", this.onVis);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    input.detach();
    document.removeEventListener("visibilitychange", this.onVis);
  }

  private onVis = () => {
    if (document.visibilityState === "visible") audio.unlock();
    else input.keys.clear();
  };

  private bindStore() {
    useGame.setState({
      play: () => this.play(),
      pause: () => this.setMode("paused"),
      resume: () => this.setMode("playing"),
      retry: () => this.startLevel(this.level?.levelNum ?? 1),
      toTitle: () => this.toTitle(),
      next: () => this.startLevel((this.level?.levelNum ?? 1) + 1),
      how: () => this.setMode("how"),
      setVip: (p) => this.setVip(p),
      skip: () => this.startLevel((this.level?.levelNum ?? 1) + 1),
      giveKeys: () => this.giveKeys(),
      teleport: () => this.teleportExit(),
    });
  }

  private setMode(mode: Mode) {
    this.mode = mode;
    useGame.setState({ mode });
  }

  private play() {
    audio.unlock();
    this.preview = false;
    this.startLevel(1);
  }

  private toTitle() {
    this.preview = true;
    this.level = generateLevel(1, 1);
    this.resetActors(this.level, true);
    this.setMode("title");
  }

  setVip(p: Partial<VipState>) {
    this.vip = { ...this.vip, ...p };
    persistVip(this.vip);
    useGame.setState({ vip: this.vip });
  }

  private giveKeys() {
    for (const k of this.keys) k.taken = true;
    this.collected = this.keys.length;
    this.syncHud();
  }

  private teleportExit() {
    if (!this.level) return;
    this.player.x = this.level.exit.x;
    this.player.y = this.level.exit.y + TILE;
  }

  startLevel(n: number) {
    audio.unlock();
    this.preview = false;
    this.level = generateLevel(Math.max(1, n));
    this.resetActors(this.level, false);
    this.collected = 0;
    this.time = 0;
    this.shake = 0;
    this.setMode("playing");
    this.syncHud();
  }

  private makeActor(x: number, y: number): Actor {
    return { x, y, vx: 0, vy: 0, yaw: 0, speed: 0, anim: 0, dir: "down" };
  }

  private resetActors(level: Level, idleHunter: boolean) {
    this.player = this.makeActor(level.playerSpawn.x, level.playerSpawn.y);
    this.hunters = level.hunterSpawns.map((s) => ({
      ...this.makeActor(s.x, s.y),
      state: idleHunter ? "patrol" : "patrol",
      path: [],
      pathI: 0,
      repath: 0,
      lastSeen: null,
      spottedAt: -99,
    }));
    this.keys = level.keys.map((k, i) => ({ x: k.x, y: k.y, taken: false, bob: i }));
    this.cam.x = this.player.x;
    this.cam.y = this.player.y;
  }

  private wireControlsTest() {
    window.__controlsTest = {
      getYaw: () => this.player.yaw,
      getSpeed: () => this.player.speed,
      setKeys: (codes: string[]) => input.setKeys(codes),
    };
  }

  private loop = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    let dt = (now - this.last) / 1000;
    this.last = now;
    dt = Math.min(dt, 0.1);
    this.acc += dt;
    let steps = 0;
    while (this.acc >= STEP && steps < 5) {
      this.step(STEP);
      this.acc -= STEP;
      steps++;
    }
    this.draw();
  };

  private step(dt: number) {
    this.resize();
    if (this.mode === "title") {
      this.time += dt;
      this.cam.x += Math.sin(this.time * 0.15) * 8 * dt;
      this.cam.y += Math.cos(this.time * 0.11) * 6 * dt;
      this.wanderPreview(dt);
      return;
    }
    if (this.mode !== "playing") {
      input.sample();
      if (input.pausePressed && this.mode === "paused") this.setMode("playing");
      return;
    }
    this.time += dt;
    const act = input.sample();
    if (input.pausePressed) {
      this.setMode("paused");
      return;
    }
    if (input.vipPressed) this.setVip({ open: !this.vip.open });

    this.movePlayer(dt, act.x, act.y, act.sprint);
    this.updateHunters(dt);
    this.updateItems();
    this.updateParticles(dt);
    this.shake *= Math.max(0, 1 - 6 * dt);

    const nearest = this.nearestHunter();
    const prox = nearest ? clamp(1 - nearest.d / 280, 0, 1) : 0;
    const spotted = this.hunters.some((h) => h.state === "chase");
    audio.setTension(prox, spotted);
    this.syncHud(prox, spotted);

    if (nearest && nearest.d < CATCH_R && !this.vip.god && !this.vip.vanish) {
      this.catchPlayer();
    }
  }

  private wanderPreview(dt: number) {
    if (!this.level) return;
    for (const h of this.hunters) {
      h.anim += dt * 4;
      if (h.repath <= 0 || !h.path.length) {
        this.pickPatrol(h);
        h.repath = 2;
      }
      h.repath -= dt;
      this.followPath(h, 40, dt);
    }
  }

  private movePlayer(dt: number, ax: number, ay: number, sprint: boolean) {
    const base = sprint ? 198 : 128;
    const spd = base * this.vip.speed;
    let vx = ax * spd;
    let vy = ay * spd;
    this.player.vx = vx;
    this.player.vy = vy;
    this.player.speed = Math.hypot(vx, vy);
    if (this.player.speed > 4) {
      this.player.yaw = Math.atan2(-vx, -vy);
      this.player.dir = facingFrom(vx, vy);
      this.player.anim += dt * (sprint ? 10 : 7);
      audio.foot(0, sprint);
      if (sprint && Math.random() < 0.4) {
        this.particles.push({
          x: this.player.x,
          y: this.player.y + 8,
          vx: -vx * 0.02,
          vy: -vy * 0.02,
          life: 0.35,
          max: 0.35,
          c: "rgba(200,190,170,0.35)",
        });
      }
    }
    this.tryMove(this.player, vx * dt, vy * dt, PLAYER_R, this.vip.noclip);
  }

  private tryMove(a: Actor, dx: number, dy: number, r: number, noclip: boolean) {
    if (!this.level) return;
    if (noclip) {
      a.x += dx;
      a.y += dy;
      return;
    }
    const nx = a.x + dx;
    if (!this.circleBlocked(nx, a.y, r)) a.x = nx;
    const ny = a.y + dy;
    if (!this.circleBlocked(a.x, ny, r)) a.y = ny;
  }

  private circleBlocked(x: number, y: number, r: number) {
    if (!this.level) return true;
    const x0 = Math.floor((x - r) / TILE);
    const y0 = Math.floor((y - r) / TILE);
    const x1 = Math.floor((x + r) / TILE);
    const y1 = Math.floor((y + r) / TILE);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (walkable(this.level, tx, ty)) continue;
        const cx = clamp(x, tx * TILE, tx * TILE + TILE);
        const cy = clamp(y, ty * TILE, ty * TILE + TILE);
        if (Math.hypot(x - cx, y - cy) < r) return true;
      }
    }
    return false;
  }

  private updateHunters(dt: number) {
    if (!this.level) return;
    const level = this.level;
    const hearR = 150 + level.levelNum * 4;
    const seeR = 210 + level.levelNum * 8;
    const huntSpd = 72 + level.levelNum * 6.2 + (this.hunters.length > 1 ? 8 : 0);

    for (const h of this.hunters) {
      if (this.vip.freeze) continue;
      const d = dist(h.x, h.y, this.player.x, this.player.y);
      const canSee =
        !this.vip.vanish &&
        d < seeR &&
        hasLos(level, h.x, h.y, this.player.x, this.player.y);
      const canHear = !this.vip.vanish && this.player.speed > 160 && d < hearR;

      if (canSee) {
        if (h.state !== "chase") {
          audio.sting();
          this.shake = Math.max(this.shake, 7);
          this.spottedUntil = this.time + 1.4;
        }
        h.state = "chase";
        h.lastSeen = { x: this.player.x, y: this.player.y };
        h.spottedAt = this.time;
      } else if (h.state === "chase" && this.time - h.spottedAt > 2.4) {
        h.state = "search";
      } else if (canHear && h.state !== "chase") {
        h.state = "search";
        h.lastSeen = { x: this.player.x, y: this.player.y };
      }

      h.repath -= dt;
      const target =
        h.state === "chase"
          ? { x: this.player.x, y: this.player.y }
          : h.state === "search" && h.lastSeen
            ? h.lastSeen
            : null;

      if (h.repath <= 0) {
        if (target) this.pathTo(h, target.x, target.y);
        else this.pickPatrol(h);
        h.repath = h.state === "chase" ? 0.28 : 0.7;
      }

      const spd = h.state === "chase" ? huntSpd : huntSpd * 0.55;
      this.followPath(h, spd, dt);

      if (h.state === "search" && h.lastSeen && dist(h.x, h.y, h.lastSeen.x, h.lastSeen.y) < 18) {
        h.state = "patrol";
        h.lastSeen = null;
      }

      h.anim += dt * (h.state === "chase" ? 9 : 5);
      if (h.speed > 4) h.dir = facingFrom(h.vx, h.vy);
    }
  }

  private pathTo(h: Hunter, x: number, y: number) {
    if (!this.level) return;
    const a = worldToCell(h.x, h.y);
    const b = worldToCell(x, y);
    const p = astar(this.level, a.tx, a.ty, b.tx, b.ty);
    h.path = p ?? [];
    h.pathI = 0;
  }

  private pickPatrol(h: Hunter) {
    if (!this.level) return;
    for (let i = 0; i < 12; i++) {
      const tx = 1 + Math.floor(Math.random() * (this.level.width - 2));
      const ty = 1 + Math.floor(Math.random() * (this.level.height - 2));
      if (!walkable(this.level, tx, ty)) continue;
      this.pathTo(h, tx * TILE + TILE / 2, ty * TILE + TILE / 2);
      if (h.path.length) return;
    }
  }

  private followPath(h: Hunter, speed: number, dt: number) {
    if (!h.path.length) {
      h.speed = 0;
      return;
    }
    if (h.pathI >= h.path.length) {
      h.path = [];
      h.speed = 0;
      return;
    }
    const n = h.path[h.pathI]!;
    const tx = n.x * TILE + TILE / 2;
    const ty = n.y * TILE + TILE / 2;
    const dx = tx - h.x;
    const dy = ty - h.y;
    const d = Math.hypot(dx, dy);
    if (d < 8) {
      h.pathI++;
      return;
    }
    h.vx = (dx / d) * speed;
    h.vy = (dy / d) * speed;
    h.speed = speed;
    this.tryMove(h, h.vx * dt, h.vy * dt, HUNTER_R, false);
  }

  private updateItems() {
    if (!this.level) return;
    for (const k of this.keys) {
      if (k.taken) continue;
      if (dist(this.player.x, this.player.y, k.x, k.y) < 20) {
        k.taken = true;
        this.collected++;
        audio.pickup();
      }
    }
    const door = this.level.props.find((p) => p.kind === "door" || p.kind === "doorOpen");
    if (door && this.collected >= this.level.keysNeeded) {
      door.kind = "doorOpen";
      if (dist(this.player.x, this.player.y, this.level.exit.x, this.level.exit.y) < 26) {
        this.escape();
      }
    }
  }

  private updateParticles(dt: number) {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx;
      p.y += p.vy;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private catchPlayer() {
    audio.caught();
    this.shake = 14;
    persistBest(this.level?.levelNum ?? 1);
    this.setMode("caught");
  }

  private escape() {
    audio.win();
    persistBest((this.level?.levelNum ?? 1) + 1);
    this.setMode("escaped");
  }

  private nearestHunter() {
    let best: { h: Hunter; d: number } | null = null;
    for (const h of this.hunters) {
      const d = dist(h.x, h.y, this.player.x, this.player.y);
      if (!best || d < best.d) best = { h, d };
    }
    return best;
  }

  private syncHud(proximity = 0, spotted = false) {
    if (!this.level) return;
    useGame.setState({
      mode: this.mode,
      level: this.level.levelNum,
      levelName: this.level.name,
      keys: this.collected,
      keysNeeded: this.level.keysNeeded,
      spotted,
      proximity,
      hunters: this.hunters.length,
      vip: this.vip,
    });
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (this.canvas.width !== Math.floor(w * dpr) || this.canvas.height !== Math.floor(h * dpr)) {
      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
      this.light.width = this.canvas.width;
      this.light.height = this.canvas.height;
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private draw() {
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    ctx.fillStyle = "#0c0a09";
    ctx.fillRect(0, 0, w, h);
    if (!this.level || !this.assets) return;

    const follow = this.mode === "title" ? this.cam : this.player;
    const tx = follow.x - w / 2 + (Math.random() - 0.5) * this.shake;
    const ty = follow.y - h / 2 + (Math.random() - 0.5) * this.shake;
    this.cam.x += (follow.x - this.cam.x) * (this.mode === "playing" ? 0.12 : 0.02);
    this.cam.y += (follow.y - this.cam.y) * (this.mode === "playing" ? 0.12 : 0.02);
    const ox = this.mode === "title" ? tx : this.cam.x - w / 2 + (Math.random() - 0.5) * this.shake;
    const oy = this.mode === "title" ? ty : this.cam.y - h / 2 + (Math.random() - 0.5) * this.shake;

    ctx.save();
    ctx.translate(-ox, -oy);
    this.drawTiles(ox, oy, w, h);
    this.drawProps();
    this.drawKeys();
    if (this.mode !== "title") this.drawActorPlayer();
    this.drawHunters();
    for (const p of this.particles) {
      ctx.globalAlpha = p.life / p.max;
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    if (this.mode === "playing" && !this.vip.lights) this.drawLight(ox, oy, w, h);
    if (this.vip.map && this.mode === "playing") this.drawMinimap(w, h);
    if (this.mode === "playing" && this.time < this.spottedUntil) {
      ctx.fillStyle = `rgba(196,92,74,${0.12 + 0.08 * Math.sin(this.time * 18)})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private drawTiles(ox: number, oy: number, vw: number, vh: number) {
    const { level, assets, ctx } = this;
    if (!level || !assets) return;
    const x0 = Math.max(0, Math.floor(ox / TILE) - 1);
    const y0 = Math.max(0, Math.floor(oy / TILE) - 1);
    const x1 = Math.min(level.width - 1, Math.ceil((ox + vw) / TILE) + 1);
    const y1 = Math.min(level.height - 1, Math.ceil((oy + vh) / TILE) + 1);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const t = level.tiles[y * level.width + x]!;
        if (t === Tile.Void) continue;
        const name = tileName(t);
        const img = assets.tiles[name] ?? assets.tiles.wood;
        if (img) ctx.drawImage(img, x * TILE, y * TILE, TILE + 0.5, TILE + 0.5);
        else {
          ctx.fillStyle = t === Tile.Wall ? "#2a2420" : "#3a3228";
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
        if (t === Tile.Wall) {
          ctx.fillStyle = "rgba(0,0,0,0.28)";
          ctx.fillRect(x * TILE, y * TILE + TILE - 6, TILE, 6);
        }
      }
    }
  }

  private drawProps() {
    const { level, assets, ctx } = this;
    if (!level || !assets) return;
    for (const p of level.props) {
      if (p.kind === "door" || p.kind === "doorOpen") {
        const img = p.kind === "doorOpen" ? assets.doorOpen : assets.door;
        ctx.drawImage(img, p.x - 18, p.y - 28, 36, 48);
        continue;
      }
      const i = PROP_INDEX[p.kind] ?? 2;
      const img = assets.props[i];
      if (img) ctx.drawImage(img, p.x - p.w / 2, p.y - p.h, p.w, p.h * 1.4);
    }
  }

  private drawKeys() {
    const { assets, ctx } = this;
    if (!assets) return;
    for (const k of this.keys) {
      if (k.taken) continue;
      const bob = Math.sin(this.time * 3 + k.bob) * 3;
      ctx.drawImage(assets.key, k.x - 10, k.y - 10 + bob, 20, 20);
      ctx.fillStyle = "rgba(212,168,72,0.25)";
      ctx.beginPath();
      ctx.arc(k.x, k.y + bob, 11, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawActorPlayer() {
    const { assets, player, ctx, vip } = this;
    if (!assets) return;
    if (vip.vanish) ctx.globalAlpha = 0.28;
    const frames = assets.player[player.dir] ?? assets.player.down;
    const i = player.speed > 8 ? Math.floor(player.anim) % 4 : 0;
    const img = frames[i] ?? frames[0]!;
    const h = 52;
    const w = (img.width / img.height) * h;
    ctx.drawImage(img, player.x - w / 2, player.y - h + 8, w, h);
    ctx.globalAlpha = 1;
  }

  private drawHunters() {
    const { assets, ctx } = this;
    if (!assets) return;
    for (const h of this.hunters) {
      const bounce = h.speed > 8 ? Math.sin(h.anim * 2.2) * 2 : 0;
      const flip = this.player.x < h.x;
      ctx.save();
      ctx.translate(h.x, h.y + bounce);
      if (flip) ctx.scale(-1, 1);
      const img = assets.oliver;
      const hh = 84;
      const hw = hh * 0.72;
      if (h.state === "chase") {
        ctx.shadowColor = "rgba(196,92,74,0.7)";
        ctx.shadowBlur = 18;
      }
      ctx.drawImage(img, -hw / 2, -hh + 10, hw, hh);
      ctx.restore();
    }
  }

  private drawLight(ox: number, oy: number, w: number, h: number) {
    if (!this.level) return;
    const l = this.lctx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    l.setTransform(dpr, 0, 0, dpr, 0, 0);
    l.clearRect(0, 0, w, h);
    const dark = clamp(0.78 + this.level.levelNum * 0.012, 0.78, 0.93);
    l.fillStyle = `rgba(4,3,4,${dark})`;
    l.fillRect(0, 0, w, h);
    const px = this.player.x - ox;
    const py = this.player.y - oy;
    const radius = Math.max(78, 168 - this.level.levelNum * 5);
    l.globalCompositeOperation = "destination-out";
    const g = l.createRadialGradient(px, py, 8, px, py, radius);
    g.addColorStop(0, "rgba(0,0,0,0.95)");
    g.addColorStop(0.45, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    l.fillStyle = g;
    l.beginPath();
    l.arc(px, py, radius, 0, Math.PI * 2);
    l.fill();

    const ang = Math.atan2(
      this.player.dir === "down" ? 1 : this.player.dir === "up" ? -1 : 0,
      this.player.dir === "right" ? 1 : this.player.dir === "left" ? -1 : 0,
    );
    l.beginPath();
    l.moveTo(px, py);
    l.arc(px, py, radius * 1.35, ang - 0.55, ang + 0.55);
    l.closePath();
    l.fillStyle = "rgba(0,0,0,0.55)";
    l.fill();

    for (const k of this.keys) {
      if (k.taken) continue;
      const x = k.x - ox;
      const y = k.y - oy;
      const kg = l.createRadialGradient(x, y, 0, x, y, 22);
      kg.addColorStop(0, "rgba(0,0,0,0.5)");
      kg.addColorStop(1, "rgba(0,0,0,0)");
      l.fillStyle = kg;
      l.beginPath();
      l.arc(x, y, 22, 0, Math.PI * 2);
      l.fill();
    }
    const dx = this.level.exit.x - ox;
    const dy = this.level.exit.y - oy;
    const eg = l.createRadialGradient(dx, dy, 0, dx, dy, 28);
    eg.addColorStop(0, "rgba(0,0,0,0.45)");
    eg.addColorStop(1, "rgba(0,0,0,0)");
    l.fillStyle = eg;
    l.beginPath();
    l.arc(dx, dy, 28, 0, Math.PI * 2);
    l.fill();

    l.globalCompositeOperation = "source-over";
    this.ctx.drawImage(this.light, 0, 0, w, h);
  }

  private drawMinimap(w: number, h: number) {
    if (!this.level) return;
    const ctx = this.ctx;
    const s = 3;
    const mw = this.level.width * s;
    const mh = this.level.height * s;
    const x = w - mw - 16;
    const y = 16;
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = "#0c0a09";
    ctx.fillRect(x - 4, y - 4, mw + 8, mh + 8);
    for (let ty = 0; ty < this.level.height; ty++) {
      for (let tx = 0; tx < this.level.width; tx++) {
        const t = this.level.tiles[ty * this.level.width + tx]!;
        ctx.fillStyle = t === Tile.Wall || t === Tile.Void ? "#1a1614" : "#4a4036";
        ctx.fillRect(x + tx * s, y + ty * s, s, s);
      }
    }
    ctx.fillStyle = "#d8d2c8";
    ctx.fillRect(x + (this.player.x / TILE) * s - 1, y + (this.player.y / TILE) * s - 1, 3, 3);
    ctx.fillStyle = "#c45c4a";
    for (const hunter of this.hunters) {
      ctx.fillRect(x + (hunter.x / TILE) * s - 1, y + (hunter.y / TILE) * s - 1, 3, 3);
    }
    ctx.globalAlpha = 1;
  }
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys: (codes: string[]) => void;
    };
  }
}
