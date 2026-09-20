import { create } from "zustand";
import { DEFAULT_VIP, type Mode, type VipState } from "./types";

const BEST_KEY = "rfo-best-level";
const VIP_KEY = "rfo-vip";

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

function loadVip(): VipState {
  try {
    const raw = localStorage.getItem(VIP_KEY);
    if (!raw) return { ...DEFAULT_VIP };
    return { ...DEFAULT_VIP, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_VIP };
  }
}

export type GameUI = {
  ready: boolean;
  mode: Mode;
  level: number;
  levelName: string;
  keys: number;
  keysNeeded: number;
  spotted: boolean;
  proximity: number;
  best: number;
  hunters: number;
  vip: VipState;
  play: () => void;
  pause: () => void;
  resume: () => void;
  retry: () => void;
  toTitle: () => void;
  next: () => void;
  how: () => void;
  setVip: (p: Partial<VipState>) => void;
  skip: () => void;
  giveKeys: () => void;
  teleport: () => void;
};

export const useGame = create<GameUI>(() => ({
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
  teleport: () => {},
}));

export function persistBest(level: number) {
  const best = Math.max(level, useGame.getState().best);
  useGame.setState({ best });
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch {
    /* ignore */
  }
}

export function persistVip(vip: VipState) {
  try {
    localStorage.setItem(VIP_KEY, JSON.stringify(vip));
  } catch {
    /* ignore */
  }
}
