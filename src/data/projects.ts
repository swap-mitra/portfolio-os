/* The portfolio's project list (architecture.md §4). Sourced from the resume
   in cvpilot's db.json: same four projects, one line each, since the row
   layout is a summary and the repo is where the detail lives.

   Adding a project means adding an object here and nothing else. */

import type { Project } from '../types/content'

export const projects: Project[] = [
  {
    id: 'memvault',
    title: 'MEMVAULT',
    description:
      'Local-first memory engine for AI agents. Every fact and retrieval lands in an append-only hash-chained ledger, so cryptographic erase destroys the content key while the chain still verifies end to end: deletion you can prove rather than trust. Hybrid ANN + BM25 retrieval fused by reciprocal rank, shipped as a CLI, an MCP server, and Python bindings.',
    stack: 'Rust, usearch, BM25, MCP, gRPC, PyO3',
    link: 'https://github.com/swap-mitra/memvault',
  },
  {
    id: 'groundwork',
    title: 'GROUNDWORK',
    description:
      'Multi-tenant outreach workspace that ingests a job URL behind an SSRF guard and drafts evidence-cited email through hybrid retrieval over a halfvec HNSW index. Human-in-the-loop by construction: append-only draft versions, reviewer-attributed approvals, a full audit trail, and Gmail export that only ever writes drafts.',
    stack: 'Next.js, Drizzle, Postgres + pgvector, Inngest, OpenRouter',
    link: 'https://github.com/swap-mitra/groundwork',
  },
  {
    id: 'city-vault',
    title: 'CITY_VAULT',
    description:
      'Multi-tenant records governance platform: six-role RBAC, full document lifecycle, content-addressed storage pinned to IPFS, and append-only audit trails. Sliding-window rate limiting per key, a Vitest suite over the route handlers and governance workflows, and a deliberately brutalist interface.',
    stack: 'Next.js 15, Prisma, Neon Postgres, Pinata (IPFS), Tailwind 4',
    link: 'https://github.com/swap-mitra/city-vault',
  },
  {
    id: 'agrisetu',
    title: 'AGRISETU',
    description:
      'Voice-first agricultural marketplace. PCM audio goes through AWS Transcribe in eleven languages, an LLM on Bedrock, and Polly TTS on the way back out. A RAG pipeline over a Bedrock Knowledge Base grounds the answers, which is what stopped it inventing things when asked in a regional dialect.',
    stack: 'Flutter, Next.js, Express, Turborepo, AWS Bedrock/Transcribe/Polly',
    link: 'https://github.com/hackerslash/agrisetu',
  },
  {
    id: 'live-ddos-map',
    title: 'LIVE_DDOS_MAP',
    description:
      'Real-time DDoS visualisation: high-risk attack signals stream out of a Python backend and land as animated arcs and markers on a 3D WebGL globe, so a feed of IPs and ASNs reads as geography instead of a log tail.',
    stack: 'Python, WebGL, three.js, threat-intel feeds',
    link: 'https://github.com/swap-mitra/live-ddos-map',
  },
  {
    id: 'ragequit-escrow',
    title: 'RAGEQUIT_ESCROW',
    description:
      'A payment safety layer for autonomous agents. The agent prepares and queues a payment; settlement is held behind an onchain veto window the human operator controls, so an agent can act at machine speed without any single decision being irreversible.',
    stack: 'Solidity, JavaScript, EVM, onchain escrow',
    link: 'https://github.com/swap-mitra/ragequit-escrow',
  },
  {
    id: 'bharatiya-watch-party',
    title: 'BHARATIYA_WATCH_PARTY',
    description:
      'Cross-platform desktop watch party for macOS and Windows. A Rust core keeps playback in sync over WebSocket signaling, wrapped in a Tauri shell so the UI ships as React while the timing-critical part stays native.',
    stack: 'Rust, Tauri, WebSocket, React, TypeScript',
    link: 'https://github.com/swap-mitra/bharatiya-watch-party',
  },
  {
    id: 'github-finder',
    title: 'GITHUB_FINDER',
    description:
      'Search GitHub users and read their profile, repos, and stats without leaving one page. A small app against a rate-limited public API, which is where the caching and empty-state handling actually mattered.',
    stack: 'React, GitHub REST API, Context API',
    link: 'https://github.com/swap-mitra/github-finder',
  },
]
