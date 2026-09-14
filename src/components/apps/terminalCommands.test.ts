import { describe, expect, it } from 'vitest'
import { runCommand } from './terminalCommands'
import { about } from '../../data/about'
import { projects } from '../../data/projects'
import { experience } from '../../data/experience'
import { PARSE_ERROR } from '../audio/musicUtils'

describe('runCommand', () => {
  it('lists every command it can run, so help cannot go stale', () => {
    const { lines } = runCommand('help')
    for (const name of ['help', 'whoami', 'skills', 'projects', 'experience', 'keys', 'play']) {
      expect(lines.join('\n')).toContain(name)
      expect(runCommand(name).lines.join('\n')).not.toContain('command not found')
    }
  })

  it('reads whoami and skills straight out of the about data', () => {
    const { lines } = runCommand('whoami')
    expect(lines.slice(0, 2)).toEqual([about.name, about.tagline])
    expect(lines.join('\n')).toContain(about.summary[0]!)
    expect(runCommand('skills').lines.join('\n')).toContain(about.skills[0]!)
  })

  it('clears the screen rather than printing anything', () => {
    expect(runCommand('clear')).toEqual({ lines: [], clear: true })
  })

  it('prints every project', () => {
    const printed = runCommand('projects').lines.join('\n')
    for (const project of projects) {
      expect(printed).toContain(project.title)
      expect(printed).toContain(project.link)
    }
  })

  it('prints every employer and engagement', () => {
    const printed = runCommand('experience').lines.join('\n')
    for (const role of experience.roles) {
      expect(printed).toContain(role.company)
      for (const engagement of role.engagements) expect(printed).toContain(engagement.name)
    }
    expect(printed).toContain(experience.education.school)
  })

  it('documents a shortcut for every part of the desktop that has one', () => {
    const printed = runCommand('keys').lines.join('\n')
    for (const heading of ['Desktop:', 'Terminal:', 'Minesweeper:']) {
      expect(printed).toContain(heading)
    }
    for (const key of ['Escape', 'Tab', 'Up / Down', 'Arrows', 'Right-click']) {
      expect(printed).toContain(key)
    }
  })

  it('names the command it did not recognise', () => {
    const { lines, videoId } = runCommand('frobnicate now')
    expect(lines[0]).toContain('frobnicate')
    expect(lines[0]).toContain('help')
    expect(videoId).toBeUndefined()
  })

  it('reports the sudo incident', () => {
    expect(runCommand('sudo rm -rf /').lines[0]).toContain('sudoers')
  })

  it('ignores case and surrounding whitespace', () => {
    expect(runCommand('  WhoAmI  ').lines).toEqual(runCommand('whoami').lines)
  })

  it('returns nothing at all for a blank line', () => {
    expect(runCommand('   ').lines).toEqual([])
  })

  describe('play', () => {
    it('hands back the video ID for a URL the music player would accept', () => {
      expect(runCommand('play https://www.youtube.com/watch?v=dQw4w9WgXcQ').videoId).toBe(
        'dQw4w9WgXcQ',
      )
      expect(runCommand('play dQw4w9WgXcQ').videoId).toBe('dQw4w9WgXcQ')
    })

    it('reports an unparseable argument without asking for a track change', () => {
      const { lines, videoId } = runCommand('play not-a-url')
      expect(lines).toEqual([PARSE_ERROR])
      expect(videoId).toBeUndefined()
    })

    it('explains itself when given no argument', () => {
      const { lines, videoId } = runCommand('play')
      expect(lines[0]).toContain('Usage')
      expect(videoId).toBeUndefined()
    })
  })
})
