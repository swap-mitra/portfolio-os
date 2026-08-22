/* Bio copy for the About window, plus the skill list the terminal's `skills`
   command prints (architecture.md §4). Placeholder text:
   project-spec.md §7 lists the real bio as owner-supplied before launch.
   Swap the strings here; AboutApp needs no changes.

   No interface in types/content.ts for this one: nothing else has to match
   its shape, so the inferred shape of the literal is the type. */
export const about = {
  name: 'SWAP MITRA',
  tagline: 'Developer // placeholder tagline',
  /* Printed one per line by `skills` in the terminal. Placeholder stack:
     swap these for the real one and the command follows. */
  skills: [
    'TypeScript / JavaScript',
    'React',
    'Node.js',
    'CSS (and the parts of it nobody enjoys)',
    'Git',
  ],
  paragraphs: [
    'Placeholder bio. This is where the real about-me copy goes: who you are, what you build, and what you are looking for.',
    'A second paragraph of placeholder text so the window has enough content to scroll and the line spacing is visible at a realistic length.',
    'Drag this window by its title bar, resize it from the bottom-right corner, or shove it behind another one. It is a fake operating system and it takes that seriously.',
  ],
}
