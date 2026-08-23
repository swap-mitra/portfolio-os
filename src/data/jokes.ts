/* Contents of the HAVE_A_LAUGH window.

   Written for this site rather than scraped from anywhere: a joke feed on a
   portfolio is content the visitor will attribute to its owner, so every line
   here is one worth being attributed with. That also means no API to go down,
   no CORS, no key, and nothing to vet at runtime. Adding a joke means adding
   an object here and nothing else.

   Four shapes, because they read differently: a one-liner about the job, a
   one-liner about the stack this site is built out of, a fake stderr dump,
   and a job-ad translation. */

export type Joke =
  | { id: string; kind: 'quip' | 'stack'; text: string }
  /** Rendered preformatted, so it has to look like real output. */
  | { id: string; kind: 'error'; lines: string[] }
  | { id: string; kind: 'translation'; says: string; means: string }

export const jokes: Joke[] = [
  { id: 'standup', kind: 'quip', text: 'The standup is capped at fifteen minutes. It has never been informed of this.' },
  { id: 'estimate', kind: 'quip', text: 'An estimate is a wish with a ticket number attached.' },
  { id: 'review', kind: 'quip', text: 'Two approvals, one of which read it.' },
  { id: 'legacy', kind: 'quip', text: 'The legacy system is the one that works. That is what makes it legacy.' },
  { id: 'debt', kind: 'quip', text: 'We do not have technical debt. We have a rich backlog of decisions made confidently.' },
  { id: 'temporary', kind: 'quip', text: 'Nothing is as permanent as the temporary fix that shipped on a Friday.' },
  { id: 'docs', kind: 'quip', text: 'The documentation is current as of a commit nobody can locate.' },
  { id: 'utils', kind: 'quip', text: 'Every codebase has a file called utils. Nothing has ever been removed from it.' },
  { id: 'repro', kind: 'quip', text: 'Not reproducible: a formal way of saying it happens to someone else.' },
  { id: 'refactor', kind: 'quip', text: 'Refactoring is moving the problem somewhere with better lighting.' },

  { id: 'borrowck', kind: 'stack', text: 'The borrow checker rejected it. The borrow checker was right. That is the part nobody warns you about.' },
  { id: 'router', kind: 'stack', text: 'Next.js shipped a new router. Your tutorial is now a primary historical source.' },
  { id: 'nat', kind: 'stack', text: 'Somewhere in the AWS bill is a NAT gateway from 2023 and a region you have never visited.' },
  { id: 'llm', kind: 'stack', text: 'We added an LLM. It is now wrong faster, and with considerably more confidence.' },
  { id: 'any', kind: 'stack', text: 'any is TypeScript letting you file the bug yourself, at a time of your choosing.' },
  { id: 'index', kind: 'stack', text: 'The read was slow, so we added an index. Now the write is slow too, but fairly.' },
  { id: 'desktop', kind: 'stack', text: 'A desktop app: a browser wearing a title bar and asking to be taken seriously.' },
  { id: 'ipfs', kind: 'stack', text: 'Content-addressed, permanently available, and pinned by exactly one node you pay for.' },
  { id: 'compile', kind: 'stack', text: 'Rust never segfaults, so you get four uninterrupted minutes to enjoy being right.' },
  { id: 'localfirst', kind: 'stack', text: 'Local-first means your data outlives the company. Mostly it outlives the laptop.' },

  {
    id: 'force-push',
    kind: 'error',
    lines: [
      '$ git push --force',
      'warning: this will overwrite 4 commits',
      'warning: two of them are yours',
      'warning: nobody is going to bring up the other two',
      'fatal: pushed anyway',
    ],
  },
  {
    id: 'panic',
    kind: 'error',
    lines: [
      "thread 'main' panicked at src/confidence.rs:1:1:",
      'called `Result::unwrap()` on an `Err` value: "you said this could not fail"',
      'note: run with `RUST_BACKTRACE=1` to relive it',
    ],
  },
  {
    id: 'deploy',
    kind: 'error',
    lines: ['ERROR: deploy failed', '  cause: tests passed locally', '  cause: locally is not a region'],
  },
  {
    id: 'audit',
    kind: 'error',
    lines: [
      '$ npm install',
      'added 1 package, audited 1483 packages',
      '27 vulnerabilities (26 moderate, 1 existential)',
      'run `npm audit fix --force` to generate new ones',
    ],
  },
  {
    id: 'undefined',
    kind: 'error',
    lines: [
      'TypeError: undefined is not a function',
      '    at hope (optimism.js:1:1)',
      '    at planning (sprint.js:9:30)',
      '    at ship (friday.js:17:00)',
    ],
  },
  {
    id: 'docker',
    kind: 'error',
    lines: [
      '$ docker build .',
      'Step 1/47 : FROM node:22',
      'Step 2/47 : RUN npm ci',
      '  ... 6 minutes ...',
      'Step 47/47 : COPY . .',
      'error: you changed one character in README.md',
    ],
  },
  {
    id: 'flaky',
    kind: 'error',
    lines: [
      'WARNING: 1 test failing',
      'WARNING: test has been failing since March',
      'WARNING: test is now load-bearing',
    ],
  },

  { id: 'fastpaced', kind: 'translation', says: 'Fast-paced environment', means: 'Nothing is written down.' },
  { id: 'hats', kind: 'translation', says: 'You will wear many hats', means: 'We have not hired the other roles.' },
  { id: 'rockstar', kind: 'translation', says: 'Rockstar developer', means: 'The work of three people, the salary of one.' },
  { id: 'competitive', kind: 'translation', says: 'Competitive salary', means: 'Competitive with what, we will not be saying.' },
  { id: 'flat', kind: 'translation', says: 'Flat hierarchy', means: 'Nobody knows who approves this.' },
  { id: 'family', kind: 'translation', says: 'We are like a family here', means: 'Boundaries are considered a little rude.' },
  { id: 'greenfield', kind: 'translation', says: 'Greenfield project', means: 'The last team left and took the context with them.' },
  { id: 'ambiguity', kind: 'translation', says: 'Comfortable with ambiguity', means: 'The requirements are a rumour.' },
  { id: 'ownership', kind: 'translation', says: 'Ownership mentality', means: 'It is your fault at 3am.' },
  { id: 'pto', kind: 'translation', says: 'Unlimited PTO', means: 'Nobody has ever taken more than nine days.' },
]
