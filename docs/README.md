# Multi-Agent AI Software Factory with Specmatic

> **Research Question:** *How can Spec-Driven Development and executable contracts improve AI-assisted software development?*

A full-stack research platform that simulates a software team composed entirely of AI agents. Each agent works independently, and [Specmatic](https://specmatic.io) acts as the contract authority to catch integration failures before deployment.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI Software Factory                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│   │ Frontend │  │ Backend  │  │ Testing  │  │   Docs   │          │
│   │  Agent   │  │  Agent   │  │  Agent   │  │  Agent   │          │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│        │              │              │              │               │
│        └──────────────┴──────────────┴──────────────┘               │
│                              │                                      │
│                    ┌─────────▼──────────┐                           │
│                    │   Specmatic        │                           │
│                    │   Contract Engine  │                           │
│                    └─────────┬──────────┘                           │
│                              │                                      │
│        ┌─────────────────────┼─────────────────────┐               │
│        │                     │                     │               │
│  ┌─────▼─────┐  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐│
│  │   User    │  │    Task    │  │ Notification│  │  Analytics │  ││
│  │  Service  │  │   Service  │  │   Service   │  │   Service  │  ││
│  │  :3001    │  │   :3002    │  │    :3003    │  │    :3004   │  ││
│  └───────────┘  └────────────┘  └─────────────┘  └────────────┘  ││
│                                                                     │
│                    ┌─────────────────────┐                          │
│                    │   React Dashboard   │                          │
│                    │      :5173          │                          │
│                    └─────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Java 17+ (for Specmatic)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd Specmatic
npm install

# Run the experiment (generates results for dashboard)
npm run experiment -w agents

# Start the dashboard
npm run start:dashboard

# Open http://localhost:5173
```

### Run All Services

```bash
# Start all 4 microservices concurrently
npm run start:services

# Run Specmatic contract tests
npm run contract:test:all
```

---

## Project Structure

```
Specmatic/
├── contracts/           → OpenAPI 3.0 specs (source of truth)
├── services/            → 4 Express + SQLite microservices
├── agents/              → Agent simulation framework
├── dashboard/           → React + Vite + TypeScript dashboard
├── .github/workflows/   → CI/CD pipeline
├── docs/                → Documentation
├── specmatic-config-example.yaml → Specmatic v3 config (reference)
└── package.json         → Root workspace config
```

---

## Key Features

**Contract-First Development**
- All 4 services built against OpenAPI 3.0 specifications stored in `/contracts`
- Specmatic validates every API interaction against the contracts

**Agent Simulation**
- 5 deterministic AI agents (Frontend, Backend, Testing, Documentation, API Design)
- Each agent has compliant and "drift" modes simulating AI hallucinations
- 6 intentional failure scenarios demonstrating common integration defects

**Research Dashboard**
- Experiment results with real-time metrics
- Before/after comparison of contract-driven vs. uncontrolled development
- Agent artifact inspector with diff views
- Contract viewer with hallucination annotations

**CI/CD Integration**
- GitHub Actions workflow that validates contracts on every commit
- Build fails on any contract violations
- Generates validation reports as pipeline artifacts

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TypeScript, Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (better-sqlite3) |
| Contracts | OpenAPI 3.0 |
| Contract Engine | Specmatic |
| CI/CD | GitHub Actions |

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture details
- [RESEARCH_REPORT.md](./RESEARCH_REPORT.md) — Full research paper
- [DEMO_GUIDE.md](./DEMO_GUIDE.md) — Step-by-step demo walkthrough

---

## License

MIT
