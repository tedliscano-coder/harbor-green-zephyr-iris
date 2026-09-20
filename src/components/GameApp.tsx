import { useEffect, useRef, useState, type ReactNode } from "react";
import { Crown, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TouchControls } from "@/components/TouchControls";
import { VipPanel } from "@/components/VipPanel";
import { audio } from "@/game/audio";
import { GameEngine } from "@/game/engine";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";


export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const ready = useGame((s) => s.ready);
  const mode = useGame((s) => s.mode);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    void engine.boot();
    return () => engine.destroy();
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        style={{ touchAction: "none" }}
      />
      {!ready && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-bg">
          <p className="font-display tracking-[0.3em] text-muted">LOADING</p>
        </div>
      )}
      {ready && mode === "title" && <TitleScreen />}
      {ready && mode === "how" && <HowScreen />}
      {ready && mode === "playing" && <Hud />}
      {ready && mode === "paused" && <PauseScreen />}
      {ready && mode === "caught" && <CaughtScreen />}
      {ready && mode === "escaped" && <EscapedScreen />}
      {ready && <VipPanel />}
      {ready && <TouchControls />}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="pointer-events-auto grid size-11 place-items-center rounded-md border border-border bg-surface/80 text-fg"
    >
      {children}
    </button>
  );
}

function TitleScreen() {
  const play = useGame((s) => s.play);
  const how = useGame((s) => s.how);
  const setVip = useGame((s) => s.setVip);
  const best = useGame((s) => s.best);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/70 to-transparent px-6 pb-10 pt-16 sm:justify-center sm:pb-0">
      <div className="mx-auto w-full max-w-md">
        <p className="text-xs tracking-[0.35em] text-muted">UNLIMITED LEVELS</p>
        <h1 className="font-display mt-2 text-5xl leading-[0.9] tracking-[0.08em] sm:text-6xl">
          RUN FROM
          <br />
          OLIVER
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
          He is inside the house, the yard, the lot — and he is coming. Grab the keys. Hit the door.
          Do not let him catch you.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" className="w-full font-display tracking-[0.2em]" onClick={play}>
            ENTER
          </Button>
          <Button variant="secondary" className="w-full" onClick={how}>
            How to run
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setVip({ open: true })}>
            <Crown className="size-4" />
            Owner VIP
          </Button>
        </div>
        {best > 0 && (
          <p className="mt-5 text-xs tracking-[0.2em] text-subtle">BEST REACH · LEVEL {best}</p>
        )}
      </div>
    </div>
  );
}

function HowScreen() {
  const play = useGame((s) => s.play);
  const toTitle = useGame((s) => s.toTitle);

  return (
    <Panel>
      <h2 className="font-display text-3xl tracking-[0.12em]">HOW TO RUN</h2>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
        <li>Move with WASD or arrows. On a phone, drag to steer.</li>
        <li>Hold Shift, Space, or Sprint to run — it is faster, and louder.</li>
        <li>Collect every key, then leave through the door.</li>
        <li>Oliver hunts by sight and sound. Break line of sight. Do not sprint next to him.</li>
        <li>Levels never end. Houses, yards, lots — he owns all of them.</li>
        <li>Owner VIP (V) lets you change speed, vanish, or skip anything.</li>
      </ul>
      <div className="mt-8 flex flex-col gap-2">
        <Button onClick={play}>Enter anyway</Button>
        <Button variant="secondary" onClick={toTitle}>
          Back
        </Button>
      </div>
    </Panel>
  );
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
  const [muted, setMuted] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="rounded-lg border border-border bg-surface/80 px-3 py-2 backdrop-blur-sm">
        <p className="font-display text-sm tracking-[0.22em]">
          LEVEL {level}
          <span className="ml-2 text-muted">{name}</span>
        </p>
        <p className="tabular mt-1 text-xs text-muted">
          KEYS {keys}/{need}
        </p>
      </div>
      <div className="pointer-events-auto flex gap-2">
        <IconBtn label="VIP" onClick={() => setVip({ open: true })}>
          <Crown className="size-4" />
        </IconBtn>
        <IconBtn
          label={muted ? "Unmute" : "Mute"}
          onClick={() => {
            const next = !muted;
            setMuted(next);
            audio.setMuted(next);
          }}
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </IconBtn>
        <IconBtn label="Pause" onClick={pause}>
          <Pause className="size-4" />
        </IconBtn>
      </div>
      {(spotted || prox > 0.55) && (
        <div className="absolute top-16 left-1/2 z-20 -translate-x-1/2 rounded-md bg-danger px-3 py-1 font-display text-xs tracking-[0.28em] text-fg">
          {spotted ? "HE SEES YOU" : "HE'S CLOSE"}
        </div>
      )}
      <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-[10px] tracking-[0.25em] text-subtle sm:block">
        WASD MOVE · SHIFT SPRINT · V VIP
      </div>
    </div>
  );
}

function PauseScreen() {
  const resume = useGame((s) => s.resume);
  const toTitle = useGame((s) => s.toTitle);
  const setVip = useGame((s) => s.setVip);
  return (
    <Panel>
      <h2 className="font-display text-3xl tracking-[0.16em]">PAUSED</h2>
      <p className="mt-2 text-sm text-muted">He is still in the house.</p>
      <div className="mt-8 flex flex-col gap-2">
        <Button onClick={resume}>Keep running</Button>
        <Button variant="secondary" onClick={() => setVip({ open: true })}>
          Owner VIP
        </Button>
        <Button variant="ghost" onClick={toTitle}>
          Title
        </Button>
      </div>
    </Panel>
  );
}

function CaughtScreen() {
  const level = useGame((s) => s.level);
  const retry = useGame((s) => s.retry);
  const toTitle = useGame((s) => s.toTitle);
  return (
    <Panel>
      <p className="text-xs tracking-[0.3em] text-danger">CAUGHT</p>
      <h2 className="font-display mt-2 text-4xl tracking-[0.1em]">HE GOT YOU</h2>
      <p className="mt-3 text-sm text-muted">Level {level}. The house keeps the ones who slow down.</p>
      <div className="mt-8 flex flex-col gap-2">
        <Button onClick={retry}>Run it back</Button>
        <Button variant="secondary" onClick={toTitle}>
          Title
        </Button>
      </div>
    </Panel>
  );
}

function EscapedScreen() {
  const level = useGame((s) => s.level);
  const next = useGame((s) => s.next);
  const toTitle = useGame((s) => s.toTitle);
  return (
    <Panel>
      <p className="text-xs tracking-[0.3em] text-ok">CLEAR</p>
      <h2 className="font-display mt-2 text-4xl tracking-[0.1em]">YOU MADE IT</h2>
      <p className="mt-3 text-sm text-muted">
        Level {level} is behind you. The next one is already waiting.
      </p>
      <div className="mt-8 flex flex-col gap-2">
        <Button onClick={next}>Keep running</Button>
        <Button variant="secondary" onClick={toTitle}>
          Title
        </Button>
      </div>
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-bg/70 px-5 backdrop-blur-[2px]">
      <div
        className={cn(
          "w-full max-w-md rounded-xl border border-border bg-surface p-6",
          "shadow-[0_16px_50px_rgba(0,0,0,0.5)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
