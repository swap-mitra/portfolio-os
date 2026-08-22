/* Bio copy for the About window, plus the skill list the terminal's `skills`
   command prints (architecture.md §4). Sourced from the resume in
   cvpilot's db.json, trimmed to what reads well in a 420px window.

   No interface in types/content.ts for this one: nothing else has to match
   its shape, so the inferred shape of the literal is the type. */
export const about = {
  name: 'SWAPNIL MITRA',
  tagline: 'Software Engineer // .NET, Azure, and AI-enabled systems',
  /* Printed one per line by `skills` in the terminal, so each entry is a
     whole line rather than a single skill. */
  skills: [
    'Languages:  JavaScript, TypeScript, C#, Python, SQL, Rust',
    'Frameworks: .NET Core, ASP.NET, React, Next.js, Fluent UI, LangChain',
    'Cloud:      Azure Functions, API Management, Logic Apps, DevOps, AWS',
    'Middleware: RabbitMQ, Docker, Microsoft Graph, SharePoint',
    'Data:       PostgreSQL, pgvector, SQL Server, Prisma, Drizzle',
    'Ops:        Prometheus, Grafana, Git, Azure DevOps',
  ],
  paragraphs: [
    'Software Engineer with 3+ years across system architecture, enterprise middleware integration, and AI-enabled tooling. Mostly .NET Core, Azure, RabbitMQ, and React, on distributed systems that have to stay up.',
    'Currently Research and Innovation Engineer at Adrosonic, leading a team of four as Technical Lead on an enterprise broker management platform: SSO, then quote-bind, cancellation, and amendment flows, plus the Azure middleware layer carrying them out to downstream aggregators. Before that, a legacy COM Outlook add-in rebuilt as a React add-in for 10,000+ users.',
    'Outside work: a local-first memory engine for AI agents written in Rust, a multi-tenant outreach workspace on Postgres and pgvector, a records governance platform pinning documents to IPFS, and a voice-first agricultural marketplace in eleven languages. B.Tech from IIT Kharagpur.',
    'This desktop is real, by the way. Drag the windows, resize them from the corner, stack them. Or open TERMINAL.EXE and type help.',
  ],
}
