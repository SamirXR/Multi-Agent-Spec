import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.NVIDIA_API_KEY;
const model = process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';

export const llmClient = new OpenAI({
  apiKey: apiKey || 'MISSING_API_KEY',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

/**
 * Sends a prompt to the Nvidia NIM LLM and parses the response as JSON.
 */
export async function generateJSONResponse(systemPrompt: string, userPrompt: string): Promise<any> {
  if (!apiKey) {
    console.warn('\n⚠ WARNING: NVIDIA_API_KEY is not set. Please copy .env.example to .env and add your key.');
    console.warn('Returning empty object to prevent crash during setup.\n');
    return {};
  }

  try {
    const response = await llmClient.chat.completions.create({
      model,
      messages: [
        { 
          role: 'system', 
          content: systemPrompt + '\n\nCRITICAL INSTRUCTION: You must respond ONLY with raw, valid JSON. Do not wrap it in markdown formatting like ```json. Do not include any explanations.' 
        },
        { 
          role: 'user', 
          content: userPrompt 
        }
      ],
      temperature: 1.00,
      top_p: 1.00,
      max_tokens: 512,
      frequency_penalty: 0.00,
      presence_penalty: 0.00
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    // Clean up <think> tags (from reasoning models) and markdown formatting
    const cleaned = content
      .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove <think>...</think> block
      .replace(/```json/i, '')
      .replace(/```/g, '')
      .trim();
    
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('\n❌ Failed to generate or parse JSON from LLM:');
    console.error(err instanceof Error ? err.message : String(err));
    return {};
  }
}
