/**
 * Contract Validator
 * 
 * Validates agent-generated payloads against OpenAPI contracts.
 * 
 * This validator parses the actual OpenAPI YAML contract files from
 * the /contracts/ directory and validates payloads structurally.
 * 
 * For full contract testing (including HTTP behavior, status codes,
 * resiliency), use Specmatic CLI — see engine.ts Phase 4.
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
 * Parse a simplified schema from the actual OpenAPI YAML contract files.
 * Uses basic YAML parsing without external dependencies.
 */
function loadContractSchemas(): Record<string, Record<string, ContractSchema>> {
  const schemas: Record<string, Record<string, ContractSchema>> = {};

  const contractFiles = [
    { file: 'user-service.yaml', service: 'user-service' },
    { file: 'task-service.yaml', service: 'task-service' },
    { file: 'notification-service.yaml', service: 'notification-service' },
  ];

  for (const { file, service } of contractFiles) {
    const filePath = path.join(CONTRACTS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Contract file not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    schemas[service] = parseOpenAPISchemas(content);
  }

  return schemas;
}

/**
 * Basic YAML/OpenAPI schema parser.
 * Extracts component schemas from OpenAPI YAML files.
 * This is intentionally minimal — for full validation, use Specmatic.
 */
function parseOpenAPISchemas(yamlContent: string): Record<string, ContractSchema> {
  const schemas: Record<string, ContractSchema> = {};
  const lines = yamlContent.split('\n');

  let inSchemas = false;
  let currentSchemaName = '';
  let inProperties = false;
  let inRequired = false;
  let currentProperty = '';
  let currentSchema: ContractSchema = { required: [], properties: {} };

  for (const line of lines) {
    const trimmed = line.trimEnd();
    const indent = line.length - line.trimStart().length;

    // Detect components > schemas section
    if (trimmed.trim() === 'schemas:' && indent === 2) {
      inSchemas = true;
      continue;
    }

    if (!inSchemas) continue;

    // Detect schema name (indent 4, ends with :)
    if (indent === 4 && trimmed.trim().endsWith(':') && !trimmed.trim().startsWith('-')) {
      // Save previous schema
      if (currentSchemaName) {
        schemas[currentSchemaName] = { ...currentSchema };
      }
      currentSchemaName = trimmed.trim().replace(':', '');
      currentSchema = { required: [], properties: {} };
      inProperties = false;
      inRequired = false;
      continue;
    }

    // Detect required section
    if (indent === 6 && trimmed.trim() === 'required:') {
      inRequired = true;
      inProperties = false;
      continue;
    }

    // Detect properties section
    if (indent === 6 && trimmed.trim() === 'properties:') {
      inProperties = true;
      inRequired = false;
      continue;
    }

    // Other top-level schema fields (type, etc.) end required/properties
    if (indent === 6 && !trimmed.trim().startsWith('-')) {
      if (trimmed.trim() !== 'required:' && trimmed.trim() !== 'properties:') {
        inRequired = false;
        inProperties = false;
      }
    }

    // Parse required items
    if (inRequired && indent === 8 && trimmed.trim().startsWith('-')) {
      const fieldName = trimmed.trim().replace(/^-\s*/, '').trim();
      currentSchema.required.push(fieldName);
      continue;
    }

    // Parse property names (indent 8)
    if (inProperties && indent === 8 && trimmed.trim().endsWith(':') && !trimmed.trim().startsWith('-')) {
      currentProperty = trimmed.trim().replace(':', '');
      currentSchema.properties[currentProperty] = { type: 'string' }; // default
      continue;
    }

    // Parse property attributes (indent 10+)
    if (inProperties && currentProperty && indent >= 10) {
      const match = trimmed.trim().match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        if (key === 'type') {
          currentSchema.properties[currentProperty].type = value.trim();
        } else if (key === 'format') {
          currentSchema.properties[currentProperty].format = value.trim();
        }
      }
    }

    // Exit schemas section if we hit a lower indent non-schema line
    if (indent <= 2 && trimmed.trim().length > 0 && !trimmed.trim().startsWith('#')) {
      break;
    }
  }

  // Save last schema
  if (currentSchemaName) {
    schemas[currentSchemaName] = { ...currentSchema };
  }

  return schemas;
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
 * 
 * NOTE: This is a structural validator only. It checks field presence,
 * types, and unexpected fields. For full contract testing (HTTP behavior,
 * status codes, resiliency), use Specmatic CLI.
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
        detectedBy: 'manual',
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
        detectedBy: 'manual',
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
        detectedBy: 'manual',
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
