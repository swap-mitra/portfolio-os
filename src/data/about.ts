/* Bio copy for the About window, the short version the terminal's `whoami`
   prints, and the skill list behind `skills` (architecture.md §4). Drawn
   from the resume data in cvpilot's db.json and a LinkedIn summary, trimmed
   to what reads well in a window this size.

   No interface in types/content.ts for this one: nothing else has to match
   its shape, so the inferred shape of the literal is the type. */
export const about = {
  name: 'SWAPNIL MITRA',
  tagline: 'Software Engineer // Adrosonic, Mumbai',

  /* `whoami` in the terminal. Kept to short lines on purpose: a terminal
     that answers a one-word question with four paragraphs is a worse
     terminal, and ABOUT_ME.TXT is right there for the long version. */
  summary: [
    'Software engineer, 3 years in. Full-stack, integration work, cloud',
    'architecture, system design. Mostly .NET, Azure, React, TypeScript,',
    'and lately more solution architecture than any single stack.',
    '',
    'More interested in why something needs building than in how, which',
    'is usually the part that decides whether the how was worth it.',
    '',
    "Open ABOUT_ME.TXT for the long version. `skills` and `projects` work",
    'from here too.',
  ],

  /* Printed one per line by `skills`, so each entry is a whole line rather
     than a single skill. */
  skills: [
    'Languages:  JavaScript, TypeScript, C#, Python, SQL, Rust',
    'Frameworks: .NET Core, ASP.NET, React, Next.js, Fluent UI, LangChain',
    'Cloud:      Azure Functions, API Management, Logic Apps, DevOps, AWS',
    'Middleware: RabbitMQ, Docker, Microsoft Graph, SharePoint',
    'Data:       PostgreSQL, pgvector, SQL Server, Prisma, Drizzle',
    'Ops:        Prometheus, Grafana, Git, Azure DevOps',
  ],

  paragraphs: [
    'I build technology that solves real problems, not just technically elegant ones. Three years in, I have worn most of the hats: full-stack developer, integration engineer, cloud architect, system designer. What ties them together is wanting to understand why something needs to exist before working out how to build it.',
    "Day to day that means React, TypeScript, C#, .NET, and Azure. Lately more of my attention has gone to solution architecture, designing systems that are practical now and do not quietly become someone else's problem in two years. Currently Research and Innovation Engineer at Adrosonic, leading a team of four on an enterprise broker management platform and the Azure middleware layer underneath it.",
    'IIT Kharagpur gave me the foundation, but most of what I actually know came from getting things wrong, working out why, and doing it better the next time. That curiosity has only grown, mostly around AI, distributed systems, and what cloud infrastructure makes possible now that simply was not feasible a few years ago.',
    'I do my best work close to both the business problem and the engineering solution: translating between the two, pushing back when something does not add up, and helping a team get from a fuzzy idea to something real and reliable. The messy collaborative parts of the job are as good as the clean satisfying ones.',
    'This desktop is real, by the way. Drag the windows by their title bars, resize them from the corner, stack them up. Or open TERMINAL.EXE and type help.',
  ],
}
