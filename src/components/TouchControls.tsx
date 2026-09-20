import { useEffect, useRef, useState } from "react";
import { input } from "@/game/input";
import { useGame } from "@/game/store";

export function TouchControls() {
  const mode = useGame((s) => s.mode);
  const [touch, setTouch] = useState(false);
  const origin = useRef<{ id: number; x: number; y: number } | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0, show: false, cx: 0, cy: 0 });

  useEffect(() => {
    const on = () => setTouch(true);
    window.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") on();
    });
    if ("ontouchstart" in window) setTouch(true);
    if (window.matchMedia("(pointer: coarse)").matches) setTouch(true);
  }, []);

  if (!touch || mode !== "playing") return null;

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    origin.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    setKnob({ x: 0, y: 0, show: true, cx: e.clientX, cy: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!origin.current || e.pointerId !== origin.current.id) return;
    const dx = e.clientX - origin.current.x;
    const dy = e.clientY - origin.current.y;
    const m = Math.hypot(dx, dy);
    const max = 46;
    const k = m > max ? max / m : 1;
    const nx = (dx * k) / max;
    const ny = (dy * k) / max;
    input.touchX = nx;
    input.touchY = ny;
    setKnob((s) => ({ ...s, x: dx * k, y: dy * k }));
  };

  const onUp = (e: React.PointerEvent) => {
    if (!origin.current || e.pointerId !== origin.current.id) return;
    origin.current = null;
    input.touchX = 0;
    input.touchY = 0;
    setKnob((s) => ({ ...s, show: false, x: 0, y: 0 }));
  };

  return (
    <>
      <div
        className="absolute inset-y-0 left-0 z-20 w-[58%]"
        style={{ touchAction: "none" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
      {knob.show && (
        <div
          className="pointer-events-none absolute z-30 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-surface/40"
          style={{ left: knob.cx, top: knob.cy }}
        >
          <div
            className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/80"
            style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
          />
        </div>
      )}
      <button
        type="button"
        className="absolute right-5 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-30 h-16 w-16 rounded-full border border-border bg-surface/80 font-display text-xs tracking-widest text-fg"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          e.stopPropagation();
          input.touchSprint = true;
        }}
        onPointerUp={() => {
          input.touchSprint = false;
        }}
        onPointerCancel={() => {
          input.touchSprint = false;
        }}
      >
        SPRINT
      </button>
    </>
  );
}
