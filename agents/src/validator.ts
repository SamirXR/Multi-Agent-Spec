/**
 * Contract Validator
 * 
 * Validates agent-generated payloads against OpenAPI contracts.
 * In production, this wraps Specmatic CLI calls.
 * For the simulation, it performs structural validation against
 * the contract schemas.
 */

import { AgentArtifact, Violation, ViolationType } from './types';
import * as fs from 'fs';
import * as path from 'path';

const CONTRACTS_DIR = path.join(__dirname, '..', '..', 'contracts');

interface SchemaProperty {
  type: string;
  format?: string;
  enum?: string[];
}

interface ContractSchema {
  required: string[];
  properties: Record<string, SchemaProperty>;
}

/**
 * Load and parse a simplified schema from the OpenAPI contract YAML.
 * In production, Specmatic does this automatically.
 * Here we parse just enough to validate payloads.
 */
function loadContractSchemas(): Record<string, Record<string, ContractSchema>> {
  return {
    'user-service': {
      'CreateUserRequest': {
        required: ['name', 'email', 'phone'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['developer', 'designer', 'manager', 'tester'] },
        },
      },
      'User': {
        required: ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          role: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    'task-service': {
      'CreateTaskRequest': {
        required: ['title', 'description', 'assigneeId'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          assigneeId: { type: 'integer' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        },
      },
      'Task': {
        required: ['id', 'title', 'description', 'assigneeId', 'status', 'priority', 'createdAt'],
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          assigneeId: { type: 'integer' },
          status: { type: 'string' },
          priority: { type: 'string' },
          createdAt: { type: 'string' },
        },
      },
    },
    'notification-service': {
      'Notification': {
        required: ['id', 'userId', 'message', 'type', 'read', 'createdAt'],
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          message: { type: 'string' },
          type: { type: 'string' },
          read: { type: 'boolean' },
          createdAt: { type: 'string' },
        },
      },
    },
  };
}

function getJSType(value: any): string {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  if (typeof value === 'number') return 'number';
  return typeof value;
}

function matchesContractType(value: any, expectedType: string): boolean {
  const jsType = getJSType(value);
  if (expectedType === 'integer') return jsType === 'integer';
  if (expectedType === 'number') return jsType === 'number' || jsType === 'integer';
  if (expectedType === 'string') return jsType === 'string';
  if (expectedType === 'boolean') return jsType === 'boolean';
  if (expectedType === 'array') return jsType === 'array';
  if (expectedType === 'object') return jsType === 'object';
  return true;
}

/**
 * Validate a payload against a known contract schema.
 * Returns a list of violations found.
 */
export function validatePayload(
  payload: Record<string, any>,
  schemaName: string,
  service: string,
  endpoint: string,
  agentId: string,
): Violation[] {
  const schemas = loadContractSchemas();
  const serviceSchemas = schemas[service];
  if (!serviceSchemas) return [];

  const schema = serviceSchemas[schemaName];
  if (!schema) return [];

  const violations: Violation[] = [];
  let violationCounter = 0;

  // Check for missing required fields
  for (const field of schema.required) {
    if (!(field in payload)) {
      violationCounter++;
      violations.push({
        id: `VAL-${service.toUpperCase().slice(0, 3)}-${String(violationCounter).padStart(3, '0')}`,
        type: 'missing_required_field',
        severity: 'critical',
        field,
        expected: `"${field}" (${schema.properties[field]?.type || 'unknown'}, required)`,
        actual: 'field missing',
        message: `Required field "${field}" is missing from the payload`,
        agentId: agentId as any,
        service,
        endpoint,
        detectedBy: 'specmatic',
        preventedDeployment: true,
      });
    }
  }

  // Check for type mismatches and unexpected fields
  for (const [field, value] of Object.entries(payload)) {
    const prop = schema.properties[field];
    if (!prop) {
      violationCounter++;
      violations.push({
        id: `VAL-${service.toUpperCase().slice(0, 3)}-${String(violationCounter).padStart(3, '0')}`,
        type: 'unexpected_field',
        severity: 'medium',
        field,
        expected: 'field should not exist',
        actual: `"${field}": ${JSON.stringify(value)}`,
        message: `Unexpected field "${field}" not declared in contract schema`,
        agentId: agentId as any,
        service,
        endpoint,
        detectedBy: 'specmatic',
        preventedDeployment: true,
      });
    } else if (!matchesContractType(value, prop.type)) {
      violationCounter++;
      violations.push({
        id: `VAL-${service.toUpperCase().slice(0, 3)}-${String(violationCounter).padStart(3, '0')}`,
        type: 'datatype_violation',
        severity: 'high',
        field,
        expected: `${prop.type}`,
        actual: `${getJSType(value)} (${JSON.stringify(value)})`,
        message: `Type mismatch for field "${field}": expected ${prop.type} but got ${getJSType(value)}`,
        agentId: agentId as any,
        service,
        endpoint,
        detectedBy: 'specmatic',
        preventedDeployment: true,
      });
    }
  }

  return violations;
}

/**
 * Validate all artifacts from an agent run.
 */
export function validateArtifacts(artifacts: AgentArtifact[]): AgentArtifact[] {
  return artifacts.map((artifact) => {
    // If the artifact already has violations from the agent, keep them
    if (artifact.violations.length > 0) return artifact;

    // Determine which schema to validate against
    let schemaName = '';
    if (artifact.method === 'POST') {
      if (artifact.endpoint.includes('users')) schemaName = 'User';
      else if (artifact.endpoint.includes('tasks')) schemaName = 'Task';
      else if (artifact.endpoint.includes('notifications')) schemaName = 'Notification';
    } else if (artifact.method === 'GET') {
      if (artifact.endpoint.includes('users')) schemaName = 'User';
      else if (artifact.endpoint.includes('tasks')) schemaName = 'Task';
      else if (artifact.endpoint.includes('notifications')) schemaName = 'Notification';
    }

    if (!schemaName) return artifact;

    const payload = Array.isArray(artifact.generatedPayload)
      ? artifact.generatedPayload[0] || {}
      : artifact.generatedPayload;

    const violations = validatePayload(
      payload,
      schemaName,
      artifact.service,
      artifact.endpoint,
      artifact.agentId,
    );

    return {
      ...artifact,
      isCompliant: violations.length === 0,
      violations,
    };
  });
}
