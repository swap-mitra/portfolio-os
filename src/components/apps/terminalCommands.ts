/* Terminal command parser (architecture.md §9, SPIKE-27).

   Pure on purpose. `play` has to change the track, but reaching for the
   reducer from here would give the terminal its own idea of how that works;
   instead it returns the parsed video ID and TerminalApp dispatches the same
   LOAD_TRACK the music widget's URL box dispatches. One code path, and this
   file stays testable without React. */

import { about } from '../../data/about'
import { projects } from '../../data/projects'
import { PARSE_ERROR, extractVideoId } from '../audio/musicUtils'

export interface CommandResult {
  /** Printed one per line under the echoed command. */
  lines: string[]
  /** Set only by a `play` whose argument parsed. */
  videoId?: string
}

type Handler = (arg: string) => CommandResult

const out = (...lines: string[]): CommandResult => ({ lines })

/** Name to blurb, in the order `help` prints them. Adding a command means
    adding it here and to `commands` below, so `help` can't go stale. */
const HELP: Record<string, string> = {
  help: 'this list',
  whoami: 'who runs this machine',
  skills: 'what it is stocked with',
  projects: 'what it has built',
  'play <url>': 'change the background track (YouTube URL or bare ID)',
}

const commands: Record<string, Handler> = {
  help: () =>
    out(
      'Available commands:',
      ...Object.entries(HELP).map(([name, blurb]) => `  ${name.padEnd(13)}${blurb}`),
    ),

  whoami: () => out(about.name, about.tagline),

  skills: () => out(...about.skills.map((skill) => `  ${skill}`)),

  /* Stack and link rather than the full description: the descriptions are
     paragraphs, and four of them in a row is a wall of text in a terminal.
     The Projects window is where the prose belongs. */
  projects: () =>
    out(...projects.flatMap((project) => [project.title, `  ${project.stack}`, `  ${project.link}`])),

  play: (arg) => {
    if (arg === '') return out('Usage: play <youtube-url>')
    const videoId = extractVideoId(arg)
    // Same message the URL box shows, for the same mistake.
    if (videoId === null) return out(PARSE_ERROR)
    return { lines: [`Loading ${videoId}...`], videoId }
  },
}

/** Run one line of input. Never throws: anything a visitor can type is either
    a command or a "not found". */
export function runCommand(input: string): CommandResult {
  const trimmed = input.trim()
  if (trimmed === '') return out()

  const [name = '', ...rest] = trimmed.split(/\s+/)
  const handler = commands[name.toLowerCase()]
  if (handler === undefined) {
    return out(`command not found: ${name}. Type 'help' to see what works.`)
  }
  return handler(rest.join(' '))
}
