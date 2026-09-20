export type Atlas = {
  tiles: Record<string, HTMLImageElement>;
  player: Record<string, HTMLImageElement[]>;
  oliver: HTMLImageElement;
  props: HTMLImageElement[];
  door: HTMLImageElement;
  doorOpen: HTMLImageElement;
  key: HTMLImageElement;
};

function placeholder(w = 32, h = 32, color = "#888") {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = color;
  g.fillRect(2, 2, w - 4, h - 4);
  const img = new Image();
  img.src = c.toDataURL();
  return img;
}

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn("asset miss", src);
      resolve(placeholder());
    };
    img.src = src;
  });
}

export async function loadAssets(): Promise<Atlas> {
  const tileNames = ["wood", "grass", "concrete", "asphalt", "carpet", "wall"] as const;
  const dirs = ["down", "left", "right", "up"] as const;
  const tileEntries = await Promise.all(
    tileNames.map(async (n) => [n, await load(`/tiles/${n}.png`)] as const),
  );
  const player: Record<string, HTMLImageElement[]> = {};
  for (const d of dirs) {
    player[d] = await Promise.all([1, 2, 3, 4].map((i) => load(`/sprites/player/${d}-${i}.png`)));
  }
  const props = await Promise.all(
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => load(`/props/prop-${i}.png`)),
  );
  const [oliver, door, doorOpen, key] = await Promise.all([
    load("/sprites/oliver.png"),
    load("/sprites/door.png"),
    load("/sprites/door-open.png"),
    load("/sprites/key.png"),
  ]);
  const tiles: Record<string, HTMLImageElement> = {};
  for (const [k, v] of tileEntries) tiles[k] = v;
  return { tiles, player, oliver, props, door, doorOpen, key };
}

export const PROP_INDEX: Record<string, number> = {
  lamp: 0,
  plant: 1,
  box: 2,
  chair: 3,
  bin: 4,
  nightstand: 5,
  vase: 6,
  boombox: 7,
  crate: 8,
};
