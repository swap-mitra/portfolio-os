import { describe, expect, it } from 'vitest'
import { buildTile, SKYLINE, TILE_WIDTH, type Rect } from './skyline'

const contains = (outer: Rect, inner: Rect) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.w <= outer.x + outer.w &&
  inner.y + inner.h <= outer.y + outer.h

describe('skyline geometry', () => {
  it('generates the same city every time (seeded, not Math.random)', () => {
    for (const tile of SKYLINE) {
      expect(buildTile(tile.layer)).toEqual(buildTile(tile.layer))
    }
  })

  it('produces a populated scene on every layer', () => {
    for (const { layer, buildings, windows } of SKYLINE) {
      expect(buildings.length, `${layer.id} buildings`).toBeGreaterThan(4)
      expect(windows.length, `${layer.id} lit windows`).toBeGreaterThan(4)
    }
  })

  // The whole seamless loop rests on this: two tiles sit side by side and the
  // strip translates by exactly one tile, so anything drawn outside the tile's
  // bounds would show up as a visible seam or a sliced building.
  it('keeps every building inside the tile and standing on the layer floor', () => {
    for (const { layer, buildings } of SKYLINE) {
      for (const b of buildings) {
        expect(b.x, layer.id).toBeGreaterThanOrEqual(0)
        expect(b.x + b.w, layer.id).toBeLessThanOrEqual(TILE_WIDTH)
        expect(b.y + b.h, `${layer.id} building must reach the layer floor`).toBe(layer.height)
      }
    }
  })

  it('never puts buildings on top of each other', () => {
    for (const { layer, buildings } of SKYLINE) {
      for (let i = 1; i < buildings.length; i++) {
        const prev = buildings[i - 1]!
        expect(buildings[i]!.x, layer.id).toBeGreaterThanOrEqual(prev.x + prev.w)
      }
    }
  })

  it('places every lit window inside a building, not floating in the sky', () => {
    for (const { layer, buildings, windows } of SKYLINE) {
      for (const w of windows) {
        expect(
          buildings.some((b) => contains(b, w)),
          `${layer.id} window at ${w.x},${w.y} escaped its building`,
        ).toBe(true)
      }
    }
  })

  it('staggers flicker delays so lit windows never blink in unison', () => {
    const delays = SKYLINE.flatMap(({ windows }) =>
      windows.map((w) => w.flickerDelay).filter((d): d is number => d !== null),
    )
    expect(delays.length).toBeGreaterThan(4)
    for (const d of delays) {
      expect(d).toBeGreaterThanOrEqual(0)
      expect(d).toBeLessThanOrEqual(6)
    }
    expect(new Set(delays).size).toBeGreaterThan(1)
  })
})
