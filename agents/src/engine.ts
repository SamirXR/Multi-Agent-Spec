/**
 * Experiment Orchestration Engine
 * 
 * Runs a multi-phase experiment:
 *   Phase 1: Run AI agents in compliant mode (baseline)
 *   Phase 2: Run AI agents in drift mode (simulating hallucinations)
 *   Phase 3: Validate drifted artifacts with built-in structural validator
 *   Phase 4: Run REAL Specmatic contract tests against running services
 *   Phase 5: Calculate research metrics from both sources
 * 
 * Output is written to ../dashboard/public/experiment-results.json
 */

import { generateFrontendArtifacts } from './agents/frontend-agent';
import { generateBackendArtifacts } from './agents/backend-agent';
import { generateTestingArtifacts } from './agents/testing-agent';
import { generateDocumentationArtifacts } from './agents/documentation-agent';
import { generateAPIDesignArtifacts } from './agents/api-design-agent';
import { validateArtifacts } from './validator';
import { allScenarios } from './scenarios';
import { ExperimentResult, AgentArtifact, ResearchMetrics, SpecmaticTestResult } from './types';
import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawn, ChildProcess } from 'child_process';
import { runResiliencyTest } from 'specmatic-mcp/build/services/contract-testing.js';

const RESULTS_DIR = path.join(__dirname, '..', '..', 'dashboard', 'public');
const PROJECT_ROOT = path.join(__dirname, '..', '..');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Helper to check if a service is healthy
async function isServiceHealthy(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return res.status === 200;
  } catch {
    return false;
  }
}

// Helper to kill a child process and its child processes on Windows or POSIX
function killProcess(child: ChildProcess) {
  if (process.platform === 'win32') {
    if (child.pid) {
      try {
        execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
      } catch (err) {
        // process might have already exited
      }
    }
  } else {
    child.kill('SIGTERM');
  }
}

// Helper to start a microservice programmatically if not already running
async function startService(serviceDir: string, healthUrl: string, serviceName: string): Promise<ChildProcess | null> {
  const healthy = await isServiceHealthy(healthUrl);
  if (healthy) {
    console.log(`    ℹ ${serviceName} is already running.`);
    return null;
  }

  console.log(`    → Starting ${serviceName} in background...`);
  const child = spawn('npm', ['run', 'start', '-w', `services/${serviceDir}`], {
    cwd: PROJECT_ROOT,
    shell: true,
    stdio: 'ignore',
  });

  const maxRetries = 15;
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (await isServiceHealthy(healthUrl)) {
      console.log(`    ✓ ${serviceName} is healthy and ready.`);
      return child;
    }
  }

  console.warn(`    ⚠ ${serviceName} failed to become healthy. Killing process...`);
  killProcess(child);
  return null;
}

/**
 * Run Specmatic contract tests against a running service.
 * Requires: Java 17+, services running, Specmatic installed via npx.
 */
async function runSpecmaticTest(contractFile: string, baseUrl: string, serviceName: string): Promise<SpecmaticTestResult> {
  const contractPath = path.join(PROJECT_ROOT, 'contracts', contractFile);

  console.log(`    → Testing ${serviceName} (${contractFile}) against ${baseUrl} via Specmatic MCP...`);

  try {
    const specContent = fs.readFileSync(contractPath, 'utf8');
    const mcpResult = await runResiliencyTest({
      openApiSpec: specContent,
      apiBaseUrl: baseUrl,
      specFormat: 'yaml',
    });

    const totalTests = mcpResult.summary?.totalTests || 0;
    const passed = mcpResult.summary?.passed || 0;
    const failed = mcpResult.summary?.failed || 0;

    return {
      service: serviceName,
      contractFile,
      baseUrl,
      totalTests,
      passed,
      failed,
      success: mcpResult.success && failed === 0,
      output: mcpResult.output || '',
      errorOutput: mcpResult.errors || undefined,
    };
  } catch (err: any) {
    console.error(`      [MCP Test Error] ${err.message}`);
    return {
      service: serviceName,
      contractFile,
      baseUrl,
      totalTests: 0,
      passed: 0,
      failed: 0,
      success: false,
      output: '',
      errorOutput: err.message,
    };
  }
}

/**
 * Run Specmatic tests against all services.
 * If services are not running or Java is not available, returns empty results with a warning.
 */
