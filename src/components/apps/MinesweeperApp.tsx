/* Minesweeper window. The rules live in minesweeper.ts; this file is input
   and pixels, which is the split terminalCommands.ts already established.

   Deliberately no canvas and no animation loop: a board is a grid of buttons
   and React state, so it costs nothing when nothing is happening, survives a
   window resize for free, and sits under the CRT overlay without fighting it
   for repaints. */

import './MinesweeperApp.css'
import { useEffect, useRef, useState } from 'react'
import { LEVELS, flagsLeft, newGame, readout, reveal, toggleFlag } from './minesweeper'
import { loadBestTimes, saveBestTime } from '../../state/persistence'
import { playClick, playFlag, playLoss, playThunk, playWin } from '../audio/retroSound'
import { useOS } from '../../state/osContext'
import type { KeyboardEvent } from 'react'
import type { Cell, Game, LevelName } from './minesweeper'

const LEVEL_NAMES = Object.keys(LEVELS) as LevelName[]

/* Press Start 2P is an ASCII font, so the glyphs are ASCII. `*` for a mine
   and `!` for a flag read at 10px in a way that a nicer Unicode symbol would
   not, because it would fall back to a different face and break the grid. */
const MINE = '*'
const FLAG = '!'

/** The face on the reset button, which is the only status indicator the
    original ever needed. */
const FACES = { ready: ':)', playing: ':)', won: 'B)', lost: ':(' } as const

function cellFace(cell: Cell): string {
  if (cell.state === 'flagged') return FLAG
  if (cell.state === 'hidden') return ''
  if (cell.mine) return MINE
  return cell.adjacent === 0 ? '' : String(cell.adjacent)
}

/** Spoken description of a cell. A hidden cell must not leak what is under
    it, which rules out describing the board from the model. */
function cellLabel(cell: Cell, row: number, col: number): string {
  const what =
    cell.state === 'flagged'
      ? 'flagged'
      : cell.state === 'hidden'
        ? 'hidden'
        : cell.mine
          ? 'mine'
          : cell.adjacent === 0
            ? 'empty'
            : `${cell.adjacent}`
  return `Row ${row + 1}, column ${col + 1}: ${what}`
}

