/* Projects window contents (SPIKE-24). Row layout ported from the mockup's
   .proj-row block; the folder glyph is PixelIcon's `projects` variant, which
   is the same <svg> the mockup inlines three times. */

import './ProjectsApp.css'
import { PixelIcon } from '../icons/PixelIcon'
import { projects } from '../../data/projects'

/* The mockup's rows are plain text. Real ones have to be reachable, so the
   title is the link, because a separate "visit" affordance would be a second thing
   to hit for the same destination. `noopener noreferrer` on every external
   target: `noopener` denies the opened tab a handle on `window.opener`. */
export function ProjectsApp() {
  return (
    <>
      {projects.map((project) => (
        <div key={project.id} className="proj-row">
          <PixelIcon variant="projects" />
          <div>
            <a
              className="pixel proj-title"
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.title}
            </a>
            <p className="proj-desc">{project.description}</p>
            {project.repoUrl && (
              <a
                className="proj-repo"
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                [source]
              </a>
            )}
          </div>
        </div>
      ))}
    </>
  )
}
