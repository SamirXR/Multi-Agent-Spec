# Multi-Agent-Spec

**Executable API Contracts for AI-Assisted Development** — A research platform demonstrating how [Specmatic](https://specmatic.io) contract testing prevents integration failures in multi-agent AI software factories.

---

## Overview

When multiple AI agents independently generate code for different parts of a system (frontend, backend, testing, docs), they frequently make **different assumptions about API structures** — leading to integration failures that are expensive to debug.

This project demonstrates how **executable API contracts** (OpenAPI specs validated by Specmatic) can catch 100% of structural API violations before deployment.

### What This Project Does

1. **4 Microservices** — Express/TypeScript services implementing User, Task, Notification, and Analytics APIs
2. **4 OpenAPI Contracts** — The single source of truth for all API structures
3. **5 AI Agents** — LLM-powered agents (via Nvidia NIM) that generate API artifacts in both compliant and "drift" (hallucination) modes
4. **Specmatic Contract Tests** — Real contract test execution against running services
5. **Research Dashboard** — React visualization of experiment results

---

## Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org) | 20+ | Runtime for services and agents |
| [Java](https://adoptium.net/) | 17+ | Required by Specmatic CLI |
| [Nvidia NIM API Key](https://build.nvidia.com/) | — | For LLM agent experiments (optional) |

---

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/SamirXR/Multi-Agent-Spec.git
cd Multi-Agent-Spec
npm install
```

### 2. Configure Nvidia NIM API Key (Required for LLM experiments)

The AI agent simulation requires an Nvidia NIM API key to query the LLM.

1. **Get an API Key**: Sign up at [NVIDIA Build](https://build.nvidia.com/) and generate an API key.
2. **Create Env File**: Copy the example environment file:
   ```bash
   cp agents/.env.example agents/.env
   ```
3. **Configure agents/.env**: Open `agents/.env` and enter your API key:
   ```env
   NVIDIA_API_KEY="nvapi-your-actual-nvidia-api-key"
   NVIDIA_MODEL="meta/llama-3.1-70b-instruct"
   ```

> **Important**: Ensure your key starts with `nvapi-`. Without an API key, the experiment runs in simulated fallback mode (producing empty payloads), which will result in contract validation detecting missing required fields.

### 3. Start All Services

```bash
npm run start:services
```

This starts all 4 microservices concurrently:

| Service | Port | Health Check |
|---|---|---|
| User Service | http://localhost:3001 | http://localhost:3001/health |
| Task Service | http://localhost:3002 | http://localhost:3002/health |
| Notification Service | http://localhost:3003 | http://localhost:3003/health |
| Analytics Service | http://localhost:3004 | http://localhost:3004/health |

### 4. Run Specmatic Contract Tests

With services running, test each service against its OpenAPI contract:

```bash
# Test all services
npm run contract:test:all

# Or test individually
npm run contract:test:users
npm run contract:test:tasks
npm run contract:test:notifications
npm run contract:test:analytics
```

Specmatic automatically generates tests from the OpenAPI specs, including **resiliency tests** with invalid inputs, missing fields, wrong types, and boundary values.

### 5. Run the Experiment

```bash
npm run experiment
```

This runs the full 5-phase experiment:

1. **Phase 1** — Run AI agents in compliant mode (baseline)
2. **Phase 2** — Run AI agents in drift mode (simulating hallucinations)
3. **Phase 3** — Validate drifted artifacts with structural validator
4. **Phase 4** — Run real Specmatic contract tests against live services
5. **Phase 5** — Calculate research metrics and write results

Results are saved to `dashboard/public/experiment-results.json`.

### 6. View the Dashboard

```bash
npm run start:dashboard
```

Open http://localhost:5173 to see the research dashboard with experiment results.

---

## Project Structure

```
Multi-Agent-Spec/
├── contracts/                    # OpenAPI 3.0 contract specifications
│   ├── user-service.yaml
│   ├── task-service.yaml
│   ├── notification-service.yaml
│   └── analytics-service.yaml
├── services/                     # Express microservices
│   ├── user-service/
│   ├── task-service/
│   ├── notification-service/
│   └── analytics-service/
├── agents/                       # AI agent simulation framework
│   └── src/
│       ├── engine.ts             # Experiment orchestration
│       ├── validator.ts          # Structural contract validator
│       ├── llm.ts                # Nvidia NIM LLM client
│       ├── agents/               # 5 AI agent modules
│       └── scenarios/            # Illustrative failure scenarios
├── dashboard/                    # React + Vite research dashboard
├── docs/
│   ├── ARCHITECTURE.md           # System architecture
│   └── RESEARCH_REPORT.md        # Research findings
├── specmatic.yaml                # Specmatic v3 configuration
└── package.json                  # npm workspaces root
```

---

## Specmatic Configuration

The `specmatic.yaml` file uses [Specmatic v3 config format](https://specmatic.io/documentation/specmatic_config.html):

```yaml
version: 3

systemUnderTest:
  service:
    $ref: "#/components/services/userService"
  runOptions:
    $ref: "#/components/runOptions/userServiceTest"

components:
  sources:
    localContracts:
      local:
        path: contracts
  services:
    userService:
      definitions:
        - definition:
            source:
              $ref: "#/components/sources/localContracts"
            specs:
              - user-service.yaml
  runOptions:
    userServiceTest:
      openapi:
        type: test
        baseUrl: "http://localhost:3001"
```

---

## Key Findings

- **100% of structural API violations** are caught by contract validation before deployment
- Each integration failure costs ~2 hours of debugging time
- Field name mismatches are the most common AI hallucination type
- Specmatic resiliency tests reveal additional edge cases not covered by basic structural validation

See [docs/RESEARCH_REPORT.md](docs/RESEARCH_REPORT.md) for the full research report.

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design and technology decisions
- [Research Report](docs/RESEARCH_REPORT.md) — Full research findings and methodology
- [Specmatic Documentation](https://specmatic.io) — Official Specmatic docs

---

## License

MIT