async function runAllSpecmaticTests(): Promise<SpecmaticTestResult[]> {
  // Check if Java is available (required for Specmatic)
  try {
    execSync('java -version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch {
    console.warn('  ⚠ Java not found. Specmatic requires Java 17+. Skipping real contract tests.');
    console.warn('    Install Java: https://adoptium.net/');
    return [];
  }

  // Enable Specmatic Generative/Resiliency testing
  process.env.SPECMATIC_GENERATIVE_TESTS = 'true';

  const services = [
    { contract: 'user-service.yaml', baseUrl: 'http://localhost:3001', name: 'user-service', dir: 'user-service' },
    { contract: 'task-service.yaml', baseUrl: 'http://localhost:3002', name: 'task-service', dir: 'task-service' },
    { contract: 'notification-service.yaml', baseUrl: 'http://localhost:3003', name: 'notification-service', dir: 'notification-service' },
    { contract: 'analytics-service.yaml', baseUrl: 'http://localhost:3004', name: 'analytics-service', dir: 'analytics-service' },
  ];

  const results: SpecmaticTestResult[] = [];
  const spawnedProcesses: ChildProcess[] = [];

  // Start all services that aren't running
  console.log('  → Ensuring all microservices are running and healthy...');
  for (const svc of services) {
    try {
      const child = await startService(svc.dir, `${svc.baseUrl}/health`, svc.name);
      if (child) {
        spawnedProcesses.push(child);
      }
    } catch (err: any) {
      console.error(`    ❌ Failed to start service ${svc.name}: ${err.message}`);
    }
  }

  // Run tests
  for (const svc of services) {
    try {
      const result = await runSpecmaticTest(svc.contract, svc.baseUrl, svc.name);
      results.push(result);

      const icon = result.success ? '✓' : '✗';
      console.log(`    ${icon} ${svc.name}: ${result.passed}/${result.totalTests} passed (${result.failed} failed)`);
    } catch (err: any) {
      console.warn(`    ⚠ Could not test ${svc.name}: ${err.message}`);
      results.push({
        service: svc.name,
        contractFile: svc.contract,
        baseUrl: svc.baseUrl,
        totalTests: 0,
        passed: 0,
        failed: 0,
        success: false,
        output: '',
        errorOutput: err.message,
      });
    }
  }

  // Clean up spawned services
  if (spawnedProcesses.length > 0) {
    console.log('  → Stopping services spawned for testing...');
    for (const child of spawnedProcesses) {
      killProcess(child);
    }
  }

  return results;
}

function calculateMetrics(
  compliantArtifacts: AgentArtifact[],
  driftedArtifacts: AgentArtifact[],
  specmaticResults: SpecmaticTestResult[],
): ResearchMetrics {
  // Agent simulation metrics
  const totalDriftedViolations = driftedArtifacts
    .flatMap(a => a.violations)
    .length;

  // Real Specmatic test metrics
  const specmaticFailures = specmaticResults.reduce((sum, r) => sum + r.failed, 0);
  const specmaticTotal = specmaticResults.reduce((sum, r) => sum + r.totalTests, 0);

  // Without contracts: drifted violations + Specmatic failures would reach production
  const errorsWithoutContracts = totalDriftedViolations + specmaticFailures;

  // With contracts: Specmatic catches failures during development
  // Real Specmatic failures represent issues that WERE caught (before deployment)
  const errorsWithContracts = specmaticFailures; // These are issues found (not escaped)
  const failuresCaughtEarly = totalDriftedViolations + specmaticFailures;

  // Estimated time: each integration failure costs ~2 hours of debugging
  const estimatedDebuggingTimeSavedHours = failuresCaughtEarly * 2;

  // Compliance rate from agent artifacts
  const totalArtifacts = compliantArtifacts.length + driftedArtifacts.length;
  const compliant = compliantArtifacts.filter(a => a.isCompliant).length
    + driftedArtifacts.filter(a => a.isCompliant).length;

  // Also factor in Specmatic test pass rate
  const specmaticPassRate = specmaticTotal > 0 ? (specmaticResults.reduce((s, r) => s + r.passed, 0) / specmaticTotal) * 100 : 100;
  const artifactComplianceRate = totalArtifacts > 0 ? (compliant / totalArtifacts) * 100 : 100;

  // Weighted average of both compliance measures
  const contractComplianceRate = specmaticTotal > 0
    ? parseFloat(((artifactComplianceRate + specmaticPassRate) / 2).toFixed(1))
    : parseFloat(artifactComplianceRate.toFixed(1));

  // Reduction = how many errors contracts prevented from reaching production
  const reductionPercentage = errorsWithoutContracts > 0
    ? parseFloat(((failuresCaughtEarly / errorsWithoutContracts) * 100).toFixed(1))
    : 100;

  return {
    errorsWithoutContracts,
    errorsWithContracts,
    failuresCaughtEarly,
    estimatedDebuggingTimeSavedHours,
    contractComplianceRate,
    reductionPercentage,
  };
}

async function runExperiment(): Promise<ExperimentResult> {
  const startTime = Date.now();

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   AI SOFTWARE FACTORY — CONTRACT VALIDATION EXPERIMENT  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Phase 1: Run all agents in COMPLIANT mode
  console.log('▸ Phase 1: Running agents in COMPLIANT mode...');
  const [
    compliantFrontend,
    compliantBackend,
    compliantTesting,
    compliantDocs,
    compliantAPI
  ] = await Promise.all([
    generateFrontendArtifacts(false),
    generateBackendArtifacts(false),
    generateTestingArtifacts(false),
    generateDocumentationArtifacts(false),
    generateAPIDesignArtifacts(false)
  ]);

  const compliantArtifacts = [
    ...compliantFrontend,
    ...compliantBackend,
    ...compliantTesting,
    ...compliantDocs,
    ...compliantAPI,
  ];

  console.log(`  ✓ Generated ${compliantArtifacts.length} compliant artifacts`);

  // Phase 2: Run all agents in DRIFT mode (simulating hallucinations)
  console.log('▸ Phase 2: Running agents in DRIFT mode (simulating hallucinations)...');
  const [
    driftedFrontend,
    driftedBackend,
    driftedTesting,
    driftedDocs,
    driftedAPI
  ] = await Promise.all([
    generateFrontendArtifacts(true),
    generateBackendArtifacts(true),
    generateTestingArtifacts(true),
    generateDocumentationArtifacts(true),
    generateAPIDesignArtifacts(true)
  ]);

  const driftedArtifacts = [
    ...driftedFrontend,
    ...driftedBackend,
    ...driftedTesting,
    ...driftedDocs,
    ...driftedAPI,
  ];

  console.log(`  ✓ Generated ${driftedArtifacts.length} drifted artifacts`);

  // Phase 3: Validate all drifted artifacts against contracts (structural validator)
  console.log('▸ Phase 3: Validating drifted artifacts (structural validator)...');
  const validatedDrifted = validateArtifacts(driftedArtifacts);

  const violationsDetected = validatedDrifted.flatMap(a => a.violations).length;
  console.log(`  ✓ Structural validator detected ${violationsDetected} violations`);

  // Phase 4: Run REAL Specmatic contract tests
  console.log('▸ Phase 4: Running Specmatic contract tests against live services...');
  const specmaticResults = await runAllSpecmaticTests();

  if (specmaticResults.length > 0) {
    const totalSpecTests = specmaticResults.reduce((s, r) => s + r.totalTests, 0);
    const totalSpecPassed = specmaticResults.reduce((s, r) => s + r.passed, 0);
    const totalSpecFailed = specmaticResults.reduce((s, r) => s + r.failed, 0);
    console.log(`  ✓ Specmatic: ${totalSpecPassed}/${totalSpecTests} passed, ${totalSpecFailed} failed`);
  } else {
    console.log('  ⚠ Specmatic tests skipped (Java not available or services not running)');
  }

  // Phase 5: Calculate research metrics
  console.log('▸ Phase 5: Calculating research metrics...');
  const metrics = calculateMetrics(compliantArtifacts, validatedDrifted, specmaticResults);

  const allArtifacts = [...compliantArtifacts, ...validatedDrifted];
  const successfulIntegrations = allArtifacts.filter(a => a.isCompliant).length;
  const failedIntegrations = allArtifacts.filter(a => !a.isCompliant).length;

  const result: ExperimentResult = {
    id: `exp-${Date.now()}`,
    timestamp: new Date().toISOString(),
    duration: Date.now() - startTime,
    agents: ['frontend', 'backend', 'testing', 'documentation', 'api-design'],
    totalAPIs: allArtifacts.length,
    successfulIntegrations,
    failedIntegrations,
    violationsDetected,
    violationsPreventedBeforeDeployment: violationsDetected,
    scenarios: allScenarios,
    artifacts: allArtifacts,
    metrics,
    specmaticResults: specmaticResults.length > 0 ? specmaticResults : undefined,
  };

  // Write results to dashboard public folder
  ensureDir(RESULTS_DIR);
  const outputPath = path.join(RESULTS_DIR, 'experiment-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n  ✓ Results written to ${outputPath}`);

  // Print summary
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    EXPERIMENT RESULTS                    ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Total APIs Generated:           ${String(result.totalAPIs).padStart(20)} ║`);
  console.log(`║  Successful Integrations:        ${String(successfulIntegrations).padStart(20)} ║`);
  console.log(`║  Failed Integrations:            ${String(failedIntegrations).padStart(20)} ║`);
  console.log(`║  Violations (Structural):        ${String(violationsDetected).padStart(20)} ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');

  if (specmaticResults.length > 0) {
    const totalSpec = specmaticResults.reduce((s, r) => s + r.totalTests, 0);
    const failedSpec = specmaticResults.reduce((s, r) => s + r.failed, 0);
    console.log(`║  Specmatic Tests Run:            ${String(totalSpec).padStart(20)} ║`);
    console.log(`║  Specmatic Tests Failed:         ${String(failedSpec).padStart(20)} ║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
  }

  console.log(`║  Errors Without Contracts:       ${String(metrics.errorsWithoutContracts).padStart(20)} ║`);
  console.log(`║  Errors Caught by Contracts:     ${String(metrics.errorsWithContracts).padStart(20)} ║`);
  console.log(`║  Failures Caught Early:          ${String(metrics.failuresCaughtEarly).padStart(20)} ║`);
  console.log(`║  Debugging Time Saved:         ${String(metrics.estimatedDebuggingTimeSavedHours + 'h').padStart(22)} ║`);
  console.log(`║  Contract Compliance Rate:     ${String(metrics.contractComplianceRate + '%').padStart(22)} ║`);
  console.log(`║  Error Reduction:              ${String(metrics.reductionPercentage + '%').padStart(22)} ║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  return result;
}

// Run if executed directly
runExperiment().catch(console.error);
