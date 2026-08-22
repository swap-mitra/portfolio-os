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
]
