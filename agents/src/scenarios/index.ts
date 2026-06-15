/**
 * Illustrative Failure Scenarios
 * 
 * Six predefined examples that demonstrate the TYPES of contract
 * violations commonly produced by independent AI agents. These are
 * illustrative — they show what Specmatic would catch, not actual
 * test results. Real Specmatic test results are generated in Phase 4
 * of the experiment engine.
 */

import { ScenarioResult, Violation } from '../types';

function createScenario(
  name: string,
  description: string,
  agentA: 'frontend' | 'backend',
  agentB: 'frontend' | 'backend',
  service: string,
  endpoint: string,
  violation: Violation,
): ScenarioResult {
  return {
    scenarioName: name,
    description,
    agentA,
    agentB,
    service,
    endpoint,
    violation,
    withoutContract: {
      detected: false,
      stage: 'Production — discovered during integration testing or by end users',
    },
    withContract: {
      detected: true,
      stage: 'Development — caught immediately by Specmatic contract validation',
    },
  };
}

/** Scenario 1: Frontend expects "name", Backend returns "username" */
export const fieldNameMismatch: ScenarioResult = createScenario(
  'Field Name Mismatch: name vs username',
  'Frontend Agent expects { "name": "Samir" } but Backend Agent returns { "username": "Samir" }. This is the most common AI hallucination — agents make different assumptions about field naming conventions.',
  'frontend',
  'backend',
  'user-service',
  'POST /users',
  {
    id: 'SCENARIO-001',
    type: 'field_name_mismatch',
    severity: 'critical',
    field: 'name',
    expected: '"name" (string)',
    actual: '"username" (string)',
    message: 'Field name mismatch: Frontend expects "name" but Backend returns "username"',
    agentId: 'backend',
    service: 'user-service',
    endpoint: 'POST /users',
    detectedBy: 'specmatic',
    preventedDeployment: true,
  }
);

/** Scenario 2: Frontend expects "email", Backend returns "mail" */
export const emailFieldMismatch: ScenarioResult = createScenario(
  'Field Name Mismatch: email vs mail',
  'Frontend Agent expects { "email": "test@gmail.com" } but Backend Agent returns { "mail": "test@gmail.com" }. Different abbreviation choices by independent agents.',
  'frontend',
  'backend',
  'user-service',
  'POST /users',
  {
    id: 'SCENARIO-002',
    type: 'field_name_mismatch',
    severity: 'critical',
    field: 'email',
    expected: '"email" (string, format: email)',
    actual: '"mail" (string)',
    message: 'Field name mismatch: Frontend expects "email" but Backend returns "mail"',
    agentId: 'backend',
    service: 'user-service',
    endpoint: 'POST /users',
    detectedBy: 'specmatic',
    preventedDeployment: true,
  }
);

/** Scenario 3: Contract requires phone as string, Backend returns number */
export const datatypeViolation: ScenarioResult = createScenario(
  'Datatype Violation: phone string vs number',
  'Contract requires { "phone": "9876543210" } (string) but Backend returns { "phone": 9876543210 } (number). Subtle type mismatch that can cause silent failures in production.',
  'frontend',
  'backend',
  'user-service',
  'POST /users',
  {
    id: 'SCENARIO-003',
    type: 'datatype_violation',
    severity: 'high',
    field: 'phone',
    expected: 'string ("9876543210")',
    actual: 'number (9876543210)',
    message: 'Datatype violation: Contract requires phone as string but Backend returns number',
    agentId: 'backend',
    service: 'user-service',
    endpoint: 'POST /users',
    detectedBy: 'specmatic',
    preventedDeployment: true,
  }
);

/** Scenario 4: Required field missing from response */
export const missingRequiredField: ScenarioResult = createScenario(
  'Missing Required Field: phone omitted',
  'Backend Agent omits the required "phone" field from the user response. The contract declares phone as required, but the agent "forgot" to include it.',
  'frontend',
  'backend',
  'user-service',
  'GET /users/{id}',
  {
    id: 'SCENARIO-004',
    type: 'missing_required_field',
    severity: 'critical',
    field: 'phone',
    expected: '"phone" (string, required)',
    actual: 'field missing from response',
    message: 'Missing required field: Backend omitted "phone" from response',
    agentId: 'backend',
    service: 'user-service',
    endpoint: 'GET /users/{id}',
    detectedBy: 'specmatic',
    preventedDeployment: true,
  }
);

/** Scenario 5: Unexpected field added to response */
export const unexpectedField: ScenarioResult = createScenario(
  'Unexpected Field: avatar added',
  'Backend Agent adds an "avatar" field to the user response that is not declared in the contract. While not always breaking, it indicates schema drift.',
  'frontend',
  'backend',
  'user-service',
  'POST /users',
  {
    id: 'SCENARIO-005',
    type: 'unexpected_field',
    severity: 'medium',
    field: 'avatar',
    expected: 'field should not exist in response',
    actual: '"avatar": "https://example.com/avatar.png"',
    message: 'Unexpected field: Backend added undeclared "avatar" field',
    agentId: 'backend',
    service: 'user-service',
    endpoint: 'POST /users',
    detectedBy: 'specmatic',
    preventedDeployment: true,
  }
);

/** Scenario 6: Wrong HTTP status code */
export const wrongStatusCode: ScenarioResult = createScenario(
  'Wrong HTTP Status Code: 200 instead of 201',
  'Contract specifies 201 Created for POST /users, but Backend Agent returns 200 OK. Status code mismatches can break client-side logic that depends on specific codes.',
  'frontend',
  'backend',
  'user-service',
  'POST /users',
  {
    id: 'SCENARIO-006',
    type: 'wrong_status_code',
    severity: 'high',
    field: 'HTTP Status',
    expected: '201 Created',
    actual: '200 OK',
    message: 'Wrong status code: Contract requires 201 but Backend returns 200',
    agentId: 'backend',
    service: 'user-service',
    endpoint: 'POST /users',
    detectedBy: 'specmatic',
    preventedDeployment: true,
  }
);

export const allScenarios: ScenarioResult[] = [
  fieldNameMismatch,
  emailFieldMismatch,
  datatypeViolation,
  missingRequiredField,
  unexpectedField,
  wrongStatusCode,
];
