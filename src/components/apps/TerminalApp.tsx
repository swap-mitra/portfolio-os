/* Terminal window (SPIKE-27). All the command knowledge lives in
   terminalCommands.ts; this file is scrollback, an input line, and the one
   dispatch that `play` needs.

   Output arrives a line at a time with a tick, the way a machine answering
   sounds, rather than as one dump. The prompt draws its own blinking block
   cursor: the real input sits over the row at opacity 0 so it still takes
   focus and the phone keyboard, while a span echoes what it holds. The one
   thing lost is a visible caret when editing mid-line, which nobody does in
   a terminal with seven commands. */

import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import './TerminalApp.css'
import { useOS } from '../../state/osContext'
import { runCommand } from './terminalCommands'
import { playTick } from '../audio/retroSound'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

const BANNER = ['PORTFOLIO-OS TERMINAL v1.0', "Type 'help' for a list of commands.", '']

/** Gap between printed lines. `help` is nine lines, so it lands in a
    quarter of a second: slow enough to see it arrive, never slow enough to
    wait for. */
const LINE_MS = 28

export function TerminalApp() {
  const { state, dispatch } = useOS()
  const instant = usePrefersReducedMotion()
  const [lines, setLines] = useState<string[]>(BANNER)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  /* Refs, not state: recalling a command re-renders through setInput, and
     nothing renders the history itself. */
  const history = useRef<string[]>([])
  const historyIndex = useRef(0)
  /* Output waiting to be printed, drained one line per tick below. A queue
     rather than one timeout per line, so a second command typed while the
     first is still printing lands after it instead of interleaved. */
  const queue = useRef<string[]>([])
  const [printing, setPrinting] = useState(false)
  /* Same rule as Minesweeper: the site's mute covers every sound it makes. */
  const muted = useRef(state.music.isMuted)
  muted.current = state.music.isMuted

  useEffect(() => {
    if (!printing) return
    const id = setInterval(() => {
      const next = queue.current.shift()
      if (next === undefined) {
        setPrinting(false)
        return
      }
      setLines((prev) => [...prev, next])
      if (next !== '' && !muted.current) playTick()
    }, LINE_MS)
    return () => clearInterval(id)
  }, [printing])

  /* The input keeps focus, so appended output would otherwise scroll off the
     bottom of .window-body without the browser following it. */
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.scrollIntoView({ block: 'end' })
  }, [lines])

  const print = (output: string[]) => {
    if (instant) {
      setLines((prev) => [...prev, ...output])
      return
    }
    queue.current.push(...output)
    setPrinting(true)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const entered = input
    setInput('')

    const { lines: output, videoId, clear } = runCommand(entered)
    if (clear === true) {
      queue.current = []
      setLines([])
    } else {
      setLines((prev) => [...prev, `> ${entered}`])
      print(output)
    }

    if (entered.trim() !== '') {
      history.current = [...history.current, entered]
    }
    historyIndex.current = history.current.length

    // The same action the music widget's URL box dispatches (architecture.md §9).
    if (videoId !== undefined) dispatch({ type: 'LOAD_TRACK', videoId })
  }

  const recall = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    if (history.current.length === 0) return
    e.preventDefault()

    /* One past the newest entry is a real position: it's the empty line you
       get back by pressing Down until you're out of history. */
    const step = e.key === 'ArrowUp' ? -1 : 1
    historyIndex.current = Math.max(
      0,
      Math.min(history.current.length, historyIndex.current + step),
    )
    setInput(history.current[historyIndex.current] ?? '')
  }

  return (
    // Clicking anywhere in a terminal should put the caret back in the prompt.
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      {lines.map((line, i) => (
        // Index keys: output lines repeat (blank lines, the same command run
        // twice) and the list is append-only, so nothing ever reorders.
        // oxlint-disable-next-line react/no-array-index-key
        <div className="terminal-line" key={i}>
          {line}
        </div>
      ))}
      <form className="terminal-form" onSubmit={submit}>
        <span className="terminal-prompt">&gt;</span>
        <span className="terminal-echo">{input}</span>
        <span className="terminal-cursor" aria-hidden="true" />
        <input
          ref={inputRef}
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={recall}
          aria-label="terminal input"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  )
}
