import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Snowflake, c as Map, d as Gauge, f as EyeOff, l as LockOpen, n as VolumeX, o as Shield, p as Crown, r as Volume2, s as Pause, t as Zap, u as Lightbulb } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BebgX0B8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color] duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-surface-2 text-fg border border-border hover:bg-surface",
			ghost: "text-fg hover:bg-surface-2",
			danger: "bg-danger text-fg hover:opacity-90"
		},
		size: {
			sm: "h-10 px-3 text-sm rounded-sm",
			md: "h-12 px-5 text-sm rounded-md",
			lg: "h-14 px-7 text-base rounded-md tracking-wide"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var GAME_CODES = /* @__PURE__ */ new Set([
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
	"KeyV"
]);
function radialDeadzone(x, y, dz = .18) {
	const m = Math.hypot(x, y);
	if (m < dz) return {
		x: 0,
		y: 0
	};
	const scale = (m - dz) / (1 - dz) / m;
	return {
		x: x * scale,
		y: y * scale
	};
}
var Input = class {
	keys = /* @__PURE__ */ new Set();
	injected = null;
	touchX = 0;
	touchY = 0;
	touchSprint = false;
	pausePressed = false;
	vipPressed = false;
	prevPause = false;
	prevVip = false;
	attached = false;
	onDown = (e) => {
		if (e.repeat) return;
		this.keys.add(e.code);
		if (GAME_CODES.has(e.code)) e.preventDefault();
	};
	onUp = (e) => {
		this.keys.delete(e.code);
	};
	onBlur = () => {
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
	setKeys(codes) {
		this.injected = codes;
	}
	clearInject() {
		this.injected = null;
	}
	held(code) {
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
		if (pads) for (const p of pads) {
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
		x += this.touchX;
		y += this.touchY;
		const len = Math.hypot(x, y);
		if (len > 1) {
			x /= len;
			y /= len;
		}
		const sprint = this.held("ShiftLeft") || this.held("ShiftRight") || this.held("Space") || this.touchSprint;
		const pauseNow = this.held("Escape") || this.held("KeyP");
		this.pausePressed = pauseNow && !this.prevPause;
		this.prevPause = pauseNow;
		const vipNow = this.held("KeyV");
		this.vipPressed = vipNow && !this.prevVip;
		this.prevVip = vipNow;
		return {
			x,
			y,
			sprint
		};
	}
};
var input = new Input();
var Tile = {
	Void: 0,
	Wall: 1,
	Wood: 2,
	Grass: 3,
	Concrete: 4,
	Asphalt: 5,
	Carpet: 6
};
var DEFAULT_VIP = {
	open: false,
	speed: 1,
	vanish: false,
	freeze: false,
	god: false,
	noclip: false,
	lights: false,
	map: false
};
var BEST_KEY = "rfo-best-level";
var VIP_KEY = "rfo-vip";
function loadBest() {
	try {
		return Number(localStorage.getItem(BEST_KEY) || "0") || 0;
	} catch {
		return 0;
	}
}
function loadVip() {
	try {
		const raw = localStorage.getItem(VIP_KEY);
		if (!raw) return { ...DEFAULT_VIP };
		return {
			...DEFAULT_VIP,
			...JSON.parse(raw)
		};
	} catch {
		return { ...DEFAULT_VIP };
	}
}
var useGame = create(() => ({
	ready: false,
	mode: "title",
	level: 1,
	levelName: "THE HOUSE",
	keys: 0,
	keysNeeded: 1,
	spotted: false,
	proximity: 0,
	best: loadBest(),
	hunters: 1,
	vip: loadVip(),
	play: () => {},
	pause: () => {},
	resume: () => {},
	retry: () => {},
	toTitle: () => {},
	next: () => {},
	how: () => {},
	setVip: () => {},
	skip: () => {},
	giveKeys: () => {},
	teleport: () => {}
}));
function persistBest(level) {
	const best = Math.max(level, useGame.getState().best);
	useGame.setState({ best });
	try {
		localStorage.setItem(BEST_KEY, String(best));
	} catch {}
}
function persistVip(vip) {
	try {
		localStorage.setItem(VIP_KEY, JSON.stringify(vip));
	} catch {}
}
function TouchControls() {
	const mode = useGame((s) => s.mode);
	const [touch, setTouch] = (0, import_react.useState)(false);
	const origin = (0, import_react.useRef)(null);
	const [knob, setKnob] = (0, import_react.useState)({
		x: 0,
		y: 0,
		show: false,
		cx: 0,
		cy: 0
	});
	(0, import_react.useEffect)(() => {
		const on = () => setTouch(true);
		window.addEventListener("pointerdown", (e) => {
			if (e.pointerType === "touch") on();
		});
		if ("ontouchstart" in window) setTouch(true);
		if (window.matchMedia("(pointer: coarse)").matches) setTouch(true);
	}, []);
	if (!touch || mode !== "playing") return null;
	const onDown = (e) => {
		if (e.pointerType === "mouse") return;
		origin.current = {
			id: e.pointerId,
			x: e.clientX,
			y: e.clientY
		};
		setKnob({
			x: 0,
			y: 0,
			show: true,
			cx: e.clientX,
			cy: e.clientY
		});
		e.currentTarget.setPointerCapture(e.pointerId);
	};
	const onMove = (e) => {
		if (!origin.current || e.pointerId !== origin.current.id) return;
		const dx = e.clientX - origin.current.x;
		const dy = e.clientY - origin.current.y;
		const m = Math.hypot(dx, dy);
		const max = 46;
		const k = m > max ? max / m : 1;
		const nx = dx * k / max;
		const ny = dy * k / max;
		input.touchX = nx;
		input.touchY = ny;
		setKnob((s) => ({
			...s,
			x: dx * k,
			y: dy * k
		}));
	};
	const onUp = (e) => {
		if (!origin.current || e.pointerId !== origin.current.id) return;
		origin.current = null;
		input.touchX = 0;
		input.touchY = 0;
		setKnob((s) => ({
			...s,
			show: false,
			x: 0,
			y: 0
		}));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-y-0 left-0 z-20 w-[58%]",
			style: { touchAction: "none" },
			onPointerDown: onDown,
			onPointerMove: onMove,
			onPointerUp: onUp,
			onPointerCancel: onUp
		}),
		knob.show && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute z-30 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-surface/40",
			style: {
				left: knob.cx,
				top: knob.cy
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/80",
				style: { transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute right-5 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-30 h-16 w-16 rounded-full border border-border bg-surface/80 font-display text-xs tracking-widest text-fg",
			style: { touchAction: "none" },
			onPointerDown: (e) => {
				e.stopPropagation();
				input.touchSprint = true;
			},
			onPointerUp: () => {
				input.touchSprint = false;
			},
			onPointerCancel: () => {
				input.touchSprint = false;
			},
			children: "SPRINT"
		})
	] });
}
function Row({ label, icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-center justify-between gap-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-2 text-sm text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: icon
			}), label]
		}), children]
	});
}
function Toggle({ on, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": on,
		onClick: () => onChange(!on),
		className: cn("relative h-7 w-12 rounded-full border transition-colors duration-150", on ? "bg-accent border-accent" : "bg-surface-2 border-border"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 left-0.5 size-6 rounded-full bg-fg transition-transform duration-150", on && "translate-x-5 bg-accent-fg") })
	});
}
function VipPanel() {
	const vip = useGame((s) => s.vip);
	const setVip = useGame((s) => s.setVip);
	const skip = useGame((s) => s.skip);
	const giveKeys = useGame((s) => s.giveKeys);
	const teleport = useGame((s) => s.teleport);
	const mode = useGame((s) => s.mode);
	if (!vip.open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "absolute top-16 right-3 z-30 w-[min(100%-1.5rem,20rem)] rounded-xl border border-border bg-surface/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg tracking-[0.18em] text-fg",
					children: "OWNER VIP"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Rewrite the rules. This is your house now."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-muted hover:text-fg",
					onClick: () => setVip({ open: false }),
					children: "Close"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Speed",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-4" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: .4,
						max: 4,
						step: .1,
						value: vip.speed,
						onChange: (e) => setVip({ speed: Number(e.target.value) }),
						className: "w-24 accent-accent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular w-8 text-right text-xs text-muted",
						children: [vip.speed.toFixed(1), "x"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Disappear",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: vip.vanish,
					onChange: (v) => setVip({ vanish: v })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Freeze Oliver",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "size-4" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: vip.freeze,
					onChange: (v) => setVip({ freeze: v })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Untouchable",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: vip.god,
					onChange: (v) => setVip({ god: v })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Walk through walls",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "size-4" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: vip.noclip,
					onChange: (v) => setVip({ noclip: v })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Full lights",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-4" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: vip.lights,
					onChange: (v) => setVip({ lights: v })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Show map",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-4" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: vip.map,
					onChange: (v) => setVip({ map: v })
				})
			}),
			mode === "playing" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-1 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "sm",
						onClick: giveKeys,
						children: "Take the keys"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "sm",
						onClick: teleport,
						children: "Jump to the door"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "primary",
						size: "sm",
						onClick: skip,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" }), "Skip level"]
					})
				]
			})
		]
	});
}
var GameAudio = class {
	ctx = null;
	master = null;
	music = null;
	sfx = null;
	muted = false;
	drone = null;
	droneGain = null;
	heart = null;
	lastStep = 0;
	unlock() {
		if (!this.ctx) {
			const AC = window.AudioContext || window.webkitAudioContext;
			this.ctx = new AC({ latencyHint: "interactive" });
			this.master = this.ctx.createGain();
			this.music = this.ctx.createGain();
			this.sfx = this.ctx.createGain();
			this.music.gain.value = .22;
			this.sfx.gain.value = .55;
			this.master.gain.value = this.muted ? 0 : 1;
			this.music.connect(this.master);
			this.sfx.connect(this.master);
			this.master.connect(this.ctx.destination);
			this.startDrone();
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
	}
	setMuted(m) {
		this.muted = m;
		if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, .03);
	}
	startDrone() {
		if (!this.ctx || !this.music) return;
		const osc = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		osc.type = "sawtooth";
		osc.frequency.value = 46;
		g.gain.value = .08;
		osc.connect(g);
		g.connect(this.music);
		osc.start();
		this.drone = osc;
		this.droneGain = g;
	}
	setTension(t, spotted) {
		if (!this.ctx || !this.drone || !this.droneGain) return;
		const now = this.ctx.currentTime;
		this.drone.frequency.setTargetAtTime(46 + t * 38 + (spotted ? 20 : 0), now, .12);
		this.droneGain.gain.setTargetAtTime(.06 + t * .12, now, .12);
	}
	foot(xPan, sprint) {
		if (!this.ctx || !this.sfx) return;
		const now = this.ctx.currentTime;
		const gap = sprint ? .22 : .38;
		if (now - this.lastStep < gap) return;
		this.lastStep = now;
		const buf = this.noise(.06);
		const src = this.ctx.createBufferSource();
		src.buffer = buf;
		src.playbackRate.value = .8 + Math.random() * .4;
		const g = this.ctx.createGain();
		g.gain.setValueAtTime(sprint ? .22 : .12, now);
		g.gain.exponentialRampToValueAtTime(.001, now + .08);
		const pan = this.ctx.createStereoPanner();
		pan.pan.value = Math.max(-.8, Math.min(.8, xPan));
		src.connect(g);
		g.connect(pan);
		pan.connect(this.sfx);
		src.start();
	}
	sting() {
		if (!this.ctx || !this.sfx) return;
		const now = this.ctx.currentTime;
		for (const f of [220, 233]) {
			const o = this.ctx.createOscillator();
			const g = this.ctx.createGain();
			o.type = "sawtooth";
			o.frequency.setValueAtTime(f, now);
			o.frequency.exponentialRampToValueAtTime(90, now + .4);
			g.gain.setValueAtTime(.2, now);
			g.gain.exponentialRampToValueAtTime(.001, now + .45);
			o.connect(g);
			g.connect(this.sfx);
			o.start();
			o.stop(now + .5);
		}
	}
	pickup() {
		this.blip(880, .12, "square");
	}
	win() {
		this.blip(523, .18, "triangle");
		setTimeout(() => this.blip(659, .2, "triangle"), 90);
		setTimeout(() => this.blip(784, .28, "triangle"), 180);
	}
	caught() {
		if (!this.ctx || !this.sfx) return;
		const now = this.ctx.currentTime;
		const o = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		o.type = "triangle";
		o.frequency.setValueAtTime(140, now);
		o.frequency.exponentialRampToValueAtTime(40, now + .8);
		g.gain.setValueAtTime(.28, now);
		g.gain.exponentialRampToValueAtTime(.001, now + .85);
		o.connect(g);
		g.connect(this.sfx);
		o.start();
		o.stop(now + .9);
	}
	blip(freq, dur, type) {
		if (!this.ctx || !this.sfx) return;
		const now = this.ctx.currentTime;
		const o = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		o.type = type;
		o.frequency.value = freq;
		g.gain.setValueAtTime(.16, now);
		g.gain.exponentialRampToValueAtTime(.001, now + dur);
		o.connect(g);
		g.connect(this.sfx);
		o.start();
		o.stop(now + dur + .02);
	}
	noise(dur) {
		const ctx = this.ctx;
		const n = Math.floor(ctx.sampleRate * dur);
		const buf = ctx.createBuffer(1, n, ctx.sampleRate);
		const d = buf.getChannelData(0);
		for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
		return buf;
	}
};
var audio = new GameAudio();
function load(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error(`Failed ${src}`));
		img.src = src;
	});
}
async function loadAssets() {
	const tileNames = [
		"wood",
		"grass",
		"concrete",
		"asphalt",
		"carpet",
		"wall"
	];
	const dirs = [
		"down",
		"left",
		"right",
		"up"
	];
	const tileEntries = await Promise.all(tileNames.map(async (n) => [n, await load(`/tiles/${n}.png`)]));
	const player = {};
	for (const d of dirs) player[d] = await Promise.all([
		1,
		2,
		3,
		4
	].map((i) => load(`/sprites/player/${d}-${i}.png`)));
	const props = await Promise.all([
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9
	].map((i) => load(`/props/prop-${i}.png`)));
	const [oliver, door, doorOpen, key] = await Promise.all([
		load("/sprites/oliver.png"),
		load("/sprites/door.png"),
		load("/sprites/door-open.png"),
		load("/sprites/key.png")
	]);
	const tiles = {};
	for (const [k, v] of tileEntries) tiles[k] = v;
	return {
		tiles,
		player,
		oliver,
		props,
		door,
		doorOpen,
		key
	};
}
var PROP_INDEX = {
	lamp: 0,
	plant: 1,
	box: 2,
	chair: 3,
	bin: 4,
	nightstand: 5,
	vase: 6,
	boombox: 7,
	crate: 8
};
var MinHeap = class {
	data = [];
	push(n) {
		this.data.push(n);
		this.up(this.data.length - 1);
	}
	pop() {
		const { data } = this;
		if (!data.length) return;
		const top = data[0];
		const last = data.pop();
		if (data.length) {
			data[0] = last;
			this.down(0);
		}
		return top;
	}
	up(i) {
		const { data } = this;
		while (i > 0) {
			const p = i - 1 >> 1;
			if (data[p].f <= data[i].f) break;
			[data[p], data[i]] = [data[i], data[p]];
			i = p;
		}
	}
	down(i) {
		const { data } = this;
		for (;;) {
			let s = i;
			const l = i * 2 + 1;
			const r = l + 1;
			if (l < data.length && data[l].f < data[s].f) s = l;
			if (r < data.length && data[r].f < data[s].f) s = r;
			if (s === i) break;
			[data[s], data[i]] = [data[i], data[s]];
			i = s;
		}
	}
};
function walkable(level, tx, ty) {
	if (tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) return false;
	const i = ty * level.width + tx;
	const t = level.tiles[i];
	if (t === Tile.Wall || t === Tile.Void) return false;
	if (level.blocked[i]) return false;
	return true;
}
function worldToCell(x, y) {
	return {
		tx: Math.floor(x / 32),
		ty: Math.floor(y / 32)
	};
}
var DIRS = [
	[
		1,
		0,
		1
	],
	[
		-1,
		0,
		1
	],
	[
		0,
		1,
		1
	],
	[
		0,
		-1,
		1
	],
	[
		1,
		1,
		1.414
	],
	[
		1,
		-1,
		1.414
	],
	[
		-1,
		1,
		1.414
	],
	[
		-1,
		-1,
		1.414
	]
];
function astar(level, sx, sy, gx, gy) {
	if (!walkable(level, gx, gy)) return null;
	if (sx === gx && sy === gy) return [{
		x: gx,
		y: gy
	}];
	const w = level.width;
	const h = level.height;
	const start = sy * w + sx;
	const goal = gy * w + gx;
	const open = new MinHeap();
	const gScore = new Float32Array(w * h).fill(Infinity);
	const came = new Int32Array(w * h).fill(-1);
	gScore[start] = 0;
	open.push({
		i: start,
		g: 0,
		f: octile(sx, sy, gx, gy)
	});
	const closed = new Uint8Array(w * h);
	let guard = 0;
	const cap = w * h;
	while (open.data.length && guard++ < cap) {
		const cur = open.pop();
		if (closed[cur.i]) continue;
		closed[cur.i] = 1;
		if (cur.i === goal) {
			const path = [];
			let i = goal;
			while (i !== -1) {
				path.push({
					x: i % w,
					y: Math.floor(i / w)
				});
				i = came[i];
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
			if (g >= gScore[ni]) continue;
			gScore[ni] = g;
			came[ni] = cur.i;
			open.push({
				i: ni,
				g,
				f: g + octile(nx, ny, gx, gy)
			});
		}
	}
	return null;
}
function octile(x, y, gx, gy) {
	const dx = Math.abs(x - gx);
	const dy = Math.abs(y - gy);
	return Math.max(dx, dy) + .414 * Math.min(dx, dy);
}
function hasLos(level, x0, y0, x1, y1) {
	let cx = Math.floor(x0 / 32);
	let cy = Math.floor(y0 / 32);
	const gx = Math.floor(x1 / 32);
	const gy = Math.floor(y1 / 32);
	const dx = Math.abs(gx - cx);
	const dy = Math.abs(gy - cy);
	const sx = cx < gx ? 1 : -1;
	const sy = cy < gy ? 1 : -1;
	let err = dx - dy;
	const steps = dx + dy + 2;
	for (let i = 0; i < steps; i++) {
		if (!walkable(level, cx, cy) && !(cx === Math.floor(x0 / 32) && cy === Math.floor(y0 / 32))) return false;
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
function xmur3(str) {
	let h = 1779033703 ^ str.length;
	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = h << 13 | h >>> 19;
	}
	h = Math.imul(h ^ h >>> 16, 2246822507);
	h = Math.imul(h ^ h >>> 13, 3266489909);
	return (h ^= h >>> 16) >>> 0;
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return function rand() {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function randInt(rng, min, max) {
	return min + Math.floor(rng() * (max - min + 1));
}
function pick(rng, arr) {
	return arr[Math.floor(rng() * arr.length)];
}
var THEMES = [
	{
		id: "house",
		name: "THE HOUSE",
		indoor: true,
		outdoor: false,
		floor: Tile.Wood,
		floorAlt: Tile.Carpet
	},
	{
		id: "yard",
		name: "THE YARD",
		indoor: false,
		outdoor: true,
		floor: Tile.Grass,
		floorAlt: Tile.Concrete
	},
	{
		id: "estate",
		name: "THE ESTATE",
		indoor: true,
		outdoor: true,
		floor: Tile.Wood,
		floorAlt: Tile.Grass
	},
	{
		id: "warehouse",
		name: "THE WAREHOUSE",
		indoor: true,
		outdoor: false,
		floor: Tile.Concrete,
		floorAlt: Tile.Asphalt
	},
	{
		id: "forest",
		name: "THE TREELINE",
		indoor: false,
		outdoor: true,
		floor: Tile.Grass,
		floorAlt: Tile.Wood
	},
	{
		id: "mansion",
		name: "THE MANSION",
		indoor: true,
		outdoor: false,
		floor: Tile.Carpet,
		floorAlt: Tile.Wood
	},
	{
		id: "lot",
		name: "THE LOT",
		indoor: false,
		outdoor: true,
		floor: Tile.Asphalt,
		floorAlt: Tile.Concrete
	},
	{
		id: "grounds",
		name: "THE GROUNDS",
		indoor: true,
		outdoor: true,
		floor: Tile.Carpet,
		floorAlt: Tile.Grass
	}
];
function idx(level, x, y) {
	return y * level.width + x;
}
function setTile(level, x, y, t) {
	if (x < 0 || y < 0 || x >= level.width || y >= level.height) return;
	level.tiles[idx(level, x, y)] = t;
}
function getTile(level, x, y) {
	if (x < 0 || y < 0 || x >= level.width || y >= level.height) return Tile.Wall;
	return level.tiles[idx(level, x, y)];
}
function carveRoom(level, r, floor, alt, rng) {
	for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (x === r.x || y === r.y || x === r.x + r.w - 1 || y === r.y + r.h - 1) setTile(level, x, y, Tile.Wall);
	else setTile(level, x, y, rng() < .18 ? alt : floor);
}
function carveHall(level, x0, y0, x1, y1, floor) {
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
function center(r) {
	return {
		x: (r.x + r.w / 2) * 32,
		y: (r.y + r.h / 2) * 32
	};
}
function isFloor(t) {
	return t !== Tile.Wall && t !== Tile.Void;
}
function flood(level, sx, sy) {
	const seen = new Uint8Array(level.width * level.height);
	const q = [];
	const i0 = sy * level.width + sx;
	if (!isFloor(level.tiles[i0])) return seen;
	seen[i0] = 1;
	q.push(i0);
	const dirs = [
		1,
		-1,
		level.width,
		-level.width
	];
	while (q.length) {
		const i = q.pop();
		for (const d of dirs) {
			const n = i + d;
			if (n < 0 || n >= seen.length) continue;
			if (d === 1 && n % level.width === 0) continue;
			if (d === -1 && i % level.width === 0) continue;
			if (seen[n] || !isFloor(level.tiles[n])) continue;
			seen[n] = 1;
			q.push(n);
		}
	}
	return seen;
}
function carveTo(level, ax, ay, bx, by, floor) {
	let x = ax;
	let y = ay;
	while (x !== bx || y !== by) {
		setTile(level, x, y, floor);
		if (x !== bx) x += x < bx ? 1 : -1;
		else if (y !== by) y += y < by ? 1 : -1;
	}
	setTile(level, bx, by, floor);
}
var INDOOR_KINDS = [
	"lamp",
	"plant",
	"box",
	"chair",
	"bin",
	"nightstand",
	"vase",
	"boombox",
	"crate"
];
var OUTDOOR_KINDS = [
	"plant",
	"crate",
	"bin",
	"box",
	"boombox"
];
function placeProp(level, kind, tx, ty, solid) {
	const p = {
		kind,
		x: tx * 32 + 16,
		y: ty * 32 + 16,
		w: kind === "crate" || kind === "box" || kind === "nightstand" ? 28 : 22,
		h: kind === "plant" ? 26 : 22,
		solid
	};
	level.props.push(p);
	if (solid) {
		const i = ty * level.width + tx;
		if (i >= 0 && i < level.blocked.length) level.blocked[i] = 1;
	}
}
function generateLevel(levelNum, seedOverride) {
	const seed = seedOverride ?? xmur3(`rfo-${levelNum}-v3`);
	const rng = mulberry32(seed);
	const theme = THEMES[(levelNum - 1) % THEMES.length];
	const gw = 24 + Math.min(levelNum * 2, 28);
	const gh = 18 + Math.min(levelNum, 16);
	const keysNeeded = Math.min(1 + Math.floor((levelNum - 1) / 2), 4);
	const hunterCount = 1 + Math.floor((levelNum - 1) / 10);
	const level = {
		width: gw,
		height: gh,
		tiles: new Uint8Array(gw * gh),
		blocked: new Uint8Array(gw * gh),
		theme,
		name: theme.name,
		playerSpawn: {
			x: 64,
			y: 64
		},
		hunterSpawns: [],
		exit: {
			x: 0,
			y: 0
		},
		keys: [],
		props: [],
		seed,
		levelNum,
		keysNeeded
	};
	level.tiles.fill(Tile.Wall);
	const split = theme.indoor && theme.outdoor ? Math.floor(gw * .58) : theme.outdoor && !theme.indoor ? 0 : gw;
	const rooms = [];
	if (theme.indoor) {
		const maxRooms = 5 + Math.min(levelNum, 8);
		const xMax = Math.max(8, split - 2);
		for (let n = 0; n < 80 && rooms.length < maxRooms; n++) {
			const w = randInt(rng, 5, 9);
			const h = randInt(rng, 5, 8);
			const next = {
				x: randInt(rng, 1, Math.max(1, xMax - w - 1)),
				y: randInt(rng, 1, gh - h - 2),
				w,
				h
			};
			if (rooms.some((r) => !(next.x + next.w < r.x - 1 || next.x > r.x + r.w + 1 || next.y + next.h < r.y - 1 || next.y > r.y + r.h + 1))) continue;
			rooms.push(next);
			carveRoom(level, next, theme.floor, theme.floorAlt, rng);
		}
		if (!rooms.length) {
			const r = {
				x: 2,
				y: 2,
				w: 8,
				h: 7
			};
			rooms.push(r);
			carveRoom(level, r, theme.floor, theme.floorAlt, rng);
		}
		for (let i = 1; i < rooms.length; i++) {
			const a = center(rooms[i - 1]);
			const b = center(rooms[i]);
			carveHall(level, Math.floor(a.x / 32), Math.floor(a.y / 32), Math.floor(b.x / 32), Math.floor(b.y / 32), theme.floor);
		}
		if (rooms.length > 2) {
			const a = center(rooms[0]);
			const b = center(rooms[rooms.length - 1]);
			carveHall(level, Math.floor(a.x / 32), Math.floor(a.y / 32), Math.floor(b.x / 32), Math.floor(b.y / 32), theme.floor);
		}
	}
	if (theme.outdoor) {
		const x0 = theme.indoor ? split : 1;
		const floor = theme.outdoor && theme.indoor ? Tile.Grass : theme.floor;
		const alt = theme.outdoor && theme.indoor ? Tile.Concrete : theme.floorAlt;
		for (let y = 1; y < gh - 1; y++) for (let x = x0; x < gw - 1; x++) {
			const path = Math.abs(y - Math.floor(gh / 2)) <= 1 || Math.abs(x - x0 - 4) <= 0;
			setTile(level, x, y, path ? alt : floor);
		}
		if (theme.indoor && rooms.length) {
			const doorY = Math.floor(gh / 2);
			setTile(level, split - 1, doorY, theme.floor);
			setTile(level, split, doorY, Tile.Grass);
			setTile(level, split - 1, doorY - 1, theme.floor);
			setTile(level, split, doorY - 1, Tile.Grass);
		}
	}
	for (let x = 0; x < gw; x++) {
		setTile(level, x, 0, Tile.Wall);
		setTile(level, x, gh - 1, Tile.Wall);
	}
	for (let y = 0; y < gh; y++) {
		setTile(level, 0, y, Tile.Wall);
		setTile(level, gw - 1, y, Tile.Wall);
	}
	const floors = [];
	for (let y = 1; y < gh - 1; y++) for (let x = 1; x < gw - 1; x++) if (isFloor(getTile(level, x, y))) floors.push({
		x,
		y
	});
	const spawnRoom = rooms[0];
	if (spawnRoom) level.playerSpawn = {
		x: (spawnRoom.x + 2) * 32 + 16,
		y: (spawnRoom.y + 2) * 32 + 16
	};
	else if (floors.length) {
		const s = floors[0];
		level.playerSpawn = {
			x: s.x * 32 + 16,
			y: s.y * 32 + 16
		};
	}
	const far = [...floors].sort((a, b) => {
		const da = (a.x * 32 - level.playerSpawn.x) ** 2 + (a.y * 32 - level.playerSpawn.y) ** 2;
		return (b.x * 32 - level.playerSpawn.x) ** 2 + (b.y * 32 - level.playerSpawn.y) ** 2 - da;
	});
	const exitCell = far[0] ?? floors[floors.length - 1];
	level.exit = {
		x: exitCell.x * 32 + 16,
		y: exitCell.y * 32 + 16
	};
	const used = /* @__PURE__ */ new Set([`${exitCell.x},${exitCell.y}`]);
	const keyCells = far.filter((c) => {
		const k = `${c.x},${c.y}`;
		if (used.has(k)) return false;
		return Math.hypot(c.x * 32 - level.playerSpawn.x, c.y * 32 - level.playerSpawn.y) > 128;
	});
	for (let i = 0; i < keysNeeded; i++) {
		const c = keyCells[Math.floor(i * keyCells.length / Math.max(keysNeeded, 1))] ?? far[i + 1] ?? floors[0];
		used.add(`${c.x},${c.y}`);
		level.keys.push({
			x: c.x * 32 + 16,
			y: c.y * 32 + 16
		});
	}
	const hunterPool = far.filter((c) => Math.hypot(c.x * 32 - level.playerSpawn.x, c.y * 32 - level.playerSpawn.y) > 256);
	for (let i = 0; i < hunterCount; i++) {
		const c = hunterPool[Math.floor(i * hunterPool.length / Math.max(hunterCount, 1))] ?? far[Math.min(3 + i, far.length - 1)];
		level.hunterSpawns.push({
			x: c.x * 32 + 16,
			y: c.y * 32 + 16
		});
	}
	if (!level.hunterSpawns.length && far.length) {
		const c = far[0];
		level.hunterSpawns.push({
			x: c.x * 32 + 16,
			y: c.y * 32 + 16
		});
	}
	const kinds = theme.outdoor && !theme.indoor ? OUTDOOR_KINDS : INDOOR_KINDS;
	if (rooms.length) for (const r of rooms) {
		const n = randInt(rng, 1, 3);
		for (let k = 0; k < n; k++) {
			const tx = randInt(rng, r.x + 2, r.x + r.w - 3);
			const ty = randInt(rng, r.y + 2, r.y + r.h - 3);
			if (!isFloor(getTile(level, tx, ty))) continue;
			if (Math.hypot(tx * 32 - level.playerSpawn.x, ty * 32 - level.playerSpawn.y) < 64) continue;
			const kind = pick(rng, kinds);
			placeProp(level, kind, tx, ty, kind !== "lamp" && kind !== "vase");
		}
	}
	else for (let k = 0; k < 10 + levelNum; k++) {
		const c = pick(rng, floors);
		if (Math.hypot(c.x * 32 - level.playerSpawn.x, c.y * 32 - level.playerSpawn.y) < 96) continue;
		placeProp(level, pick(rng, OUTDOOR_KINDS), c.x, c.y, true);
	}
	level.props.push({
		kind: "door",
		x: level.exit.x,
		y: level.exit.y,
		w: 28,
		h: 36,
		solid: false
	});
	const ps = {
		x: Math.floor(level.playerSpawn.x / 32),
		y: Math.floor(level.playerSpawn.y / 32)
	};
	let seen = flood(level, ps.x, ps.y);
	const must = [
		level.exit,
		...level.keys,
		...level.hunterSpawns
	];
	for (const m of must) {
		const cx = Math.floor(m.x / 32);
		const cy = Math.floor(m.y / 32);
		const i = cy * gw + cx;
		if (!seen[i]) {
			carveTo(level, ps.x, ps.y, cx, cy, theme.floor);
			level.blocked[i] = 0;
		}
	}
	seen = flood(level, ps.x, ps.y);
	for (const m of must) {
		const cx = Math.floor(m.x / 32);
		const cy = Math.floor(m.y / 32);
		if (!seen[cy * gw + cx]) carveTo(level, ps.x, ps.y, cx, cy, theme.floor);
	}
	return level;
}
function tileName(t) {
	switch (t) {
		case Tile.Wood: return "wood";
		case Tile.Grass: return "grass";
		case Tile.Concrete: return "concrete";
		case Tile.Asphalt: return "asphalt";
		case Tile.Carpet: return "carpet";
		case Tile.Wall: return "wall";
		default: return "wood";
	}
}
var STEP = 1 / 60;
var PLAYER_R = 10;
var HUNTER_R = 13;
var CATCH_R = 18;
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function dist(ax, ay, bx, by) {
	return Math.hypot(ax - bx, ay - by);
}
function facingFrom(dx, dy) {
	if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "left" : "right";
	return dy < 0 ? "up" : "down";
}
var GameEngine = class {
	canvas;
	ctx;
	light;
	lctx;
	assets = null;
	level = null;
	player;
	hunters = [];
	keys = [];
	collected = 0;
	mode = "title";
	vip = {
		...DEFAULT_VIP,
		...useGame.getState().vip,
		open: false
	};
	cam = {
		x: 0,
		y: 0
	};
	shake = 0;
	time = 0;
	spottedUntil = 0;
	particles = [];
	running = false;
	raf = 0;
	acc = 0;
	last = 0;
	muted = false;
	preview = true;
	constructor(canvas) {
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
		this.assets = await loadAssets();
		this.level = generateLevel(1, 1);
		this.resetActors(this.level, true);
		this.mode = "title";
		this.bindStore();
		useGame.setState({
			ready: true,
			mode: "title",
			vip: this.vip
		});
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
	onVis = () => {
		if (document.visibilityState === "visible") audio.unlock();
		else input.keys.clear();
	};
	bindStore() {
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
			teleport: () => this.teleportExit()
		});
	}
	setMode(mode) {
		this.mode = mode;
		useGame.setState({ mode });
	}
	play() {
		audio.unlock();
		this.preview = false;
		this.startLevel(1);
	}
	toTitle() {
		this.preview = true;
		this.level = generateLevel(1, 1);
		this.resetActors(this.level, true);
		this.setMode("title");
	}
	setVip(p) {
		this.vip = {
			...this.vip,
			...p
		};
		persistVip(this.vip);
		useGame.setState({ vip: this.vip });
	}
	giveKeys() {
		for (const k of this.keys) k.taken = true;
		this.collected = this.keys.length;
		this.syncHud();
	}
	teleportExit() {
		if (!this.level) return;
		this.player.x = this.level.exit.x;
		this.player.y = this.level.exit.y + 32;
	}
	startLevel(n) {
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
	makeActor(x, y) {
		return {
			x,
			y,
			vx: 0,
			vy: 0,
			yaw: 0,
			speed: 0,
			anim: 0,
			dir: "down"
		};
	}
	resetActors(level, idleHunter) {
		this.player = this.makeActor(level.playerSpawn.x, level.playerSpawn.y);
		this.hunters = level.hunterSpawns.map((s) => ({
			...this.makeActor(s.x, s.y),
			state: idleHunter ? "patrol" : "patrol",
			path: [],
			pathI: 0,
			repath: 0,
			lastSeen: null,
			spottedAt: -99
		}));
		this.keys = level.keys.map((k, i) => ({
			x: k.x,
			y: k.y,
			taken: false,
			bob: i
		}));
		this.cam.x = this.player.x;
		this.cam.y = this.player.y;
	}
	wireControlsTest() {
		window.__controlsTest = {
			getYaw: () => this.player.yaw,
			getSpeed: () => this.player.speed,
			setKeys: (codes) => input.setKeys(codes)
		};
	}
	loop = (now) => {
		if (!this.running) return;
		this.raf = requestAnimationFrame(this.loop);
		let dt = (now - this.last) / 1e3;
		this.last = now;
		dt = Math.min(dt, .1);
		this.acc += dt;
		let steps = 0;
		while (this.acc >= STEP && steps < 5) {
			this.step(STEP);
			this.acc -= STEP;
			steps++;
		}
		this.draw();
	};
	step(dt) {
		this.resize();
		if (this.mode === "title") {
			this.time += dt;
			this.cam.x += Math.sin(this.time * .15) * 8 * dt;
			this.cam.y += Math.cos(this.time * .11) * 6 * dt;
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
		if (nearest && nearest.d < CATCH_R && !this.vip.god && !this.vip.vanish) this.catchPlayer();
	}
	wanderPreview(dt) {
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
	movePlayer(dt, ax, ay, sprint) {
		const spd = (sprint ? 198 : 128) * this.vip.speed;
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
			if (sprint && Math.random() < .4) this.particles.push({
				x: this.player.x,
				y: this.player.y + 8,
				vx: -vx * .02,
				vy: -vy * .02,
				life: .35,
				max: .35,
				c: "rgba(200,190,170,0.35)"
			});
		}
		this.tryMove(this.player, vx * dt, vy * dt, PLAYER_R, this.vip.noclip);
	}
	tryMove(a, dx, dy, r, noclip) {
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
	circleBlocked(x, y, r) {
		if (!this.level) return true;
		const x0 = Math.floor((x - r) / 32);
		const y0 = Math.floor((y - r) / 32);
		const x1 = Math.floor((x + r) / 32);
		const y1 = Math.floor((y + r) / 32);
		for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
			if (walkable(this.level, tx, ty)) continue;
			const cx = clamp(x, tx * 32, tx * 32 + 32);
			const cy = clamp(y, ty * 32, ty * 32 + 32);
			if (Math.hypot(x - cx, y - cy) < r) return true;
		}
		return false;
	}
	updateHunters(dt) {
		if (!this.level) return;
		const level = this.level;
		const hearR = 150 + level.levelNum * 4;
		const seeR = 210 + level.levelNum * 8;
		const huntSpd = 72 + level.levelNum * 6.2 + (this.hunters.length > 1 ? 8 : 0);
		for (const h of this.hunters) {
			if (this.vip.freeze) continue;
			const d = dist(h.x, h.y, this.player.x, this.player.y);
			const canSee = !this.vip.vanish && d < seeR && hasLos(level, h.x, h.y, this.player.x, this.player.y);
			const canHear = !this.vip.vanish && this.player.speed > 160 && d < hearR;
			if (canSee) {
				if (h.state !== "chase") {
					audio.sting();
					this.shake = Math.max(this.shake, 7);
					this.spottedUntil = this.time + 1.4;
				}
				h.state = "chase";
				h.lastSeen = {
					x: this.player.x,
					y: this.player.y
				};
				h.spottedAt = this.time;
			} else if (h.state === "chase" && this.time - h.spottedAt > 2.4) h.state = "search";
			else if (canHear && h.state !== "chase") {
				h.state = "search";
				h.lastSeen = {
					x: this.player.x,
					y: this.player.y
				};
			}
			h.repath -= dt;
			const target = h.state === "chase" ? {
				x: this.player.x,
				y: this.player.y
			} : h.state === "search" && h.lastSeen ? h.lastSeen : null;
			if (h.repath <= 0) {
				if (target) this.pathTo(h, target.x, target.y);
				else this.pickPatrol(h);
				h.repath = h.state === "chase" ? .28 : .7;
			}
			const spd = h.state === "chase" ? huntSpd : huntSpd * .55;
			this.followPath(h, spd, dt);
			if (h.state === "search" && h.lastSeen && dist(h.x, h.y, h.lastSeen.x, h.lastSeen.y) < 18) {
				h.state = "patrol";
				h.lastSeen = null;
			}
			h.anim += dt * (h.state === "chase" ? 9 : 5);
			if (h.speed > 4) h.dir = facingFrom(h.vx, h.vy);
		}
	}
	pathTo(h, x, y) {
		if (!this.level) return;
		const a = worldToCell(h.x, h.y);
		const b = worldToCell(x, y);
		h.path = astar(this.level, a.tx, a.ty, b.tx, b.ty) ?? [];
		h.pathI = 0;
	}
	pickPatrol(h) {
		if (!this.level) return;
		for (let i = 0; i < 12; i++) {
			const tx = 1 + Math.floor(Math.random() * (this.level.width - 2));
			const ty = 1 + Math.floor(Math.random() * (this.level.height - 2));
			if (!walkable(this.level, tx, ty)) continue;
			this.pathTo(h, tx * 32 + 16, ty * 32 + 16);
			if (h.path.length) return;
		}
	}
	followPath(h, speed, dt) {
		if (!h.path.length) {
			h.speed = 0;
			return;
		}
		if (h.pathI >= h.path.length) {
			h.path = [];
			h.speed = 0;
			return;
		}
		const n = h.path[h.pathI];
		const tx = n.x * 32 + 16;
		const ty = n.y * 32 + 16;
		const dx = tx - h.x;
		const dy = ty - h.y;
		const d = Math.hypot(dx, dy);
		if (d < 8) {
			h.pathI++;
			return;
		}
		h.vx = dx / d * speed;
		h.vy = dy / d * speed;
		h.speed = speed;
		this.tryMove(h, h.vx * dt, h.vy * dt, HUNTER_R, false);
	}
	updateItems() {
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
			if (dist(this.player.x, this.player.y, this.level.exit.x, this.level.exit.y) < 26) this.escape();
		}
	}
	updateParticles(dt) {
		for (const p of this.particles) {
			p.life -= dt;
			p.x += p.vx;
			p.y += p.vy;
		}
		this.particles = this.particles.filter((p) => p.life > 0);
	}
	catchPlayer() {
		audio.caught();
		this.shake = 14;
		persistBest(this.level?.levelNum ?? 1);
		this.setMode("caught");
	}
	escape() {
		audio.win();
		persistBest((this.level?.levelNum ?? 1) + 1);
		this.setMode("escaped");
	}
	nearestHunter() {
		let best = null;
		for (const h of this.hunters) {
			const d = dist(h.x, h.y, this.player.x, this.player.y);
			if (!best || d < best.d) best = {
				h,
				d
			};
		}
		return best;
	}
	syncHud(proximity = 0, spotted = false) {
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
			vip: this.vip
		});
	}
	resize() {
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
	draw() {
		const ctx = this.ctx;
		const w = this.canvas.clientWidth;
		const h = this.canvas.clientHeight;
		ctx.fillStyle = "#0c0a09";
		ctx.fillRect(0, 0, w, h);
		if (!this.level || !this.assets) return;
		const follow = this.mode === "title" ? this.cam : this.player;
		const tx = follow.x - w / 2 + (Math.random() - .5) * this.shake;
		const ty = follow.y - h / 2 + (Math.random() - .5) * this.shake;
		this.cam.x += (follow.x - this.cam.x) * (this.mode === "playing" ? .12 : .02);
		this.cam.y += (follow.y - this.cam.y) * (this.mode === "playing" ? .12 : .02);
		const ox = this.mode === "title" ? tx : this.cam.x - w / 2 + (Math.random() - .5) * this.shake;
		const oy = this.mode === "title" ? ty : this.cam.y - h / 2 + (Math.random() - .5) * this.shake;
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
			ctx.fillStyle = `rgba(196,92,74,${.12 + .08 * Math.sin(this.time * 18)})`;
			ctx.fillRect(0, 0, w, h);
		}
	}
	drawTiles(ox, oy, vw, vh) {
		const { level, assets, ctx } = this;
		if (!level || !assets) return;
		const x0 = Math.max(0, Math.floor(ox / 32) - 1);
		const y0 = Math.max(0, Math.floor(oy / 32) - 1);
		const x1 = Math.min(level.width - 1, Math.ceil((ox + vw) / 32) + 1);
		const y1 = Math.min(level.height - 1, Math.ceil((oy + vh) / 32) + 1);
		for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
			const t = level.tiles[y * level.width + x];
			if (t === Tile.Void) continue;
			const name = tileName(t);
			const img = assets.tiles[name] ?? assets.tiles.wood;
			if (img) ctx.drawImage(img, x * 32, y * 32, 32.5, 32.5);
			else {
				ctx.fillStyle = t === Tile.Wall ? "#2a2420" : "#3a3228";
				ctx.fillRect(x * 32, y * 32, 32, 32);
			}
			if (t === Tile.Wall) {
				ctx.fillStyle = "rgba(0,0,0,0.28)";
				ctx.fillRect(x * 32, y * 32 + 32 - 6, 32, 6);
			}
		}
	}
	drawProps() {
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
	drawKeys() {
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
	drawActorPlayer() {
		const { assets, player, ctx, vip } = this;
		if (!assets) return;
		if (vip.vanish) ctx.globalAlpha = .28;
		const frames = assets.player[player.dir] ?? assets.player.down;
		const img = frames[player.speed > 8 ? Math.floor(player.anim) % 4 : 0] ?? frames[0];
		const h = 52;
		const w = img.width / img.height * h;
		ctx.drawImage(img, player.x - w / 2, player.y - h + 8, w, h);
		ctx.globalAlpha = 1;
	}
	drawHunters() {
		const { assets, ctx } = this;
		if (!assets) return;
		for (const h of this.hunters) {
			const bounce = h.speed > 8 ? Math.sin(h.anim * 2.2) * 2 : 0;
			const flip = this.player.x < h.x;
			ctx.save();
			ctx.translate(h.x, h.y + bounce);
			if (flip) ctx.scale(-1, 1);
			const img = assets.oliver;
			const hh = 62;
			const hw = img.width / img.height * hh * .85;
			if (h.state === "chase") {
				ctx.shadowColor = "rgba(196,92,74,0.7)";
				ctx.shadowBlur = 18;
			}
			ctx.drawImage(img, -hw / 2, -52, hw, hh);
			ctx.restore();
		}
	}
	drawLight(ox, oy, w, h) {
		if (!this.level) return;
		const l = this.lctx;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		l.setTransform(dpr, 0, 0, dpr, 0, 0);
		l.clearRect(0, 0, w, h);
		l.fillStyle = `rgba(4,3,4,${clamp(.78 + this.level.levelNum * .012, .78, .93)})`;
		l.fillRect(0, 0, w, h);
		const px = this.player.x - ox;
		const py = this.player.y - oy;
		const radius = Math.max(78, 168 - this.level.levelNum * 5);
		l.globalCompositeOperation = "destination-out";
		const g = l.createRadialGradient(px, py, 8, px, py, radius);
		g.addColorStop(0, "rgba(0,0,0,0.95)");
		g.addColorStop(.45, "rgba(0,0,0,0.55)");
		g.addColorStop(1, "rgba(0,0,0,0)");
		l.fillStyle = g;
		l.beginPath();
		l.arc(px, py, radius, 0, Math.PI * 2);
		l.fill();
		const ang = Math.atan2(this.player.dir === "down" ? 1 : this.player.dir === "up" ? -1 : 0, this.player.dir === "right" ? 1 : this.player.dir === "left" ? -1 : 0);
		l.beginPath();
		l.moveTo(px, py);
		l.arc(px, py, radius * 1.35, ang - .55, ang + .55);
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
	drawMinimap(w, h) {
		if (!this.level) return;
		const ctx = this.ctx;
		const s = 3;
		const mw = this.level.width * s;
		const mh = this.level.height * s;
		const x = w - mw - 16;
		const y = 16;
		ctx.globalAlpha = .82;
		ctx.fillStyle = "#0c0a09";
		ctx.fillRect(x - 4, 12, mw + 8, mh + 8);
		for (let ty = 0; ty < this.level.height; ty++) for (let tx = 0; tx < this.level.width; tx++) {
			const t = this.level.tiles[ty * this.level.width + tx];
			ctx.fillStyle = t === Tile.Wall || t === Tile.Void ? "#1a1614" : "#4a4036";
			ctx.fillRect(x + tx * s, y + ty * s, s, s);
		}
		ctx.fillStyle = "#d8d2c8";
		ctx.fillRect(x + this.player.x / 32 * s - 1, y + this.player.y / 32 * s - 1, 3, 3);
		ctx.fillStyle = "#c45c4a";
		for (const hunter of this.hunters) ctx.fillRect(x + hunter.x / 32 * s - 1, y + hunter.y / 32 * s - 1, 3, 3);
		ctx.globalAlpha = 1;
	}
};
function GameApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const ready = useGame((s) => s.ready);
	const mode = useGame((s) => s.mode);
	const [muted, setMuted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const engine = new GameEngine(canvas);
		engineRef.current = engine;
		engine.boot();
		return () => engine.destroy();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full",
				style: { touchAction: "none" }
			}),
			!ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-10 grid place-items-center bg-bg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display tracking-[0.3em] text-muted",
					children: "LOADING"
				})
			}),
			mode === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleScreen, {}),
			mode === "how" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowScreen, {}),
			mode === "playing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}),
			mode === "paused" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PauseScreen, {}),
			mode === "caught" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaughtScreen, {}),
			mode === "escaped" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EscapedScreen, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VipPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchControls, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute top-3 right-3 z-30 flex gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: muted ? "Unmute" : "Mute",
					onClick: () => {
						const next = !muted;
						setMuted(next);
						audio.setMuted(next);
					},
					children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
				})
			})
		]
	});
}
function IconBtn({ children, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "pointer-events-auto grid size-11 place-items-center rounded-md border border-border bg-surface/80 text-fg",
		children
	});
}
function TitleScreen() {
	const play = useGame((s) => s.play);
	const how = useGame((s) => s.how);
	const setVip = useGame((s) => s.setVip);
	const best = useGame((s) => s.best);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/70 to-transparent px-6 pb-10 pt-16 sm:justify-center sm:pb-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.35em] text-muted",
					children: "UNLIMITED LEVELS"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-display mt-2 text-5xl leading-[0.9] tracking-[0.08em] sm:text-6xl",
					children: [
						"RUN FROM",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"OLIVER"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-sm text-sm leading-relaxed text-muted",
					children: "He is inside the house, the yard, the lot — and he is coming. Grab the keys. Hit the door. Do not let him catch you."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							className: "w-full font-display tracking-[0.2em]",
							onClick: play,
							children: "ENTER"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "w-full",
							onClick: how,
							children: "How to run"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							className: "w-full",
							onClick: () => setVip({ open: true }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "size-4" }), "Owner VIP"]
						})
					]
				}),
				best > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 text-xs tracking-[0.2em] text-subtle",
					children: ["BEST REACH · LEVEL ", best]
				})
			]
		})
	});
}
function HowScreen() {
	const play = useGame((s) => s.play);
	const toTitle = useGame((s) => s.toTitle);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-3xl tracking-[0.12em]",
			children: "HOW TO RUN"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-4 space-y-3 text-sm leading-relaxed text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Move with WASD or arrows. On a phone, drag to steer." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Hold Shift, Space, or Sprint to run — it is faster, and louder." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Collect every key, then leave through the door." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Oliver hunts by sight and sound. Break line of sight. Do not sprint next to him." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Levels never end. Houses, yards, lots — he owns all of them." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Owner VIP (V) lets you change speed, vanish, or skip anything." })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 flex flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: play,
				children: "Enter anyway"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: toTitle,
				children: "Back"
			})]
		})
	] });
}
function Hud() {
	const level = useGame((s) => s.level);
	const name = useGame((s) => s.levelName);
	const keys = useGame((s) => s.keys);
	const need = useGame((s) => s.keysNeeded);
	const spotted = useGame((s) => s.spotted);
	const prox = useGame((s) => s.proximity);
	const pause = useGame((s) => s.pause);
	const setVip = useGame((s) => s.setVip);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-surface/80 px-3 py-2 backdrop-blur-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-display text-sm tracking-[0.22em]",
					children: [
						"LEVEL ",
						level,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-muted",
							children: name
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "tabular mt-1 text-xs text-muted",
					children: [
						"KEYS ",
						keys,
						"/",
						need
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: "VIP",
					onClick: () => setVip({ open: true }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
					label: "Pause",
					onClick: pause,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
				})]
			}),
			(spotted || prox > .55) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-16 left-1/2 z-20 -translate-x-1/2 rounded-md bg-danger px-3 py-1 font-display text-xs tracking-[0.28em] text-fg",
				children: spotted ? "HE SEES YOU" : "HE'S CLOSE"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-[10px] tracking-[0.25em] text-subtle sm:block",
				children: "WASD MOVE · SHIFT SPRINT · V VIP"
			})
		]
	});
}
function PauseScreen() {
	const resume = useGame((s) => s.resume);
	const toTitle = useGame((s) => s.toTitle);
	const setVip = useGame((s) => s.setVip);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-3xl tracking-[0.16em]",
			children: "PAUSED"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "He is still in the house."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 flex flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: resume,
					children: "Keep running"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setVip({ open: true }),
					children: "Owner VIP"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: toTitle,
					children: "Title"
				})
			]
		})
	] });
}
function CaughtScreen() {
	const level = useGame((s) => s.level);
	const retry = useGame((s) => s.retry);
	const toTitle = useGame((s) => s.toTitle);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs tracking-[0.3em] text-danger",
			children: "CAUGHT"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display mt-2 text-4xl tracking-[0.1em]",
			children: "HE GOT YOU"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-sm text-muted",
			children: [
				"Level ",
				level,
				". The house keeps the ones who slow down."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 flex flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: retry,
				children: "Run it back"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: toTitle,
				children: "Title"
			})]
		})
	] });
}
function EscapedScreen() {
	const level = useGame((s) => s.level);
	const next = useGame((s) => s.next);
	const toTitle = useGame((s) => s.toTitle);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs tracking-[0.3em] text-ok",
			children: "CLEAR"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display mt-2 text-4xl tracking-[0.1em]",
			children: "YOU MADE IT"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-sm text-muted",
			children: [
				"Level ",
				level,
				" is behind you. The next one is already waiting."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 flex flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: next,
				children: "Keep running"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: toTitle,
				children: "Title"
			})]
		})
	] });
}
function Panel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 grid place-items-center bg-bg/70 px-5 backdrop-blur-[2px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("w-full max-w-md rounded-xl border border-border bg-surface p-6", "shadow-[0_16px_50px_rgba(0,0,0,0.5)]"),
			children
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { Home as component };
