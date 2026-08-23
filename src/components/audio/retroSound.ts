/* Win and loss stings for Minesweeper, synthesized rather than shipped.

   Two square-wave sweeps are about thirty lines of Web Audio, which beats
   the smallest .wav worth listening to on every axis that matters here: no
   asset to source or license, nothing to fetch or decode, and no bytes in
   the bundle. Square wave because that is the sound the fiction is quoting,
   one oscillator with hard edges and no filter on it. */

let context: AudioContext | null = null

/** Built on first use rather than at import: a context created before any
    user gesture starts suspended, and some browsers never resume it. Every
    caller here is already downstream of a click. */
function audio(): AudioContext | null {
  try {
    context ??= new AudioContext()
    if (context.state === 'suspended') void context.resume()
    return context
  } catch {
    // No Web Audio (an old browser, a locked-down one, or a test runner).
    // A missing sound effect is not worth a broken game.
    return null
  }
}

interface Tone {
  /** Hz at the start of the note. */
  from: number
  /** Hz at the end. Equal to `from` for a flat note, lower for a fall. */
  to: number
  /** Seconds after the sting begins. */
  at: number
  duration: number
}

/** Quiet on purpose. These play over whatever track the visitor has running,
    and a game blip that ducks the music would be its own bug report. Clicks
    sit below the stings because you hear a hundred of them a game and two
    of these. */
const STING = 0.07
const CLICK = 0.035

function play(tones: Tone[], level: number): void {
  const ctx = audio()
  if (ctx === null) return

  const now = ctx.currentTime
  for (const tone of tones) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = now + tone.at
    const end = start + tone.duration

    osc.type = 'square'
    osc.frequency.setValueAtTime(tone.from, start)
    if (tone.to !== tone.from) osc.frequency.exponentialRampToValueAtTime(tone.to, end)

    /* Fade the tail instead of just stopping the oscillator: a square wave
       cut mid-cycle clicks, and the click is louder than the note it ends. */
    gain.gain.setValueAtTime(level, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)

    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(end)
  }
}

/** Four notes up a major triad, the last one held. */
export function playWin(): void {
  play(
    [
      { from: 523, to: 523, at: 0, duration: 0.09 },
      { from: 659, to: 659, at: 0.09, duration: 0.09 },
      { from: 784, to: 784, at: 0.18, duration: 0.09 },
      { from: 1047, to: 1047, at: 0.27, duration: 0.24 },
    ],
    STING,
  )
}

/** A falling sweep over a low rumble: the sound of the floor giving way. */
export function playLoss(): void {
  play(
    [
      { from: 320, to: 60, at: 0, duration: 0.5 },
      { from: 120, to: 40, at: 0.04, duration: 0.46 },
    ],
    STING,
  )
}

/* The three below are all shorter than 80ms. That is what makes a blip read
   as mechanical rather than musical: the ear hears the attack and the stop,
   not the pitch. Lengthen any of them and it turns into a note. */

/** Opening a cell: one short downward tick. */
export function playClick(): void {
  play([{ from: 1000, to: 600, at: 0, duration: 0.03 }], CLICK)
}

/** Planting or pulling a flag: two ticks, pitched above the reveal so the
    two moves are told apart without looking. */
export function playFlag(): void {
  play(
    [
      { from: 1400, to: 1400, at: 0, duration: 0.02 },
      { from: 1900, to: 1900, at: 0.035, duration: 0.02 },
    ],
    CLICK,
  )
}

/** The reset lever: a low clunk with a tick on top of it. */
export function playThunk(): void {
  play(
    [
      { from: 300, to: 90, at: 0, duration: 0.07 },
      { from: 900, to: 500, at: 0, duration: 0.025 },
    ],
    STING,
  )
}
