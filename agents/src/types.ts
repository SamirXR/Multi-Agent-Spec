/**
 * Shared type definitions for the AI Agent simulation framework.
 * 
 * Each agent produces "artifacts" — code snippets, payloads, schemas —
 * that may or may not conform to the OpenAPI contracts.
 */

export type AgentId = 'frontend' | 'backend' | 'testing' | 'documentation' | 'api-design';

export type ViolationType =
  | 'field_name_mismatch'
  | 'datatype_violation'
  | 'missing_required_field'
  | 'unexpected_field'
  | 'wrong_status_code'
  | 'schema_mismatch';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface AgentArtifact {
  agentId: AgentId;
  service: string;
  endpoint: string;
  method: string;
  generatedPayload: Record<string, any>;
  expectedPayload: Record<string, any>;
  isCompliant: boolean;
  violations: Violation[];
  timestamp: string;
}

export interface Violation {
  id: string;
  type: ViolationType;
  severity: Severity;
  field: string;
  expected: string;
  actual: string;
  message: string;
  agentId: AgentId;
  service: string;
  endpoint: string;
  detectedBy: 'specmatic' | 'manual';
  preventedDeployment: boolean;
}

export interface ScenarioResult {
  scenarioName: string;
  description: string;
  agentA: AgentId;
  agentB: AgentId;
  service: string;
  endpoint: string;
  violation: Violation;
  withoutContract: { detected: boolean; stage: string };
  withContract: { detected: boolean; stage: string };
}

export interface ExperimentResult {
  id: string;
  timestamp: string;
  duration: number;
  agents: AgentId[];
  totalAPIs: number;
  successfulIntegrations: number;
  failedIntegrations: number;
  violationsDetected: number;
  violationsPreventedBeforeDeployment: number;
  scenarios: ScenarioResult[];
  artifacts: AgentArtifact[];
  metrics: ResearchMetrics;
  specmaticResults?: SpecmaticTestResult[];
}

export interface SpecmaticTestResult {
  service: string;
  contractFile: string;
  baseUrl: string;
  totalTests: number;
  passed: number;
  failed: number;
  success: boolean;
  output: string;
  errorOutput?: string;
}

export interface ResearchMetrics {
  errorsWithoutContracts: number;
  errorsWithContracts: number;
  failuresCaughtEarly: number;
  estimatedDebuggingTimeSavedHours: number;
  contractComplianceRate: number;
  reductionPercentage: number;
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  description: string;
  driftProbability: number; // 0-1, chance of producing non-compliant output
}
