# Demo Guide

Step-by-step guide to running and demonstrating the AI Software Factory experiment.

---

## Prerequisites

- **Node.js** 20 or later
- **Java** 17+ (required for Specmatic contract testing)
- **npm** (comes with Node.js)

---

## Step 1: Install Dependencies

```bash
cd Specmatic
npm install
```

This installs all workspaces (services, agents, dashboard) in one command.

---

## Step 2: Run the Experiment

```bash
npm run experiment -w agents
```

This runs the orchestration engine which:
1. Generates compliant artifacts from all 5 agents
2. Generates drifted artifacts (simulating AI hallucinations)
3. Validates drifted artifacts against OpenAPI contracts
4. Outputs results to `dashboard/public/experiment-results.json`

You'll see a summary table in the terminal:

```
╔══════════════════════════════════════════════════════════╗
║                    EXPERIMENT RESULTS                    ║
╠══════════════════════════════════════════════════════════╣
║  Total APIs Generated:                               38 ║
║  Successful Integrations:                            24 ║
║  Failed Integrations:                                14 ║
║  Violations Detected:                                18 ║
║  Violations Prevented:                               18 ║
╚══════════════════════════════════════════════════════════╝
```

---

## Step 3: Start the Dashboard

```bash
npm run start:dashboard
```

Open **http://localhost:5173** in your browser.

### Dashboard Pages

1. **Experiment Dashboard** (`/`) — Overview of all metrics, agent status, violations by type chart, integration success rate pie chart, and violation log

2. **Research Dashboard** (`/research`) — Before/after comparison charts, compliance gauge, and detailed failure scenario breakdowns

3. **Agent Monitor** (`/agents`) — Click any agent to inspect their generated artifacts. Non-compliant artifacts show a diff view comparing "what the agent generated" vs "what the contract requires"

4. **Contract Viewer** (`/contracts`) — Browse the OpenAPI contracts with inline comments showing common AI hallucination points

---

## Step 4: Start the Microservices (Optional)

```bash
npm run start:services
```

This starts all 4 services concurrently:
- User Service on http://localhost:3001
- Task Service on http://localhost:3002
- Notification Service on http://localhost:3003
- Analytics Service on http://localhost:3004

---

## Step 5: Run Specmatic Contract Tests (Optional)

Requires Java 17+.

```bash
# Test individual service
npx specmatic test contracts/user-service.yaml --testBaseURL=http://localhost:3001

# Test all services
npm run contract:test:all
```

---

## Demo Script

### For a 10-minute presentation:

1. **Show the Contracts** (2 min)
   - Open `/contracts` page
   - Point out the field names and types that are source of truth
   - Highlight inline comments showing where AI agents commonly hallucinate

2. **Show the Experiment Results** (3 min)
   - Open `/` (Experiment Dashboard)
   - Walk through the 5 metric cards
   - Show the violations by type chart
   - Scroll through the violation log

3. **Show Before/After Comparison** (3 min)
   - Open `/research` page
   - Show the bar chart comparing errors with/without contracts
   - Walk through 2-3 failure scenarios
   - Highlight the "Without Contracts" vs "With Contracts" columns

4. **Show Agent Diff View** (2 min)
   - Open `/agents` page
   - Click on "Backend Agent"
   - Show the diff view for the user-service POST violation
   - Point out how `username` vs `name` and `mail` vs `email` are caught instantly

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm install` fails | Ensure Node.js 20+ is installed |
| Dashboard shows no data | Run `npm run experiment -w agents` first |
| Specmatic tests fail to start | Ensure Java 17+ is installed |
| Port already in use | Kill existing processes on ports 3001-3004 |
