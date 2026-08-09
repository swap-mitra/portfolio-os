import { describe, expect, it } from 'vitest'
import { clampDragPosition } from './useDraggable'

const viewport = { width: 1280, height: 800 }

describe('clampDragPosition', () => {
  it('passes through positions well inside the viewport', () => {
    expect(clampDragPosition(300, 150, 420, viewport)).toEqual({ x: 300, y: 150 })
  })

  it('stops the title bar leaving the top edge', () => {
    expect(clampDragPosition(300, -50, 420, viewport)).toEqual({ x: 300, y: 0 })
  })

  it('keeps at least 40px visible when dragged off the left edge', () => {
    expect(clampDragPosition(-1000, 150, 420, viewport)).toEqual({ x: 40 - 420, y: 150 })
  })

  it('keeps at least 40px visible when dragged off the right edge', () => {
    expect(clampDragPosition(5000, 150, 420, viewport)).toEqual({ x: viewport.width - 40, y: 150 })
  })

  it('keeps at least 40px visible when dragged off the bottom edge', () => {
    expect(clampDragPosition(300, 5000, 420, viewport)).toEqual({ x: 300, y: viewport.height - 40 })
  })
})
