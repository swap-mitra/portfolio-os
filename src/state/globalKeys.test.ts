import { describe, expect, it } from 'vitest'
import { globalKeyAction } from './globalKeys'
import { initialState } from './osReducer'
import type { OSState } from '../types/os'

const withWindow: OSState = {
  ...initialState,
  windows: {
    about: {
      id: 'about',
      appType: 'about',
      x: 0,
      y: 0,
      width: 420,
      height: 330,
      zIndex: 20,
      minimized: false,
      maximized: false,
    },
  },
  focusedWindowId: 'about',
}

describe('globalKeyAction', () => {
  it('ignores every key that isn\'t Escape', () => {
    for (const key of ['a', 'Enter', ' ', 'Tab', 'ArrowUp']) {
      expect(globalKeyAction(key, withWindow)).toBeNull()
    }
  })

  it('closes the focused window on Escape', () => {
    expect(globalKeyAction('Escape', withWindow)).toEqual({ type: 'CLOSE_WINDOW', id: 'about' })
  })

  it('closes the Start Menu first, leaving the window open', () => {
    const menuOpen = { ...withWindow, startMenuOpen: true }
    expect(globalKeyAction('Escape', menuOpen)).toEqual({ type: 'CLOSE_START_MENU' })
  })

  it('does nothing on Escape with no menu and no focused window', () => {
    expect(globalKeyAction('Escape', initialState)).toBeNull()
  })

  describe('shutdown overlay', () => {
    const shuttingDown = { ...withWindow, shuttingDown: true, startMenuOpen: true }

    it('lets any key dismiss it, ahead of everything else', () => {
      for (const key of ['a', 'Escape', 'Enter', 'Tab']) {
        expect(globalKeyAction(key, shuttingDown)).toEqual({
          type: 'SET_SHUTDOWN',
          shuttingDown: false,
        })
      }
    })

    it('does not count a bare modifier as a key press', () => {
      for (const key of ['Shift', 'Control', 'Alt', 'Meta']) {
        expect(globalKeyAction(key, shuttingDown)).toBeNull()
      }
    })
  })
})
