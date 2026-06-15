/**
 * Shared TypeScript types for the dashboard,
 * mirroring the experiment result structure from the agents framework.
 */

export type AgentId = 'frontend' | 'backend' | 'testing' | 'documentation' | 'api-design';
export type ViolationType = 'field_name_mismatch' | 'datatype_violation' | 'missing_required_field' | 'unexpected_field' | 'wrong_status_code' | 'schema_mismatch';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

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

export interface ResearchMetrics {
  errorsWithoutContracts: number;
  errorsWithContracts: number;
  failuresCaughtEarly: number;
  estimatedDebuggingTimeSavedHours: number;
  contractComplianceRate: number;
  reductionPercentage: number;
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
}

export const AGENT_CONFIG: Record<AgentId, { name: string; role: string }> = {
  'frontend': { name: 'Frontend Agent', role: 'React Components & API Calls' },
  'backend': { name: 'Backend Agent', role: 'Express Routes & Payloads' },
  'testing': { name: 'Testing Agent', role: 'Test Cases & Validation' },
  'documentation': { name: 'Documentation Agent', role: 'API Docs & Examples' },
  'api-design': { name: 'API Design Agent', role: 'OpenAPI Specifications' },
};
