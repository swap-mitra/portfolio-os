/* Deterministic skyline geometry for CityscapeBackground (SPIKE-14).

   Pure and viewport-independent: one tile per parallax layer, generated once at
   module load from a fixed seed, so every visitor sees the same city and the
   geometry is testable without a DOM. A tile's 1200 units are stretched to
   exactly 100vw by the SVG's preserveAspectRatio="none", which is what lets two
   tiles side by side loop seamlessly at any window width without measuring
   anything (architecture.md §7). */

export const TILE_WIDTH = 1200

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface LitWindow extends Rect {
  /** Seconds of animation-delay, or null for a window that never flickers. */
  flickerDelay: number | null
}

export interface SkylineLayer {
  id: string
  /** Strip height in px, and how far its base sits above the top of the taskbar. */
  height: number
  bottom: number
  /** Seconds for one tile of travel. Lower reads as nearer/faster. */
  durationS: number
  /** Silhouette and lit-window colors. Tokens only (see tokens.css). */
  fill: string
  lit: string
  seed: number
  minWidth: number
  maxWidth: number
  minGap: number
  maxGap: number
  minHeight: number
  maxHeight: number
  windowWidth: number
  windowHeight: number
  /** Grid spacing between windows; also the inset from the building's edges. */
  pitchX: number
  pitchY: number
  /** Share of grid cells that are lit, and share of lit windows that flicker. */
  litChance: number
  flickerChance: number
}

export interface SkylineTile {
  layer: SkylineLayer
  buildings: Rect[]
  windows: LitWindow[]
}

/* Back to front. Distant buildings are lighter (haze) and numerous, near ones
   are near-black silhouettes against the horizon glow. The depth cue is
   color and count, since every layer is stretched to the same viewport width. */
const LAYERS: SkylineLayer[] = [
  {
    id: 'far',
    height: 150,
    bottom: 116,
    durationS: 120,
    fill: 'var(--ink-3)',
    lit: 'var(--cyan)',
    seed: 1337,
    minWidth: 16,
    maxWidth: 34,
    minGap: 6,
    maxGap: 20,
    minHeight: 40,
    maxHeight: 120,
    windowWidth: 2,
    windowHeight: 2,
    pitchX: 6,
    pitchY: 8,
    litChance: 0.06,
    flickerChance: 0.15,
  },
  {
    id: 'mid',
    height: 210,
    bottom: 76,
    durationS: 70,
    fill: 'var(--ink-2)',
    lit: 'var(--magenta)',
    seed: 2024,
    minWidth: 34,
    maxWidth: 64,
    minGap: 10,
    maxGap: 28,
    minHeight: 70,
    maxHeight: 180,
    windowWidth: 3,
    windowHeight: 4,
    pitchX: 11,
    pitchY: 15,
    litChance: 0.16,
    flickerChance: 0.2,
  },
  {
    id: 'near',
    height: 260,
    bottom: 30,
    durationS: 38,
    fill: 'var(--ink)',
    lit: 'var(--yellow)',
    seed: 99,
    minWidth: 60,
    maxWidth: 120,
    minGap: 14,
    maxGap: 44,
    minHeight: 110,
    maxHeight: 230,
    windowWidth: 4,
    windowHeight: 5,
    pitchX: 15,
    pitchY: 20,
    litChance: 0.14,
    flickerChance: 0.25,
  },
]

/** mulberry32, a seeded PRNG, so the scene is fixed rather than per-load random. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Exported for the geometry tests; the app only needs `SKYLINE`. */
export function buildTile(layer: SkylineLayer): SkylineTile {
  const rnd = mulberry32(layer.seed)
  const between = (min: number, max: number) => min + rnd() * (max - min)
  const buildings: Rect[] = []
  const windows: LitWindow[] = []

  let cursor = between(layer.minGap, layer.maxGap)
  while (cursor < TILE_WIDTH) {
    const x = Math.round(cursor)
    const w = Math.round(between(layer.minWidth, layer.maxWidth))
    const h = Math.round(between(layer.minHeight, layer.maxHeight))
    // A building crossing the tile's right edge would be sliced by the next
    // tile, so drop it rather than draw a half building at the seam.
    if (x + w > TILE_WIDTH) break
    const y = layer.height - h
    buildings.push({ x, y, w, h })

    const cols = Math.floor((w - layer.pitchX) / layer.pitchX)
    const rows = Math.floor((h - layer.pitchY) / layer.pitchY)
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rnd() > layer.litChance) continue
        windows.push({
          x: x + layer.pitchX * c + Math.round((layer.pitchX - layer.windowWidth) / 2),
          y: y + layer.pitchY * (r + 1),
          w: layer.windowWidth,
          h: layer.windowHeight,
          flickerDelay: rnd() < layer.flickerChance ? Math.round(rnd() * 60) / 10 : null,
        })
      }
    }
    cursor += w + between(layer.minGap, layer.maxGap)
  }

  return { layer, buildings, windows }
}

export const SKYLINE: SkylineTile[] = LAYERS.map(buildTile)
