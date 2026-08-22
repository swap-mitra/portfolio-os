/* Terminal window (SPIKE-27). All the command knowledge lives in
   terminalCommands.ts; this file is scrollback, an input line, and the one
   dispatch that `play` needs. */

import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import './TerminalApp.css'
import { useOS } from '../../state/osContext'
import { runCommand } from './terminalCommands'

const BANNER = ['PORTFOLIO-OS TERMINAL v1.0', "Type 'help' for a list of commands.", '']

export function TerminalApp() {
  const { dispatch } = useOS()
  const [lines, setLines] = useState<string[]>(BANNER)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  /* Refs, not state: recalling a command re-renders through setInput, and
     nothing renders the history itself. */
  const history = useRef<string[]>([])
  const historyIndex = useRef(0)

  /* The input keeps focus, so appended output would otherwise scroll off the
     bottom of .window-body without the browser following it. */
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.scrollIntoView({ block: 'end' })
  }, [lines])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const entered = input
    setInput('')

    const { lines: output, videoId, clear } = runCommand(entered)
    setLines((prev) => (clear === true ? [] : [...prev, `> ${entered}`, ...output]))

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
