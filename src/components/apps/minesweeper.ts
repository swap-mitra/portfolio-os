/* Minesweeper rules (the game the app in a fake retro OS has to be).

   Pure on purpose, same call as terminalCommands.ts: every function takes a
   game and returns a new one, so the rules are testable without a DOM and the
   component is left with nothing but rendering and input. Randomness arrives
   as a parameter for the same reason. */

export type CellState = 'hidden' | 'revealed' | 'flagged'

export interface Cell {
  mine: boolean
  /** Mines among the eight surrounding cells. Zero until the mines are laid. */
  adjacent: number
  state: CellState
}

/** `ready` is a board with no mines in it yet (see `reveal`). */
export type Status = 'ready' | 'playing' | 'won' | 'lost'

export interface Game {
  rows: number
  cols: number
  mines: number
  /** Row-major, `row * cols + col`. Flat because every operation here is
      either a lookup by index or a sweep over the whole board. */
  cells: Cell[]
  status: Status
}

export interface Level {
  rows: number
  cols: number
  mines: number
}

/** The original's first two boards. Its third (30x16) is wider than the
    window, and a board you have to scroll sideways is not the game. */
export const LEVELS = {
  BEGINNER: { rows: 9, cols: 9, mines: 10 },
  EXPERT: { rows: 16, cols: 16, mines: 40 },
} as const

export type LevelName = keyof typeof LEVELS

/** Takes a named level, or an explicit one, which is how the tests get a
    board small enough to reason about cell by cell. */
export function newGame(level: LevelName | Level): Game {
  const { rows, cols, mines } = typeof level === 'string' ? LEVELS[level] : level
  return {
    rows,
    cols,
    mines,
    cells: Array.from({ length: rows * cols }, () => ({
      mine: false,
      adjacent: 0,
      state: 'hidden' as CellState,
    })),
    status: 'ready',
  }
}

/** The up-to-eight cells around `index`, minus whatever falls off an edge. */
function neighbours(game: Pick<Game, 'rows' | 'cols'>, index: number): number[] {
  const row = Math.floor(index / game.cols)
  const col = index % game.cols
  const found: number[] = []
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue
      const r = row + dr
      const c = col + dc
      if (r < 0 || r >= game.rows || c < 0 || c >= game.cols) continue
      found.push(r * game.cols + c)
    }
  }
  return found
}

/** Lay the mines, avoiding `safeIndex`, then count each cell's neighbours.
    Rejection sampling: with 40 mines in 256 cells the retry rate is noise. */
function layMines(game: Game, safeIndex: number, random: () => number): Game {
  const total = game.rows * game.cols
  // One cell is reserved for the first click, so the board can always fit
  // this many. A level asking for more would otherwise spin forever here.
  const wanted = Math.min(game.mines, total - 1)

  const mined = new Set<number>()
  while (mined.size < wanted) {
    const at = Math.floor(random() * total)
    if (at === safeIndex) continue
    mined.add(at)
  }

  const cells = game.cells.map((cell, i) => ({ ...cell, mine: mined.has(i) }))
  for (const [i, cell] of cells.entries()) {
    cell.adjacent = neighbours(game, i).filter((n) => cells[n]?.mine === true).length
  }
  return { ...game, cells }
}

/** Reveal a cell, opening the surrounding pocket if it turns out to be empty.

    The mines are laid here rather than in `newGame` because the first click
    must never lose: a board that can kill you on move one is a coin toss, not
    a puzzle, and the original doesn't do that either. */
export function reveal(game: Game, index: number, random: () => number = Math.random): Game {
  if (game.status === 'won' || game.status === 'lost') return game
  // A flagged cell is deliberately click-proof: that's what the flag is for.
  if (game.cells[index]?.state !== 'hidden') return game

  const base: Game =
    game.status === 'ready'
      ? { ...layMines(game, index, random), status: 'playing' }
      : game

  const cells = base.cells.slice()

  if (cells[index]?.mine === true) {
    return {
      ...base,
      status: 'lost',
      // Show the whole board on a loss; hiding it now would just be cruel.
      cells: cells.map((cell) => (cell.mine ? { ...cell, state: 'revealed' } : cell)),
    }
  }

  /* Flood fill outwards from an empty cell. A numbered cell is the edge of
     the pocket: it gets revealed but doesn't open its own neighbours, which
     is the whole reason the numbers are worth reading. Flagged cells fail the
     `hidden` check, so the flood leaves a visitor's flags where they put
     them. */
  const queue = [index]
  while (queue.length > 0) {
    const at = queue.pop()
    if (at === undefined) continue
    const cell = cells[at]
    if (cell === undefined || cell.state !== 'hidden') continue
    cells[at] = { ...cell, state: 'revealed' }
    if (cell.adjacent === 0) queue.push(...neighbours(base, at))
  }

  // Winning means every safe cell is open. The mines never have to be flagged
  // correctly, so flagging them on the way out is a courtesy, not the test.
  const won = cells.every((cell) => cell.mine || cell.state === 'revealed')
  if (!won) return { ...base, cells }
  return {
    ...base,
    status: 'won',
    cells: cells.map((cell) => (cell.mine ? { ...cell, state: 'flagged' } : cell)),
  }
}

/** Flag or unflag a hidden cell. Flagging before the first reveal is allowed
    and leaves the board `ready`, so it still can't lay a mine under you. */
export function toggleFlag(game: Game, index: number): Game {
  if (game.status === 'won' || game.status === 'lost') return game
  const cell = game.cells[index]
  if (cell === undefined || cell.state === 'revealed') return game

  const cells = game.cells.slice()
  cells[index] = { ...cell, state: cell.state === 'flagged' ? 'hidden' : 'flagged' }
  return { ...game, cells }
}

/** Mines minus flags planted. Goes negative when you over-flag, as the
    original's counter does. It counts flags, it doesn't grade them. */
export function flagsLeft(game: Game): number {
  return game.mines - game.cells.filter((cell) => cell.state === 'flagged').length
}

/** Three-digit LED readout. Clamped rather than widened, because the header
    layout is three characters and a long game shouldn't reflow it. */
export function readout(value: number): string {
  const clamped = Math.max(-99, Math.min(999, Math.trunc(value)))
  return clamped < 0
    ? `-${String(-clamped).padStart(2, '0')}`
    : String(clamped).padStart(3, '0')
}
