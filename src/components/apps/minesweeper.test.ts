import { describe, expect, it } from 'vitest'
import { LEVELS, flagsLeft, newGame, readout, reveal, toggleFlag } from './minesweeper'
import type { Game, LevelName } from './minesweeper'

/* A `random` that walks a fixed list of cell indices, converted back into the
   [0,1) that mine placement samples. The list must hold at least as many
   distinct cells as the level has mines, or placement never finishes. */
const minesAt = (game: Game, ...indices: number[]) => {
  const total = game.rows * game.cols
  let i = 0
  return () => {
    const at = indices[i % indices.length] ?? 0
    i += 1
    return at / total
  }
}

/** One mine, in the far corner, on a board small enough to check by hand. */
const tiny = () => newGame({ rows: 4, cols: 4, mines: 1 })

const revealedCount = (game: Game) =>
  game.cells.filter((cell) => cell.state === 'revealed').length

describe('newGame', () => {
  it('starts every level hidden, unmined, and ready', () => {
    for (const [name, level] of Object.entries(LEVELS)) {
      const game = newGame(name as LevelName)
      expect(game.cells).toHaveLength(level.rows * level.cols)
      expect(game.cells.every((cell) => cell.state === 'hidden' && !cell.mine)).toBe(true)
      expect(game.status).toBe('ready')
      expect(flagsLeft(game)).toBe(level.mines)
    }
  })
})

