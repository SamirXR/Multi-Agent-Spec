import { AgentArtifact, AgentId } from '../types';
import { generateJSONResponse } from '../llm';

const AGENT_ID: AgentId = 'backend';

const endpoints = [
  { method: 'POST', path: '/users', service: 'user-service' },
  { method: 'POST', path: '/tasks', service: 'task-service' },
  { method: 'POST', path: '/notifications', service: 'notification-service' },
];

const expectedPayloads: Record<string, any> = {
  'POST /users': { id: 1, name: 'Samir', email: 'samir@example.com', phone: '9876543210', role: 'developer', createdAt: '2026-06-15T12:00:00Z' },
  'POST /tasks': { id: 1, title: 'Implement API', description: 'Build auth', assigneeId: 1, status: 'pending', priority: 'high', createdAt: '2026-06-15T12:00:00Z' },
  'POST /notifications': { id: 1, userId: 1, message: 'Task assigned', type: 'info', read: false, createdAt: '2026-06-15T12:00:00Z' },
};

export async function generateBackendArtifacts(drift: boolean = false): Promise<AgentArtifact[]> {
  const artifacts: AgentArtifact[] = [];
  const timestamp = new Date().toISOString();

  for (const { method, path, service } of endpoints) {
    const endpoint = `${method} ${path}`;
    const expectedPayload = expectedPayloads[endpoint];

    const systemPrompt = `You are a Backend Developer AI Agent. You are writing Express API routes and generating response payloads.`;
    
    let userPrompt = `Generate a valid JSON payload for the response body of ${endpoint} on the ${service}.\n\nExpected fields and structure:\n${JSON.stringify(expectedPayload, null, 2)}`;
    
    if (drift) {
      userPrompt += `\n\nDRIFT MODE: Introduce a hallucination mistake. EITHER:\n1) Change the data type of a field (e.g., make phone a number instead of string)\n2) Omit a required field entirely (e.g., forget 'read' or 'createdAt')\n3) Add an unexpected extra field (e.g., 'avatarUrl' or 'updatedAt').\nReturn ONLY the JSON.`;
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
