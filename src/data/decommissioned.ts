/* The recycle bin's contents: repos that shipped, taught something, and are
   not being maintained any more. Same `Project` shape as projects.ts, because
   the bin window renders them with the same row layout — the only difference
   is which list it is handed. */

import type { Project } from '../types/content'

export const decommissioned: Project[] = [
  {
    id: 'dream-app',
    title: 'DREAM_APP',
    description:
      'Text-to-image toy: a prompt goes to an Express endpoint, out to the OpenAI image API, and back as a URL. Built when image generation was still novel enough to be its own app, which is exactly why it stopped being one.',
    stack: 'Vite, Express, OpenAI API',
    link: 'https://github.com/swap-mitra/dream-app',
  },
  {
    id: 'groupify',
    title: 'GROUPIFY',
    description:
      'Cross-platform group video and messaging on Agora RTC/RTM, sharing one React codebase across web, React Native, and an Electron desktop build with Sentry wired through all three. The ambition outlived the maintenance budget.',
    stack: 'React Native, react-native-web, Electron, Agora, Apollo GraphQL',
    link: 'https://github.com/swap-mitra/groupify',
  },
  {
    id: 'realtor',
    title: 'REALTOR',
    description:
      'Real estate listings browser against a third-party property API: server-rendered pages, filter and search, and a Chakra UI front end. A Next.js learning build from the pages-router era.',
    stack: 'Next.js, Chakra UI, RapidAPI',
    link: 'https://github.com/swap-mitra/realtor',
  },
  {
    id: 'unitchat',
    title: 'UNITCHAT',
    description:
      'Realtime chat with social auth: Firebase for identity, Chat Engine for the rooms and sockets. Mostly an exercise in how far you get by wiring two hosted services together, and how much of the app dies when one of them does.',
    stack: 'React, Firebase Auth, Chat Engine',
    link: 'https://github.com/swap-mitra/unitchat',
  },
  {
    id: 'crown-clothing',
    title: 'CROWN_CLOTHING',
    description:
      'An e-commerce storefront: collections, cart, and checkout, built to learn routing, component state, and Sass structure at a size where those decisions actually start to hurt.',
    stack: 'React, React Router, Sass',
    link: 'https://github.com/swap-mitra/crown-clothing',
  },
  {
    id: 'rolodex',
    title: 'ROLODEX',
    description:
      'The monsters rolodex: fetch a list of users, filter it as you type, render the cards. The first React app, deployed to GitHub Pages, kept for the archaeology.',
    stack: 'React, Create React App, gh-pages',
    link: 'https://github.com/swap-mitra/rolodex',
  },
  {
    id: 'food-ar',
    title: 'FOOD_AR',
    description:
      'Augmented reality food menu: point a phone at the printed menu and Vuforia tracks the card while Unity renders each dish as a 3D model in place. A college build, tied to an SDK and a Unity version that have both moved on.',
    stack: 'Unity, Vuforia SDK, C#',
    link: 'https://github.com/swap-mitra/Food-AR',
  },
]
