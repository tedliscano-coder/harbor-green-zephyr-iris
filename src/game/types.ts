export const TILE = 32;

export const Tile = {
  Void: 0,
  Wall: 1,
  Wood: 2,
  Grass: 3,
  Concrete: 4,
  Asphalt: 5,
  Carpet: 6,
} as const;

export type TileId = (typeof Tile)[keyof typeof Tile];

export type Vec = { x: number; y: number };

export type Rect = { x: number; y: number; w: number; h: number };

export type PropKind =
  | "lamp"
  | "plant"
  | "box"
  | "chair"
  | "bin"
  | "nightstand"
  | "vase"
  | "boombox"
  | "crate"
  | "door"
  | "doorOpen"
  | "key";

export type Prop = {
  kind: PropKind;
  x: number;
  y: number;
  w: number;
  h: number;
  solid: boolean;
};

export type ThemeId =
  | "house"
  | "yard"
  | "estate"
  | "warehouse"
  | "forest"
  | "mansion"
  | "lot"
  | "grounds";

export type Theme = {
  id: ThemeId;
  name: string;
  indoor: boolean;
  outdoor: boolean;
  floor: TileId;
  floorAlt: TileId;
};

export type Level = {
  width: number;
  height: number;
  tiles: Uint8Array;
  blocked: Uint8Array;
  theme: Theme;
  name: string;
  playerSpawn: Vec;
  hunterSpawns: Vec[];
  exit: Vec;
  keys: Vec[];
  props: Prop[];
  seed: number;
  levelNum: number;
  keysNeeded: number;
};

export type VipState = {
  open: boolean;
  speed: number;
  vanish: boolean;
  freeze: boolean;
  god: boolean;
  noclip: boolean;
  lights: boolean;
  map: boolean;
};

export type Mode = "title" | "playing" | "paused" | "caught" | "escaped" | "how";

export const DEFAULT_VIP: VipState = {
  open: false,
  speed: 1,
  vanish: false,
  freeze: false,
  god: false,
  noclip: false,
  lights: false,
  map: false,
};
