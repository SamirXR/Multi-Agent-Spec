import { AgentArtifact, AgentId } from '../types';
import { generateJSONResponse } from '../llm';

const AGENT_ID: AgentId = 'testing';

const endpoints = [
  { method: 'POST', path: '/users', service: 'user-service' },
  { method: 'POST', path: '/tasks', service: 'task-service' },
];

const expectedPayloads: Record<string, any> = {
  'POST /users': { testName: 'Should create a user', expectedStatus: 201, expectedResponse: { id: 1, name: 'Samir', email: 'samir@example.com' } },
  'POST /tasks': { testName: 'Should create a task', expectedStatus: 201, expectedResponse: { id: 1, title: 'Task 1' } },
};

export async function generateTestingArtifacts(drift: boolean = false): Promise<AgentArtifact[]> {
  const artifacts: AgentArtifact[] = [];
  const timestamp = new Date().toISOString();

  for (const { method, path, service } of endpoints) {
    const endpoint = `${method} ${path}`;
    const expectedPayload = expectedPayloads[endpoint];

    const systemPrompt = `You are an SDET AI Agent writing automated API tests.`;
    
    let userPrompt = `Generate a JSON object representing a test case for ${endpoint} on ${service}.\n\nExpected structure:\n${JSON.stringify(expectedPayload, null, 2)}`;
    
    if (drift) {
      userPrompt += `\n\nDRIFT MODE: Introduce an assertion hallucination. For example, change the expectedStatus to 200 instead of 201, or add assertions for fields that don't exist.`;
    }

    const generatedPayload = await generateJSONResponse(systemPrompt, userPrompt);

    artifacts.push({
      agentId: AGENT_ID,
      service,
      endpoint,
      method,
      generatedPayload,
      expectedPayload,
      isCompliant: true,
      violations: [],
      timestamp,
    });
  }

  return artifacts;
}
