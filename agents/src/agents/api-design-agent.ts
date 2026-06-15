import { AgentArtifact, AgentId } from '../types';
import { generateJSONResponse } from '../llm';

const AGENT_ID: AgentId = 'api-design';

const endpoints = [
  { method: 'SPEC', path: '/users', service: 'user-service' },
];

const expectedPayloads: Record<string, any> = {
  'SPEC /users': { openapi: '3.0.3', info: { title: 'User Service' }, paths: { '/users': { post: {} } } },
};

export async function generateAPIDesignArtifacts(drift: boolean = false): Promise<AgentArtifact[]> {
  const artifacts: AgentArtifact[] = [];
  const timestamp = new Date().toISOString();

  for (const { method, path, service } of endpoints) {
    const endpoint = `${method} ${path}`;
    const expectedPayload = expectedPayloads[endpoint];

    const systemPrompt = `You are an API Architect AI Agent generating OpenAPI specifications as JSON.`;
    
    let userPrompt = `Generate a tiny subset of an OpenAPI JSON document for ${endpoint}.\n\nExpected structure:\n${JSON.stringify(expectedPayload, null, 2)}`;
    
    if (drift) {
      userPrompt += `\n\nDRIFT MODE: Make the OpenAPI version '2.0' instead of '3.0.3' or change the path to '/v1/users'.`;
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
