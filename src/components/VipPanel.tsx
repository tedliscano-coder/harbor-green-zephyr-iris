import type { ReactNode } from "react";
import { EyeOff, Gauge, Lightbulb, Map, Shield, Snowflake, Unlock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

function Row({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-sm text-fg">
        <span className="text-muted">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-7 w-12 rounded-full border transition-colors duration-150",
        on ? "bg-accent border-accent" : "bg-surface-2 border-border",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-6 rounded-full bg-fg transition-transform duration-150",
          on && "translate-x-5 bg-accent-fg",
        )}
      />
    </button>
  );
}

export function VipPanel() {
  const vip = useGame((s) => s.vip);
  const setVip = useGame((s) => s.setVip);
  const skip = useGame((s) => s.skip);
  const giveKeys = useGame((s) => s.giveKeys);
  const teleport = useGame((s) => s.teleport);
  const mode = useGame((s) => s.mode);

  if (!vip.open) return null;

  return (
    <aside className="absolute top-16 right-3 z-30 w-[min(100%-1.5rem,20rem)] rounded-xl border border-border bg-surface/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg tracking-[0.18em] text-fg">OWNER VIP</p>
          <p className="text-xs text-muted">Rewrite the rules. This is your house now.</p>
        </div>
        <button
          type="button"
          className="text-muted hover:text-fg"
          onClick={() => setVip({ open: false })}
        >
          Close
        </button>
      </div>

      <Row label="Speed" icon={<Gauge className="size-4" />}>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0.4}
            max={4}
            step={0.1}
            value={vip.speed}
            onChange={(e) => setVip({ speed: Number(e.target.value) })}
            className="w-24 accent-accent"
          />
          <span className="tabular w-8 text-right text-xs text-muted">{vip.speed.toFixed(1)}x</span>
        </div>
      </Row>
      <Row label="Disappear" icon={<EyeOff className="size-4" />}>
        <Toggle on={vip.vanish} onChange={(v) => setVip({ vanish: v })} />
      </Row>
      <Row label="Freeze Oliver" icon={<Snowflake className="size-4" />}>
        <Toggle on={vip.freeze} onChange={(v) => setVip({ freeze: v })} />
      </Row>
      <Row label="Untouchable" icon={<Shield className="size-4" />}>
        <Toggle on={vip.god} onChange={(v) => setVip({ god: v })} />
      </Row>
      <Row label="Walk through walls" icon={<Unlock className="size-4" />}>
        <Toggle on={vip.noclip} onChange={(v) => setVip({ noclip: v })} />
      </Row>
      <Row label="Full lights" icon={<Lightbulb className="size-4" />}>
        <Toggle on={vip.lights} onChange={(v) => setVip({ lights: v })} />
      </Row>
      <Row label="Show map" icon={<Map className="size-4" />}>
        <Toggle on={vip.map} onChange={(v) => setVip({ map: v })} />
      </Row>

      {mode === "playing" && (
        <div className="mt-3 grid grid-cols-1 gap-2">
          <Button variant="secondary" size="sm" onClick={giveKeys}>
            Take the keys
          </Button>
          <Button variant="secondary" size="sm" onClick={teleport}>
            Jump to the door
          </Button>
          <Button variant="primary" size="sm" onClick={skip}>
            <Zap className="size-4" />
            Skip level
          </Button>
        </div>
      )}
    </aside>
  );
}
