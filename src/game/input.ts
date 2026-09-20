const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "ShiftLeft",
  "ShiftRight",
  "Space",
  "Escape",
  "KeyP",
  "KeyV",
]);

function radialDeadzone(x: number, y: number, dz = 0.18) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = ((m - dz) / (1 - dz)) / m;
  return { x: x * scale, y: y * scale };
}

export class Input {
  keys = new Set<string>();
  injected: string[] | null = null;
  touchX = 0;
  touchY = 0;
  touchSprint = false;
  pausePressed = false;
  vipPressed = false;
  private prevPause = false;
  private prevVip = false;
  private attached = false;

  private onDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    this.keys.add(e.code);
    if (GAME_CODES.has(e.code)) e.preventDefault();
  };
  private onUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };
  private onBlur = () => {
    this.keys.clear();
    this.touchX = 0;
    this.touchY = 0;
    this.touchSprint = false;
  };

  attach() {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener("keydown", this.onDown);
    window.addEventListener("keyup", this.onUp);
    window.addEventListener("blur", this.onBlur);
    document.addEventListener("visibilitychange", this.onBlur);
  }

  detach() {
    if (!this.attached) return;
    this.attached = false;
    window.removeEventListener("keydown", this.onDown);
    window.removeEventListener("keyup", this.onUp);
    window.removeEventListener("blur", this.onBlur);
    document.removeEventListener("visibilitychange", this.onBlur);
  }

  setKeys(codes: string[]) {
    this.injected = codes;
  }

  clearInject() {
    this.injected = null;
  }

  private held(code: string) {
    if (this.injected) return this.injected.includes(code);
    return this.keys.has(code);
  }

  sample() {
    let x = 0;
    let y = 0;
    if (this.held("KeyA") || this.held("ArrowLeft")) x -= 1;
    if (this.held("KeyD") || this.held("ArrowRight")) x += 1;
    if (this.held("KeyW") || this.held("ArrowUp")) y -= 1;
    if (this.held("KeyS") || this.held("ArrowDown")) y += 1;

    const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : null;
    if (pads) {
      for (const p of pads) {
        if (!p || p.mapping !== "standard") continue;
        const stick = radialDeadzone(p.axes[0] ?? 0, p.axes[1] ?? 0);
        x += stick.x;
        y += stick.y;
        if (p.buttons[12]?.pressed) y -= 1;
        if (p.buttons[13]?.pressed) y += 1;
        if (p.buttons[14]?.pressed) x -= 1;
        if (p.buttons[15]?.pressed) x += 1;
        if (p.buttons[0]?.pressed || p.buttons[7]?.pressed) this.touchSprint = true;
      }
    }

    x += this.touchX;
    y += this.touchY;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }

    const sprint =
      this.held("ShiftLeft") ||
      this.held("ShiftRight") ||
      this.held("Space") ||
      this.touchSprint;

    const pauseNow = this.held("Escape") || this.held("KeyP");
    this.pausePressed = pauseNow && !this.prevPause;
    this.prevPause = pauseNow;

    const vipNow = this.held("KeyV");
    this.vipPressed = vipNow && !this.prevVip;
    this.prevVip = vipNow;

    return { x, y, sprint };
  }
}

export const input = new Input();
