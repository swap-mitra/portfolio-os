/* Work history for the EXPERIENCE.LOG window and the terminal's `experience`
   command (architecture.md §4). Condensed from public/swapnil_mitra_cv.pdf: the PDF
   cannot preview inline on most phones, so without this a visitor on mobile
   sees a download button and no history at all.

   `summary` is the one line the terminal prints per engagement; `bullets`
   are the window's detail. Keep the summary short enough not to wrap in a
   700px terminal.

   No interface in types/content.ts: two consumers, same file, so the
   inferred shape of the literal is the type (same call as data/about.ts). */

export const experience = {
  roles: [
    {
      company: 'ADROSONIC',
      title: 'Research and Innovation Engineer',
      period: 'Jul 2023 - Present',
      location: 'Mumbai',
      engagements: [
        {
          name: 'Insurance Broker Management Platform',
          summary: 'Led a team of 4 on a .NET/Azure platform used daily by brokers in AU and NZ.',
          bullets: [
            'Led a team of four on a broker management platform (.NET, SQL Server, MongoDB on Azure), used daily by insurance brokers across Australia and New Zealand to quote, bind, amend, and cancel policies.',
            'Delivered Microsoft single sign-on and transactional policy updates, so no policy change is ever left half-processed.',
            'Architected the asynchronous integration layer connecting the platform to insurers on Azure API Management, Logic Apps, and Functions, cutting integration time from about six weeks to about two with 99.9% successful delivery.',
            'Added end-to-end tracking and alerting with Application Insights and Azure Monitor, and wrote the handover docs.',
          ],
        },
        {
          name: 'Policy Administration Integration',
          summary: 'One Azure Functions API in front of several policy administration systems.',
          bullets: [
            'Led delivery of a single API on Azure Functions giving external callers one interface to several policy administration systems: routing each request to the right system, merging results, and handling slow writes asynchronously.',
            'Built on stateless per-system adapters behind one shared contract, so new consumers onboard without API changes.',
          ],
        },
        {
          name: 'Release Engineering',
          summary: 'Shared, versioned CI/CD framework on GitHub Actions adopted across repositories.',
          bullets: [
            'Led the team that built a shared, versioned CI/CD framework on GitHub Actions that any repository adopts with minimal config, standardising build, test, and release for .NET, Azure Functions, NuGet, and Logic Apps.',
            'Added release safeguards: pull-request quality gates linked to Azure DevOps work items, approval-gated Staging and Prod releases with fast slot-based rollback, OIDC-based Azure access, and Key Vault-only secrets.',
          ],
        },
        {
          name: 'Email Filing and Document Management',
          summary: 'Rebuilt a SharePoint filing pipeline on RabbitMQ; Outlook add-in for 10,000+ users.',
          bullets: [
            'Rebuilt an email filing and SharePoint document pipeline on .NET and RabbitMQ publish/subscribe messaging with duplicate protection, dead-letter queues, and Prometheus monitoring, cutting message latency by about 40%.',
            'Replaced a legacy Outlook add-in with a React and Fluent UI web add-in with Microsoft sign-in, Graph integration, and offline caching, rolled out to more than 10,000 users.',
          ],
        },
      ],
    },
  ],
  education: {
    school: 'Indian Institute of Technology, Kharagpur',
    degree: 'B.Tech, Biotechnology and Biochemical Engineering',
    period: 'May 2023',
  },
}
