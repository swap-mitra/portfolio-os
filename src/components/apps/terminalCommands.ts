/* Terminal command parser (architecture.md §9, SPIKE-27).

   Pure on purpose. `play` has to change the track, but reaching for the
   reducer from here would give the terminal its own idea of how that works;
   instead it returns the parsed video ID and TerminalApp dispatches the same
   LOAD_TRACK the music widget's URL box dispatches. One code path, and this
   file stays testable without React. */

import { about } from '../../data/about'
import { projects } from '../../data/projects'
import { experience } from '../../data/experience'
import { PARSE_ERROR, extractVideoId } from '../audio/musicUtils'

export interface CommandResult {
  /** Printed one per line under the echoed command. */
  lines: string[]
  /** Set only by a `play` whose argument parsed. */
  videoId?: string
  /** `clear` empties the scrollback instead of appending to it. */
  clear?: true
}

type Handler = (arg: string) => CommandResult

const out = (...lines: string[]): CommandResult => ({ lines })

/** Two-column layout for `keys`, indented under its heading. The key column
    is padded to the widest entry so the descriptions line up. */
const keyTable = (rows: [string, string][]): string[] => {
  const width = Math.max(...rows.map(([key]) => key.length))
  return rows.map(([key, meaning]) => `  ${key.padEnd(width)}  ${meaning}`)
}

/** Name to blurb, in the order `help` prints them. Adding a command means
    adding it here and to `commands` below, so `help` can't go stale. */
const HELP: Record<string, string> = {
  help: 'show this list',
  whoami: 'a short introduction',
  skills: 'languages, frameworks, and tools',
  projects: 'what I have built, with links',
  experience: 'where I have worked, one line per engagement',
  keys: 'keyboard shortcuts for the whole desktop',
  'play <url>': 'play a YouTube track in the background',
  clear: 'clear the screen',
}

const commands: Record<string, Handler> = {
  help: () =>
    out(
      'Available commands:',
      ...Object.entries(HELP).map(([name, blurb]) => `  ${name.padEnd(13)}${blurb}`),
    ),

  whoami: () => out(about.name, about.tagline, '', ...about.summary),

  skills: () => out(...about.skills.map((skill) => `  ${skill}`)),

  /* Stack and link rather than the full description: the descriptions are
     paragraphs, and four of them in a row is a wall of text in a terminal.
     The Projects window is where the prose belongs. */
  projects: () =>
    out(...projects.flatMap((project) => [project.title, `  ${project.stack}`, `  ${project.link}`])),

  /* One line per engagement, for the same reason `projects` prints the
     stack rather than the description: EXPERIENCE.LOG has the bullets. */
  experience: () =>
    out(
      ...experience.roles.flatMap((role) => [
        `${role.company} | ${role.title} | ${role.period}`,
        ...role.engagements.flatMap((e) => [`  ${e.name}`, `    ${e.summary}`]),
      ]),
      '',
      `${experience.education.school} | ${experience.education.degree} | ${experience.education.period}`,
    ),

  /* Shortcuts nothing else on the desktop advertises. Kept as data rather
     than prose so a missing column is obvious at a glance, and deliberately
     hand-written: the handlers that implement these live in six different
     files, so there is nothing to derive it from that wouldn't be a bigger
     lie than a list. Anything added here has to be added there first. */
  keys: () =>
    out(
      'Desktop:',
      ...keyTable([
        ['Tab / Shift+Tab', 'move between icons, windows, and the taskbar'],
        ['Enter / Space', 'open the selected icon or press a button'],
        ['Escape', 'close the focused window, or the start menu'],
        ['Any key', 'skip the boot, wake the screensaver, or leave shutdown'],
      ]),
      '',
      'Terminal:',
      ...keyTable([
        ['Up / Down', 'walk back through commands you have run'],
        ['Enter', 'run the line'],
      ]),
      '',
      'Minesweeper:',
      ...keyTable([
        ['Arrows', 'move around the board, wrapping at the edges'],
        ['Enter / Space', 'reveal the cell under the cursor'],
        ['F', 'flag the cell under the cursor'],
        ['Right-click', 'flag a cell with the mouse'],
      ]),
    ),

  clear: () => ({ lines: [], clear: true }),

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
