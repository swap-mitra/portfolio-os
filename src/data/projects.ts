/* The portfolio's project list (architecture.md §4). Placeholder entries:
   these three are the mockup's, kept so the window matches the approved
   reference; project-spec.md §7 has the owner supplying the real ones.

   Adding a project means adding an object here and nothing else. The URLs
   are deliberately example.com so a placeholder can't be mistaken for a
   real link that happens to be broken. */

import type { Project } from '../types/content'

export const projects: Project[] = [
  {
    id: 'neon-runner',
    title: 'NEON_RUNNER',
    description: 'Retro-styled endless runner, built with vanilla JS + canvas.',
    link: 'https://example.com/neon-runner',
    repoUrl: 'https://example.com/neon-runner-source',
  },
  {
    id: 'pixel-cms',
    title: 'PIXEL_CMS',
    description: 'Headless CMS with a pixel-art admin dashboard.',
    link: 'https://example.com/pixel-cms',
  },
  {
    id: 'synth-api',
    title: 'SYNTH_API',
    description: 'REST API that generates chiptune audio on demand.',
    link: 'https://example.com/synth-api',
    repoUrl: 'https://example.com/synth-api-source',
  },
]
