import type { ExperimentResult } from './types';

let cachedResult: ExperimentResult | null = null;

export async function fetchExperimentResults(): Promise<ExperimentResult> {
  if (cachedResult) return cachedResult;

  try {
    const response = await fetch('/experiment-results.json');
    if (!response.ok) throw new Error('No experiment results found');
    cachedResult = await response.json();
    return cachedResult!;
  } catch {
    // Return sample data if no experiment results exist yet
    return getSampleData();
  }
}

export function getSampleData(): ExperimentResult {
  return {
    id: 'exp-sample-001',
    timestamp: new Date().toISOString(),
    duration: 1247,
    agents: ['frontend', 'backend', 'testing', 'documentation', 'api-design'],
    totalAPIs: 38,
    successfulIntegrations: 24,
    failedIntegrations: 14,
    violationsDetected: 18,
    violationsPreventedBeforeDeployment: 18,
    scenarios: [
      {
        scenarioName: 'Field Name Mismatch: name vs username',
        description: 'Frontend Agent expects { "name": "Samir" } but Backend Agent returns { "username": "Samir" }',
        agentA: 'frontend', agentB: 'backend', service: 'user-service', endpoint: 'POST /users',
        violation: { id: 'S-001', type: 'field_name_mismatch', severity: 'critical', field: 'name', expected: '"name" (string)', actual: '"username" (string)', message: 'Field name mismatch: Frontend expects "name" but Backend returns "username"', agentId: 'backend', service: 'user-service', endpoint: 'POST /users', detectedBy: 'specmatic', preventedDeployment: true },
        withoutContract: { detected: false, stage: 'Production — discovered during integration testing or by end users' },
        withContract: { detected: true, stage: 'Development — caught immediately by Specmatic contract validation' },
      },
      {
        scenarioName: 'Field Name Mismatch: email vs mail',
        description: 'Frontend Agent expects { "email": "test@gmail.com" } but Backend Agent returns { "mail": "test@gmail.com" }',
        agentA: 'frontend', agentB: 'backend', service: 'user-service', endpoint: 'POST /users',
        violation: { id: 'S-002', type: 'field_name_mismatch', severity: 'critical', field: 'email', expected: '"email" (string)', actual: '"mail" (string)', message: 'Field name mismatch: Frontend expects "email" but Backend returns "mail"', agentId: 'backend', service: 'user-service', endpoint: 'POST /users', detectedBy: 'specmatic', preventedDeployment: true },
        withoutContract: { detected: false, stage: 'Production — discovered during integration testing or by end users' },
        withContract: { detected: true, stage: 'Development — caught immediately by Specmatic contract validation' },
      },
      {
        scenarioName: 'Datatype Violation: phone string vs number',
        description: 'Contract requires { "phone": "9876543210" } (string) but Backend returns { "phone": 9876543210 } (number)',
        agentA: 'frontend', agentB: 'backend', service: 'user-service', endpoint: 'POST /users',
        violation: { id: 'S-003', type: 'datatype_violation', severity: 'high', field: 'phone', expected: 'string', actual: 'number', message: 'Datatype violation: Contract requires phone as string but Backend returns number', agentId: 'backend', service: 'user-service', endpoint: 'POST /users', detectedBy: 'specmatic', preventedDeployment: true },
        withoutContract: { detected: false, stage: 'Production — silent data type coercion issues' },
        withContract: { detected: true, stage: 'Development — caught immediately by Specmatic contract validation' },
      },
      {
        scenarioName: 'Missing Required Field: phone omitted',
        description: 'Backend Agent omits the required "phone" field from the user response',
        agentA: 'frontend', agentB: 'backend', service: 'user-service', endpoint: 'GET /users/{id}',
        violation: { id: 'S-004', type: 'missing_required_field', severity: 'critical', field: 'phone', expected: '"phone" (required)', actual: 'field missing', message: 'Missing required field: Backend omitted "phone" from response', agentId: 'backend', service: 'user-service', endpoint: 'GET /users/{id}', detectedBy: 'specmatic', preventedDeployment: true },
        withoutContract: { detected: false, stage: 'Production — null pointer errors in frontend' },
        withContract: { detected: true, stage: 'Development — caught immediately by Specmatic contract validation' },
      },
      {
        scenarioName: 'Unexpected Field: avatar added',
        description: 'Backend Agent adds an "avatar" field not declared in the contract',
        agentA: 'frontend', agentB: 'backend', service: 'user-service', endpoint: 'POST /users',
        violation: { id: 'S-005', type: 'unexpected_field', severity: 'medium', field: 'avatar', expected: 'field should not exist', actual: '"avatar": "https://example.com/avatar.png"', message: 'Unexpected field: Backend added undeclared "avatar" field', agentId: 'backend', service: 'user-service', endpoint: 'POST /users', detectedBy: 'specmatic', preventedDeployment: true },
        withoutContract: { detected: false, stage: 'Production — schema drift goes unnoticed' },
        withContract: { detected: true, stage: 'Development — caught immediately by Specmatic contract validation' },
      },
      {
        scenarioName: 'Wrong HTTP Status Code: 200 instead of 201',
        description: 'Contract specifies 201 Created for POST /users, but Backend returns 200 OK',
        agentA: 'frontend', agentB: 'backend', service: 'user-service', endpoint: 'POST /users',
        violation: { id: 'S-006', type: 'wrong_status_code', severity: 'high', field: 'HTTP Status', expected: '201 Created', actual: '200 OK', message: 'Wrong status code: Contract requires 201 but Backend returns 200', agentId: 'backend', service: 'user-service', endpoint: 'POST /users', detectedBy: 'specmatic', preventedDeployment: true },
        withoutContract: { detected: false, stage: 'Production — client logic breaks on wrong status' },
        withContract: { detected: true, stage: 'Development — caught immediately by Specmatic contract validation' },
      },
    ],
    artifacts: [
      { agentId: 'frontend', service: 'user-service', endpoint: 'POST /users', method: 'POST', generatedPayload: { username: 'Samir', email: 'samir@example.com', phone: '9876543210' }, expectedPayload: { name: 'Samir', email: 'samir@example.com', phone: '9876543210' }, isCompliant: false, violations: [{ id: 'FE-001', type: 'field_name_mismatch', severity: 'critical', field: 'name', expected: '"name"', actual: '"username"', message: 'Frontend used "username" instead of "name"', agentId: 'frontend', service: 'user-service', endpoint: 'POST /users', detectedBy: 'specmatic', preventedDeployment: true }], timestamp: new Date().toISOString() },
      { agentId: 'backend', service: 'user-service', endpoint: 'POST /users', method: 'POST', generatedPayload: { id: 1, username: 'Samir', mail: 'samir@example.com', phone: 9876543210, avatar: 'https://example.com/avatar.png' }, expectedPayload: { id: 1, name: 'Samir', email: 'samir@example.com', phone: '9876543210', role: 'developer', createdAt: '2026-06-15T12:00:00Z' }, isCompliant: false, violations: [{ id: 'BE-001', type: 'field_name_mismatch', severity: 'critical', field: 'name', expected: '"name"', actual: '"username"', message: 'Backend returned "username" instead of "name"', agentId: 'backend', service: 'user-service', endpoint: 'POST /users', detectedBy: 'specmatic', preventedDeployment: true }, { id: 'BE-002', type: 'field_name_mismatch', severity: 'critical', field: 'email', expected: '"email"', actual: '"mail"', message: 'Backend returned "mail" instead of "email"', agentId: 'backend', service: 'user-service', endpoint: 'POST /users', detectedBy: 'specmatic', preventedDeployment: true }, { id: 'BE-003', type: 'datatype_violation', severity: 'high', field: 'phone', expected: 'string', actual: 'number', message: 'Backend returned phone as number instead of string', agentId: 'backend', service: 'user-service', endpoint: 'POST /users', detectedBy: 'specmatic', preventedDeployment: true }, { id: 'BE-004', type: 'unexpected_field', severity: 'medium', field: 'avatar', expected: 'not in contract', actual: '"avatar" field present', message: 'Backend added undeclared "avatar" field', agentId: 'backend', service: 'user-service', endpoint: 'POST /users', detectedBy: 'specmatic', preventedDeployment: true }], timestamp: new Date().toISOString() },
      { agentId: 'backend', service: 'user-service', endpoint: 'GET /users/{id}', method: 'GET', generatedPayload: { id: 1, name: 'Samir', email: 'samir@example.com', role: 'developer', createdAt: '2026-06-15T12:00:00Z' }, expectedPayload: { id: 1, name: 'Samir', email: 'samir@example.com', phone: '9876543210', role: 'developer', createdAt: '2026-06-15T12:00:00Z' }, isCompliant: false, violations: [{ id: 'BE-005', type: 'missing_required_field', severity: 'critical', field: 'phone', expected: '"phone" required', actual: 'field missing', message: 'Backend omitted required field "phone"', agentId: 'backend', service: 'user-service', endpoint: 'GET /users/{id}', detectedBy: 'specmatic', preventedDeployment: true }], timestamp: new Date().toISOString() },
      { agentId: 'frontend', service: 'task-service', endpoint: 'POST /tasks', method: 'POST', generatedPayload: { title: 'Build API', desc: 'Implement endpoints', assignee: 1 }, expectedPayload: { title: 'Build API', description: 'Implement endpoints', assigneeId: 1 }, isCompliant: false, violations: [{ id: 'FE-002', type: 'field_name_mismatch', severity: 'critical', field: 'description', expected: '"description"', actual: '"desc"', message: 'Frontend used "desc" instead of "description"', agentId: 'frontend', service: 'task-service', endpoint: 'POST /tasks', detectedBy: 'specmatic', preventedDeployment: true }, { id: 'FE-003', type: 'field_name_mismatch', severity: 'critical', field: 'assigneeId', expected: '"assigneeId"', actual: '"assignee"', message: 'Frontend used "assignee" instead of "assigneeId"', agentId: 'frontend', service: 'task-service', endpoint: 'POST /tasks', detectedBy: 'specmatic', preventedDeployment: true }], timestamp: new Date().toISOString() },
      { agentId: 'backend', service: 'notification-service', endpoint: 'POST /notifications', method: 'POST', generatedPayload: { id: 1, userId: 1, message: 'Task assigned', type: 'info', createdAt: '2026-06-15T12:00:00Z' }, expectedPayload: { id: 1, userId: 1, message: 'Task assigned', type: 'info', read: false, createdAt: '2026-06-15T12:00:00Z' }, isCompliant: false, violations: [{ id: 'BE-006', type: 'missing_required_field', severity: 'critical', field: 'read', expected: '"read" required', actual: 'field missing', message: 'Backend omitted required field "read"', agentId: 'backend', service: 'notification-service', endpoint: 'POST /notifications', detectedBy: 'specmatic', preventedDeployment: true }], timestamp: new Date().toISOString() },
      { agentId: 'backend', service: 'user-service', endpoint: 'POST /users', method: 'POST', generatedPayload: { id: 1, name: 'Samir', email: 'samir@example.com', phone: '9876543210', role: 'developer', createdAt: '2026-06-15T12:00:00Z' }, expectedPayload: { id: 1, name: 'Samir', email: 'samir@example.com', phone: '9876543210', role: 'developer', createdAt: '2026-06-15T12:00:00Z' }, isCompliant: true, violations: [], timestamp: new Date().toISOString() },
      { agentId: 'frontend', service: 'user-service', endpoint: 'POST /users', method: 'POST', generatedPayload: { name: 'Samir', email: 'samir@example.com', phone: '9876543210', role: 'developer' }, expectedPayload: { name: 'Samir', email: 'samir@example.com', phone: '9876543210', role: 'developer' }, isCompliant: true, violations: [], timestamp: new Date().toISOString() },
      { agentId: 'testing', service: 'user-service', endpoint: 'POST /users', method: 'POST', generatedPayload: { testName: 'Should create a user', expectedStatus: 201 }, expectedPayload: { testName: 'Should create a user', expectedStatus: 201 }, isCompliant: true, violations: [], timestamp: new Date().toISOString() },
      { agentId: 'documentation', service: 'user-service', endpoint: 'POST /users', method: 'POST', generatedPayload: { description: 'Create a new user', fields: ['id', 'name', 'email', 'phone', 'role', 'createdAt'] }, expectedPayload: { description: 'Create a new user', fields: ['id', 'name', 'email', 'phone', 'role', 'createdAt'] }, isCompliant: true, violations: [], timestamp: new Date().toISOString() },
      { agentId: 'api-design', service: 'user-service', endpoint: 'user-service spec', method: 'SPEC', generatedPayload: { openapi: '3.0.3' }, expectedPayload: { openapi: '3.0.3' }, isCompliant: true, violations: [], timestamp: new Date().toISOString() },
    ],
    metrics: {
      errorsWithoutContracts: 18,
      errorsWithContracts: 0,
      failuresCaughtEarly: 18,
      estimatedDebuggingTimeSavedHours: 36,
      contractComplianceRate: 63.2,
      reductionPercentage: 100,
    },
  };
}
