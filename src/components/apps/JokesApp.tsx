/* HAVE_A_LAUGH window. One joke at a time, drawn from a shuffled deck so
   nothing repeats until every joke has been shown once. */

import './JokesApp.css'
import { useState } from 'react'
import { jokes } from '../../data/jokes'
import { shuffle } from './jokeDeck'

/** What the corner label says, per shape. */
const KIND_LABELS = {
  quip: 'THE JOB',
  stack: 'THE STACK',
  error: 'STDERR',
  translation: 'JOB AD, TRANSLATED',
} as const

export function JokesApp() {
  const [deck, setDeck] = useState(() => shuffle(jokes, Math.random))
  const [index, setIndex] = useState(0)

  const joke = deck[index]

  const another = () => {
    const next = index + 1
    if (next < deck.length) {
      setIndex(next)
      return
    }
    // Deck exhausted: reshuffle rather than looping the same order, so a
    // second pass through is not the first pass again.
    setDeck(shuffle(jokes, Math.random))
    setIndex(0)
  }

  // Only reachable if the data file is emptied, but the type says it can be.
  if (joke === undefined) return <p className="joke-body">Nothing funny here yet.</p>

  return (
    <div className="joke">
      <span className="joke-kind pixel">{KIND_LABELS[joke.kind]}</span>

      {joke.kind === 'error' ? (
        <pre className="joke-term">{joke.lines.join('\n')}</pre>
      ) : joke.kind === 'translation' ? (
        <dl className="joke-translation">
          <dt className="pixel">THEY WRITE</dt>
          <dd>{joke.says}</dd>
          <dt className="pixel">THEY MEAN</dt>
          <dd>{joke.means}</dd>
        </dl>
      ) : (
        <p className="joke-body">{joke.text}</p>
      )}

      <div className="joke-footer">
        <button className="joke-btn pixel" onClick={another}>
          ANOTHER
        </button>
        <span className="joke-count">
          {index + 1}/{deck.length}
        </span>
      </div>
    </div>
  )
}
