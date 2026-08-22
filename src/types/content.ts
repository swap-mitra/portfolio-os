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
  /** What it's built with, as one comma-separated line. Shown verbatim. */
  stack: string
  /** Where the project actually lives: repo, demo, article, store page. */
  link: string
}
