/* Shapes for the content files in src/data/ (architecture.md §4). Content is
   compiled in, not fetched, so these types are the only validation there is
   and the only validation there needs to be. */

export interface Project {
  /** Stable key for rendering. Not shown to visitors. */
  id: string
  title: string
  /** One line. The row layout gives it a single wrapped paragraph, not an
      essay, and anything longer belongs behind the link. */
  description: string
  /** Where the project actually lives (demo, article, store page). */
  link: string
  /** Source, when it's public. Plenty of real work has no repo to show. */
  repoUrl?: string
}