describe('reveal', () => {
  it('never puts a mine under the first click', () => {
    /* Eight mines into nine cells: there is exactly one safe cell, and it has
       to be the one clicked, whatever the random source says. Run over every
       cell so no single lucky draw can pass this. */
    for (let first = 0; first < 9; first += 1) {
      const played = reveal(newGame({ rows: 3, cols: 3, mines: 8 }), first)
      expect(played.cells[first]?.mine).toBe(false)
      expect(played.status).not.toBe('lost')
      expect(played.cells.filter((cell) => cell.mine)).toHaveLength(8)
    }
  })

  it('counts the mines around each cell', () => {
    const game = newGame({ rows: 4, cols: 4, mines: 2 })
    // Mines at 0 and 2 along the top row: cell 1 sits between them, and cell
    // 5 is diagonally under both.
    const played = reveal(game, 15, minesAt(game, 0, 2))
    expect(played.cells[1]?.adjacent).toBe(2)
    expect(played.cells[5]?.adjacent).toBe(2)
    expect(played.cells[3]?.adjacent).toBe(1)
    expect(played.cells[9]?.adjacent).toBe(0)
  })

  it('opens the whole board from a corner when the only mine is far away', () => {
    const game = tiny()
    const played = reveal(game, 0, minesAt(game, 15))
    expect(revealedCount(played)).toBe(15)
    expect(played.status).toBe('won')
    // Winning plants the last flag for you, so the counter reads zero.
    expect(played.cells[15]?.state).toBe('flagged')
    expect(flagsLeft(played)).toBe(0)
  })

  it('stops the flood at a numbered cell', () => {
    const game = tiny()
    // Cell 14 is next to the mine at 15, so it is a number, not a pocket.
    const played = reveal(game, 14, minesAt(game, 15))
    expect(played.cells[14]?.adjacent).toBe(1)
    expect(revealedCount(played)).toBe(1)
    expect(played.status).toBe('playing')
  })

  it('ends the game and shows every mine when one is clicked', () => {
    const game = newGame({ rows: 4, cols: 4, mines: 2 })
    // Interior mines, so the first click is a number and the flood does not
    // finish the board before there is anything left to step on.
    const started = reveal(game, 0, minesAt(game, 5, 10))
    const lost = reveal(started, 5)
    expect(lost.status).toBe('lost')
    expect(lost.cells.filter((cell) => cell.mine && cell.state === 'revealed')).toHaveLength(2)
  })

  it('ignores a click on a flagged cell, and any click once the game is over', () => {
    const game = tiny()
    const started = reveal(game, 0, minesAt(game, 15))
    // That first click won the 1-mine board, so use a 2-mine one to have a
    // live game with something left to click.
    const live = reveal(newGame({ rows: 4, cols: 4, mines: 2 }), 0, minesAt(game, 14, 15))
    const flagged = toggleFlag(live, 15)
    expect(reveal(flagged, 15)).toBe(flagged)

    expect(started.status).toBe('won')
    expect(reveal(started, 1)).toBe(started)
  })

  it('reaches a win by sweeping a full-size board', () => {
    /* The 4x4 cases above win in a single flood. This plays a real BEGINNER
       board cell by cell, which is the path a visitor actually takes, and
       checks that finishing it says `won` rather than anything else. */
    const game = newGame('BEGINNER')
    const mines = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    let played = reveal(game, 80, minesAt(game, ...mines))

    for (let index = 0; index < game.rows * game.cols; index += 1) {
      if (mines.includes(index)) continue
      played = reveal(played, index)
      expect(played.status).not.toBe('lost')
    }

    expect(played.status).toBe('won')
    expect(played.cells.filter((cell) => cell.state === 'flagged')).toHaveLength(mines.length)
    expect(flagsLeft(played)).toBe(0)
  })

  it('ends the same way on EXPERT as on BEGINNER', () => {
    /* Reported as sounding different between the two levels, and the sounds
       hang off the status. Nothing in here reads the level, so this pins that
       both boards reach both endings by the same path. */
    const game = newGame('EXPERT')
    /* Scattered, not clustered. Forty mines in one block leaves every safe
       cell connected, so the first click floods the lot and wins on move one,
       which is real behaviour but tests nothing about the endings. */
    const mines = Array.from({ length: game.mines }, (_, i) => i * 6 + 1)
    // 254 sits next to the mine at 253, so it opens as a number and leaves
    // the rest of the board to play.
    const started = reveal(game, 254, minesAt(game, ...mines))
    expect(started.status).toBe('playing')

    expect(reveal(started, 1).status).toBe('lost')

    let swept = started
    for (let index = 0; index < game.rows * game.cols; index += 1) {
      if (mines.includes(index)) continue
      swept = reveal(swept, index)
      expect(swept.status).not.toBe('lost')
    }
    expect(swept.status).toBe('won')
  })

  it('leaves the board it was given alone', () => {
    const game = tiny()
    reveal(game, 0, minesAt(game, 15))
    expect(game.cells.every((cell) => cell.state === 'hidden' && !cell.mine)).toBe(true)
    expect(game.status).toBe('ready')
  })
})

describe('toggleFlag', () => {
  it('flags and unflags a hidden cell, and counts down the mines left', () => {
    const game = newGame('BEGINNER')
    const flagged = toggleFlag(game, 5)
    expect(flagged.cells[5]?.state).toBe('flagged')
    expect(flagsLeft(flagged)).toBe(game.mines - 1)
    expect(toggleFlag(flagged, 5).cells[5]?.state).toBe('hidden')
  })

  it('cannot flag a revealed cell', () => {
    const game = tiny()
    const started = reveal(game, 14, minesAt(game, 15))
    expect(toggleFlag(started, 14)).toBe(started)
  })

  it('does not lay mines, so the first click is still safe after flagging', () => {
    const game = newGame({ rows: 3, cols: 3, mines: 8 })
    const flagged = toggleFlag(game, 5)
    expect(flagged.status).toBe('ready')
    expect(reveal(flagged, 0).cells[0]?.mine).toBe(false)
  })
})

describe('readout', () => {
  it('pads to three digits and clamps rather than reflowing the header', () => {
    expect(readout(0)).toBe('000')
    expect(readout(10)).toBe('010')
    expect(readout(999)).toBe('999')
    expect(readout(1200)).toBe('999')
    expect(readout(-5)).toBe('-05')
    expect(readout(-500)).toBe('-99')
  })
})