export function MinesweeperApp() {
  /* The game follows the desktop's mute button rather than growing its own.
     A visitor who silenced the site has already answered this question, and
     asking twice is how a portfolio ends up making noise it was told not to.

     Held in a ref so the sting fires on the status change and nothing else.
     As a dependency it would replay the win music every time someone touched
     the mute button afterwards. */
  const { state } = useOS()
  const muted = useRef(state.music.isMuted)
  muted.current = state.music.isMuted

  const [level, setLevel] = useState<LevelName>('BEGINNER')
  const [game, setGame] = useState(() => newGame('BEGINNER'))
  const [elapsed, setElapsed] = useState(0)
  const [bestTimes, setBestTimes] = useState(loadBestTimes)
  /* Tapping to flag needs a mode, because a phone has no right button. It is
     shown on desktop too rather than hidden behind a media query: a visitor
     who never discovers right-click can still play the whole game. */
  const [flagMode, setFlagMode] = useState(false)
  /** Roving tabindex: one cell in the grid is tab-reachable, arrows move it.
      256 tab stops inside a window would be unusable otherwise. */
  const [cursor, setCursor] = useState(0)

  /** Every sound goes through here, so the mute check is written once. */
  const sound = (effect: () => void) => {
    if (!muted.current) effect()
  }

  const start = (next: LevelName) => {
    sound(playThunk)
    setLevel(next)
    setGame(newGame(next))
    setElapsed(0)
    setCursor(0)
    setFlagMode(false)
  }

  // The clock runs only while a game is live, so a finished board freezes on
  // the time it was finished in.
  useEffect(() => {
    if (game.status !== 'playing') return
    const id = setInterval(() => setElapsed((seconds) => seconds + 1), 1000)
    return () => clearInterval(id)
  }, [game.status])

  /* A board can be won by the first click alone, when the flood happens to
     open everything safe at once. That never enters `playing`, so the clock
     never ticks and the time is 0, which the store rejects as unusable. One
     second is the smallest honest thing to call it. */
  const finalTime = Math.max(1, elapsed)

  useEffect(() => {
    if (game.status !== 'won') return
    setBestTimes(saveBestTime(level, finalTime))
  }, [game.status, level, finalTime])

  /* Sound fires on the move that caused it rather than from an effect
     watching `status`. A move is the thing the visitor did, and it is what
     they expect to hear; deriving it from a state transition afterwards
     means anything that re-runs or skips the effect silently costs a sound. */
  const applyMove = (next: Game, moved: 'reveal' | 'flag') => {
    // Identity means the rules rejected the move (a flagged cell, a finished
    // board), and a click that does nothing should sound like nothing.
    if (next === game) return
    if (next.status === 'lost') sound(playLoss)
    else if (next.status === 'won') sound(playWin)
    else sound(moved === 'flag' ? playFlag : playClick)
    setGame(next)
  }

  const flagAt = (index: number) => applyMove(toggleFlag(game, index), 'flag')

  const play = (index: number) =>
    flagMode ? flagAt(index) : applyMove(reveal(game, index), 'reveal')

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { rows, cols } = game
    const row = Math.floor(cursor / cols)
    const col = cursor % cols

    if (event.key === 'f' || event.key === 'F') {
      event.preventDefault()
      flagAt(cursor)
      return
    }

    /* Wrapping rather than clamping: it is one expression either way, and
       walking off the right edge onto the next row is what a grid of 256
       cells wants. */
    let next: number
    if (event.key === 'ArrowUp') next = ((row - 1 + rows) % rows) * cols + col
    else if (event.key === 'ArrowDown') next = ((row + 1) % rows) * cols + col
    else if (event.key === 'ArrowLeft') next = row * cols + ((col - 1 + cols) % cols)
    else if (event.key === 'ArrowRight') next = row * cols + ((col + 1) % cols)
    else return

    // Without this the arrow keys scroll the window body under the board.
    event.preventDefault()
    setCursor(next)
    event.currentTarget.querySelector<HTMLElement>(`[data-cell="${next}"]`)?.focus()
  }

  const best = bestTimes[level]

  return (
    <div className="ms">
      <div className="ms-levels pixel">
        {LEVEL_NAMES.map((name) => (
          <button
            key={name}
            className={name === level ? 'ms-level ms-level--on' : 'ms-level'}
            aria-pressed={name === level}
            onClick={() => start(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="ms-board">
        <div className="ms-header pixel">
          <div className="ms-gauge">
            <span className="ms-readout" aria-label={`${flagsLeft(game)} mines left`}>
              {readout(flagsLeft(game))}
            </span>
            {/* The original leaves these two unlabelled and expects you to
                already know. Nobody arriving at a portfolio does. */}
            <span className="ms-gauge-label" aria-hidden="true">
              MINES
            </span>
          </div>
          <button className="ms-face" aria-label="new game" onClick={() => start(level)}>
            {FACES[game.status]}
          </button>
          <div className="ms-gauge">
            <span className="ms-readout" aria-label={`${elapsed} seconds elapsed`}>
              {readout(elapsed)}
            </span>
            <span className="ms-gauge-label" aria-hidden="true">
              TIME
            </span>
          </div>
        </div>

        <div
          className="ms-grid"
          role="grid"
          aria-label={`Minesweeper, ${game.rows} by ${game.cols}, ${game.mines} mines`}
          style={{ gridTemplateColumns: `repeat(${game.cols}, var(--ms-cell))` }}
          onKeyDown={onGridKeyDown}
        >
          {game.cells.map((cell, index) => (
            <button
              key={index}
              data-cell={index}
              data-adjacent={cell.state === 'revealed' && !cell.mine ? cell.adjacent : undefined}
              className={cell.state === 'revealed' ? 'ms-cell ms-cell--open' : 'ms-cell'}
              tabIndex={index === cursor ? 0 : -1}
              aria-label={cellLabel(cell, Math.floor(index / game.cols), index % game.cols)}
              onFocus={() => setCursor(index)}
              onClick={() => play(index)}
              onContextMenu={(event) => {
                event.preventDefault()
                setGame((current) => toggleFlag(current, index))
              }}
            >
              {cellFace(cell)}
            </button>
          ))}
        </div>
      </div>

      <div className="ms-footer">
        <button
          className={flagMode ? 'ms-flagmode ms-flagmode--on pixel' : 'ms-flagmode pixel'}
          aria-pressed={flagMode}
          onClick={() => setFlagMode((on) => !on)}
        >
          {FLAG} FLAG MODE {flagMode ? 'ON' : 'OFF'}
        </button>
        <p className="ms-hint">
          {game.status === 'lost'
            ? 'Boom. The face resets it.'
            : game.status === 'won'
              ? `Swept in ${finalTime}s.`
              : 'Right-click or flag mode to flag. Arrows and F work too.'}
        </p>
        <p className={best === undefined ? 'ms-best ms-best--empty' : 'ms-best'}>
          {/* Spelled out rather than a row of dashes: a placeholder that
              looks like a glitch gets read as one. */}
          BEST {level}: {best === undefined ? 'no record yet' : `${best}s`}
        </p>
      </div>
    </div>
  )
}
