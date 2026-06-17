# Multi-Agent-Spec

**Executable API Contracts for AI-Assisted Development** — A research platform demonstrating how [Specmatic](https://specmatic.io) contract testing prevents integration failures in multi-agent AI software factories.

🚀 **Quick Start & API Key Configuration**

The AI agent simulation requires an **NVIDIA NIM API Key** to run experiments using the Llama-4 model. Follow these quick steps to set it up:

1. **Clone and Install**:
   ```bash
   git clone https://github.com/SamirXR/Multi-Agent-Spec.git
   cd Multi-Agent-Spec
   npm install
   ```
2. **Add API Key**:
   Create the `.env` file in the `agents` directory and add your key:
   ```bash
   # Create file
   cp agents/.env.example agents/.env
   
   # Open agents/.env and set the key:
   NVIDIA_API_KEY="your-nvapi-key-here"
   NVIDIA_MODEL="meta/llama-4-maverick-17b-128e-instruct"
   ```
3. **Run Services & Experiment**:
   ```bash
   # Start all microservices
   npm run start:services
   
   # Run the Multi-Agent software factory experiment
   npm run experiment
   
   # Start the research dashboard
   npm run start:dashboard
   ```

---

## Overview

When multiple AI agents independently generate code for different parts of a system (frontend, backend, testing, docs), they frequently make **different assumptions about API structures** — leading to integration failures that are expensive to debug.

This project demonstrates how **executable API contracts** (OpenAPI specs validated by Specmatic) catch structural API violations **and** resiliency failures (wrong types, null values, missing fields) before deployment.

### What This Project Does

1. **4 Microservices** — Express/TypeScript services implementing User, Task, Notification, and Analytics APIs
2. **4 OpenAPI Contracts** — The single source of truth for all API structures
3. **5 AI Agents** — LLM-powered agents (via Nvidia NIM) that generate API artifacts in both compliant and "drift" (hallucination) modes
4. **Specmatic Contract Tests** — Real contract test execution including **resiliency tests** that send invalid inputs (null values, wrong types, missing fields) and verify the service returns proper 4xx errors
5. **Research Dashboard** — React visualization of experiment results

---

## Prerequisites

| Requirement | Version | How to Install |
|---|---|---|
| [Node.js](https://nodejs.org) | 20+ | Download from nodejs.org |
| [Java](https://adoptium.net/) | 17+ | Required by Specmatic CLI for running contract tests |
| [Nvidia NIM API Key](https://build.nvidia.com/) | — | Optional: for LLM agent experiments |

> **Important**: Java is **required** for running Specmatic contract tests. Without Java, the `npm run contract:test:*` commands will not work. Install Java 17+ from [Adoptium](https://adoptium.net/) and verify with `java -version`.

---

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/SamirXR/Multi-Agent-Spec.git
cd Multi-Agent-Spec
npm install
```

### 2. Configure Nvidia NIM API Key (Optional — for LLM experiments)

The AI agent simulation requires an Nvidia NIM API key. Without it, agents run in fallback mode (empty payloads).

1. Sign up at [NVIDIA Build](https://build.nvidia.com/) and generate an API key
2. Create the environment file:
   ```bash
   cp agents/.env.example agents/.env
   ```
3. Edit `agents/.env` with your key:
   ```env
   NVIDIA_API_KEY="nvapi-your-actual-nvidia-api-key"
   NVIDIA_MODEL="meta/llama-3.1-70b-instruct"
   ```

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

Verify services are healthy before running tests:
```bash
curl http://localhost:3002/health
# Expected: {"status":"ok","service":"task-service","timestamp":"..."}
```

### 4. Run Specmatic Contract Tests

With services running, test each service against its OpenAPI contract:

```bash
# Test individual services
npm run contract:test:tasks
npm run contract:test:users
npm run contract:test:notifications
npm run contract:test:analytics

# Test all services (sequentially to avoid port conflicts)
npm run contract:test:all
```

Specmatic automatically generates tests from the OpenAPI specs, including:
- **Positive tests** — Verifies the service accepts valid requests and returns correct responses
- **Resiliency tests** — Sends invalid inputs (null values, wrong types, missing required fields, unexpected fields, invalid enum values) and verifies the service returns proper 4xx error responses

> **Note**: Resiliency tests require a Specmatic Enterprise license. Without a license, only positive tests and basic negative tests run. Place your license file at `./license.txt` to enable full resiliency testing.

### 4b. Validate External Examples

Specmatic external examples are standalone JSON files that define test scenarios independently from the OpenAPI spec. They live in `<service>_examples/` directories alongside each contract.

```bash
# Validate all external examples against their specs
npm run examples:validate:all

# Or validate individually:
npm run examples:validate:users
npm run examples:validate:tasks
npm run examples:validate:notifications
npm run examples:validate:analytics
```

### 5. Run the Experiment

```bash
npm run experiment
```

This runs the full 5-phase experiment:
1. **Phase 1** — Run AI agents in compliant mode (baseline)
2. **Phase 2** — Run AI agents in drift mode (simulating hallucinations)
3. **Phase 3** — Validate drifted artifacts with structural validator
4. **Phase 4** — Run **real** Specmatic contract tests against live services
5. **Phase 5** — Calculate research metrics from both sources

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
│   ├── user-service_examples/    # External examples for user-service
│   ├── task-service.yaml
│   ├── task-service_examples/    # External examples for task-service
│   ├── notification-service.yaml
│   ├── notification-service_examples/  # External examples for notification-service
│   ├── analytics-service.yaml
│   └── analytics-service_examples/     # External examples for analytics-service
├── services/                     # Express microservices
│   ├── user-service/
│   ├── task-service/
│   ├── notification-service/
│   └── analytics-service/
├── agents/                       # AI agent simulation framework
│   └── src/
│       ├── engine.ts             # Experiment orchestration (uses real Specmatic CLI)
│       ├── validator.ts          # Structural contract validator
│       ├── llm.ts                # Nvidia NIM LLM client
│       ├── agents/               # 5 AI agent modules
│       └── scenarios/            # Illustrative failure scenarios
├── dashboard/                    # React + Vite research dashboard
├── docs/
│   ├── ARCHITECTURE.md           # System architecture
│   └── RESEARCH_REPORT.md        # Research findings
├── specmatic-config-example.yaml # Specmatic v3 configuration (reference, not auto-loaded)
├── license.txt                   # Specmatic Enterprise license (required for resiliency tests)
└── package.json                  # npm workspaces root
```

---

## Specmatic Configuration

The `specmatic-config-example.yaml` file demonstrates the [Specmatic v3 config format](https://docs.specmatic.io/references/configuration/getting-started) for auto-discovery mode. However, this project uses **v2-style CLI invocations** (`specmatic test --spec-file ... --testBaseURL ...`) in CI and npm scripts, which are more explicit and avoid port conflicts with the v3 config's automatic SUT/dependency management.

Key structure of the v3 config:

- **`systemUnderTest`** — Defines which service is being tested and how to run tests against it
- **`dependencies`** — Lists services that the SUT depends on (run as mocks)
- **`components.sources`** — Where OpenAPI contracts are loaded from (`contracts/` directory)
- **`components.services`** — Named service definitions mapping to contract files
- **`components.runOptions`** — How each service should be run (test mode or mock mode)
- **`specmatic.governance`** — Coverage thresholds and enforcement rules

### Switching the System Under Test

To test a different service, change the `$ref` pointers in `systemUnderTest`:

```yaml
# To test user-service instead of task-service:
systemUnderTest:
  service:
    $ref: "#/components/services/userService"
    runOptions:
      $ref: "#/components/runOptions/userServiceTest"
```

---

## External Examples

Specmatic supports **external examples** — standalone JSON files that define explicit test scenarios outside the OpenAPI spec. For each contract `foo-service.yaml`, Specmatic automatically discovers a `foo-service_examples/` directory in the same folder.

Each JSON file contains an `http-request` / `http-response` pair:

```json
// contracts/task-service_examples/create_task_success.json
{
  "http-request": {
    "method": "POST",
    "path": "/tasks",
    "headers": { "Content-Type": "application/json" },
    "body": {
      "title": "Implement login API",
      "description": "Build the authentication endpoint with JWT",
      "assigneeId": 1,
      "priority": "high"
    }
  },
  "http-response": {
    "status": 201,
    "body": {
      "id": "(number)",
      "title": "Implement login API",
      "status": "pending",
      "createdAt": "(string)"
    }
  }
}
```

Validate all external examples against their specs:

```bash
npm run examples:validate:all

# Or validate individually:
npm run examples:validate:users
npm run examples:validate:tasks
npm run examples:validate:notifications
npm run examples:validate:analytics
```

> **Why external examples?** Inline examples in the spec are great for documentation, but external examples let you maintain test scenarios independently — including negative test cases (missing fields, invalid values) — and validate them on every CI run.

---

## How Specmatic Resiliency Tests Work

Specmatic doesn't just test happy paths — it also sends **deliberately invalid inputs** to verify your service handles them correctly. For each endpoint, Specmatic generates tests like:

| Test Type | Example | Expected Result |
|-----------|---------|----------------|
| Missing required field | POST /tasks with no `title` | 400 Bad Request |
| Null value | POST /tasks with `title: null` | 400 Bad Request |
| Wrong type (string→number) | POST /tasks with `title: 123` | 400 Bad Request |
| Wrong type (string→boolean) | POST /tasks with `title: true` | 400 Bad Request |
| Unexpected field | POST /tasks with extra `foo: "bar"` | 400 Bad Request |
| Invalid enum value | POST /tasks with `priority: "urgent"` | 400 Bad Request |
| Invalid query param | GET /tasks?status=unknown | 400 Bad Request |

This is why the Specmatic team ran **76 tests** on just the `/tasks` endpoint — each field combination and type mutation generates a separate test case.

---

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/contract-validation.yml`) that runs on every push and pull request:

| Stage | What It Does |
|-------|-------------|
| **Validate Specs & Examples** | Lints OpenAPI contracts with Redocly, validates external examples with `specmatic examples validate` |
| **Contract & Resiliency Tests** | Starts all 4 microservices, runs `specmatic test` against each (including resiliency tests) |
| **Build Dashboard** | Compiles the React research dashboard |
| **Report** | Generates a summary in the GitHub Actions UI |

### Setting Up the Specmatic License for CI

The Specmatic Enterprise license is gitignored and not committed to the repository. To enable resiliency tests in CI:

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Add a **Repository Secret** named `SPECMATIC_LICENSE`
3. Paste the full contents of your `license.txt` file as the value

The CI workflow writes this secret to `license.txt` before running contract tests.

> Without the license secret, CI will still run positive contract tests but will skip resiliency tests.

---

## Key Findings

- **Structural validation catches field-level violations** but misses HTTP behavior issues (wrong status codes, missing error handling)
- **Resiliency testing reveals real application failures** — our services initially failed 45 of 76 tests on the tasks endpoint alone
- **Each resiliency failure represents a production risk** — wrong type handling, null safety, and input validation gaps
- **After fixing resiliency failures**, services correctly reject invalid inputs with proper 400 responses and Error schema
- **Specmatic resiliency tests are essential**, not optional — they surface bugs that structural validators miss

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design and technology decisions
- [Research Report](docs/RESEARCH_REPORT.md) — Full research findings and methodology
- [Specmatic Documentation](https://docs.specmatic.io) — Official Specmatic docs
- [Specmatic v3 Config](https://docs.specmatic.io/references/configuration/getting-started) — Configuration reference

---

## License

MIT
