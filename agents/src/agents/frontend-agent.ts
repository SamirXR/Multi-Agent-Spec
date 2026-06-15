import { AgentArtifact, AgentId } from '../types';
import { generateJSONResponse } from '../llm';

const AGENT_ID: AgentId = 'frontend';

const endpoints = [
  { method: 'POST', path: '/users', service: 'user-service' },
  { method: 'POST', path: '/tasks', service: 'task-service' },
  { method: 'POST', path: '/notifications', service: 'notification-service' },
];

const expectedPayloads: Record<string, any> = {
  'POST /users': { name: 'Samir', email: 'samir@example.com', phone: '9876543210', role: 'developer' },
  'POST /tasks': { title: 'Implement API', description: 'Build auth', assigneeId: 1, priority: 'high' },
  'POST /notifications': { userId: 1, message: 'Task assigned', type: 'info' },
};

export async function generateFrontendArtifacts(drift: boolean = false): Promise<AgentArtifact[]> {
  const artifacts: AgentArtifact[] = [];
  const timestamp = new Date().toISOString();

  for (const { method, path, service } of endpoints) {
    const endpoint = `${method} ${path}`;
    const expectedPayload = expectedPayloads[endpoint];

    const systemPrompt = `You are a Frontend Developer AI Agent. You are writing code that calls backend APIs.`;
    
    let userPrompt = `Generate a valid JSON payload for the request body of ${endpoint} on the ${service}.\n\nExpected fields and structure:\n${JSON.stringify(expectedPayload, null, 2)}`;
    
    if (drift) {
      userPrompt += `\n\nDRIFT MODE: Introduce a subtle "hallucination" mistake in the JSON keys. For example, rename 'name' to 'username', or 'userId' to 'user_id', or 'description' to 'desc'. This simulates an AI writing code that diverges slightly from the contract. Do not add any other text, just the JSON.`;
    }

    const generatedPayload = await generateJSONResponse(systemPrompt, userPrompt);

    artifacts.push({
      agentId: AGENT_ID,
      service,
      endpoint,
      method,
      generatedPayload,
      expectedPayload,
      isCompliant: true, // Will be evaluated by validator
      violations: [], // Will be filled by validator
      timestamp,
    });
  }

  return artifacts;
}
