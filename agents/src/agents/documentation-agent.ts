import { AgentArtifact, AgentId } from '../types';
import { generateJSONResponse } from '../llm';

const AGENT_ID: AgentId = 'documentation';

const endpoints = [
  { method: 'POST', path: '/users', service: 'user-service' },
];

const expectedPayloads: Record<string, any> = {
  'POST /users': { description: 'Create a new user', requiredFields: ['name', 'email', 'phone'] },
};

export async function generateDocumentationArtifacts(drift: boolean = false): Promise<AgentArtifact[]> {
  const artifacts: AgentArtifact[] = [];
  const timestamp = new Date().toISOString();

  for (const { method, path, service } of endpoints) {
    const endpoint = `${method} ${path}`;
    const expectedPayload = expectedPayloads[endpoint];

    const systemPrompt = `You are a Technical Writer AI Agent generating API documentation.`;
    
    let userPrompt = `Generate a JSON documentation object for ${endpoint}.\n\nExpected structure:\n${JSON.stringify(expectedPayload, null, 2)}`;
    
    if (drift) {
      userPrompt += `\n\nDRIFT MODE: Add fields to 'requiredFields' that don't exist (like 'password' or 'address').`;
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
