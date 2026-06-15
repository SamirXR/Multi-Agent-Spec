# Architecture

## System Overview

The AI Software Factory is a research platform consisting of four layers:

1. **Contract Layer** — OpenAPI 3.0 specifications as the single source of truth
2. **Service Layer** — 4 independent Express microservices
3. **Agent Layer** — 5 deterministic AI agent simulators
4. **Presentation Layer** — React dashboard for visualization

---

## Component Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    Presentation Layer                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              React + Vite + TypeScript                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │  │
│  │  │Experiment│ │ Research │ │  Agent   │ │  Contract    │ │  │
│  │  │Dashboard │ │Dashboard │ │ Monitor  │ │  Viewer      │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │  │
│  └──────────────────────┬─────────────────────────────────────┘  │
│                         │ reads experiment-results.json           │
├─────────────────────────┼────────────────────────────────────────┤
│                    Agent Layer                                    │
│  ┌──────────────────────▼─────────────────────────────────────┐  │
│  │            Orchestration Engine (engine.ts)                 │  │
│  │                                                             │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │  │
│  │  │  FE  │ │  BE  │ │ Test │ │ Docs │ │  API │  Agents    │  │
│  │  │Agent │ │Agent │ │Agent │ │Agent │ │Agent │            │  │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘            │  │
│  │     │        │        │        │        │                  │  │
│  │     └────────┴────────┴────────┴────────┘                  │  │
│  │                       │                                     │  │
│  │              ┌────────▼────────┐                            │  │
│  │              │   Validator     │ ◄── Validates against      │  │
│  │              │  (validator.ts) │     OpenAPI contracts       │  │
│  │              └────────┬────────┘                            │  │
│  │                       │                                     │  │
│  │              ┌────────▼────────┐                            │  │
│  │              │   Scenarios     │ 6 intentional failures     │  │
│  │              └─────────────────┘                            │  │
│  └─────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│                    Contract Layer                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   /contracts/                               │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │  │
│  │  │user-service │ │task-service │ │notification │          │  │
│  │  │   .yaml     │ │   .yaml     │ │  -service   │          │  │
│  │  └─────────────┘ └─────────────┘ │   .yaml     │          │  │
│  │                                   └─────────────┘          │  │
│  │  ┌──────────────┐                                          │  │
│  │  │analytics    │   All validated by Specmatic              │  │
│  │  │-service.yaml│                                           │  │
│  │  └──────────────┘                                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│                    Service Layer                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │   User     │ │   Task     │ │Notification│ │ Analytics  │   │
│  │  Service   │ │  Service   │ │  Service   │ │  Service   │   │
│  │  :3001     │ │  :3002     │ │  :3003     │ │  :3004     │   │
│  │            │ │            │ │            │ │            │   │
│  │ Express+TS │ │ Express+TS │ │ Express+TS │ │ Express+TS │   │
│  │ In-memory  │ │ In-memory  │ │ In-memory  │ │ HTTP agg.  │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Contract Validation Pipeline

```
1. Agent generates artifact (payload/schema/code)
        │
        ▼
2. Validator loads contract schema from /contracts/
        │
        ▼
3. Structural validation:
   ├── Check required fields present
   ├── Check no unexpected fields
   ├── Check data types match
   └── Check field names match
        │
        ▼
4. Result: Compliant ✓ or Violation ✗
        │
        ▼
5. Aggregated into ExperimentResult JSON
        │
        ▼
6. Dashboard reads and visualizes results
```

### Experiment Flow

```
1. Engine starts
        │
        ├── Run agents in COMPLIANT mode → baseline artifacts
        │
        ├── Run agents in DRIFT mode → drifted artifacts
        │
        ├── Validate drifted artifacts → detect violations
        │
        ├── Calculate metrics (before/after comparison)
        │
        └── Write results to dashboard/public/experiment-results.json
```

---

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| **LLM-based agents** (Nvidia NIM) | Real AI-generated artifacts with genuine hallucination behavior |
| **In-memory arrays** (not databases) | Zero-config, fully self-contained, no external dependencies |
| **npm workspaces** | Single `npm install` for all packages, simplified development |
| **Recharts** (not D3) | React-native charting, simpler API for dashboard visualizations |
| **Static JSON results** | Dashboard works standalone without running services |
| **TypeScript everywhere** | Type safety across frontend, backend, and agent code |

---

## Service APIs

### User Service (Port 3001)

| Method | Path | Description |
|--------|------|-------------|
| POST | /users | Create a new user |
| GET | /users | List all users (optional ?role= filter) |
| GET | /users/:id | Get user by ID |

### Task Service (Port 3002)

| Method | Path | Description |
|--------|------|-------------|
| POST | /tasks | Create a new task |
| GET | /tasks | List all tasks (optional ?status= and ?assigneeId= filters) |

### Notification Service (Port 3003)

| Method | Path | Description |
|--------|------|-------------|
| POST | /notifications | Create a notification |
| GET | /notifications | List notifications (optional ?userId= and ?read= filters) |

### Analytics Service (Port 3004)

| Method | Path | Description |
|--------|------|-------------|
| GET | /analytics | Get aggregated analytics from all services |

---

## Agent Architecture

Each agent is a TypeScript module that exports a `generate*Artifacts(drift: boolean)` function:

- `drift = false` → Produces outputs that conform to the contracts
- `drift = true` → Instructs the LLM to introduce intentional violations simulating AI hallucination

Agents use LLM calls via Nvidia NIM (Meta Llama models). The orchestration engine runs them in both modes, validates outputs with a structural validator, and runs real Specmatic contract tests against the live services.

---

## CI/CD Pipeline

```
Commit → GitHub Actions
           │
           ├── validate-contracts (lint OpenAPI specs)
           │
           ├── contract-tests
           │     ├── Start all 4 services
           │     ├── Run Specmatic tests against each
           │     ├── Run agent experiment
           │     └── Upload results
           │
           └── report (generate summary)
```

The pipeline **fails the build** on any contract violation, ensuring no non-compliant code reaches the main branch.
