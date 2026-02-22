/**
 * Service to talk to a local Ollama API (e.g. Dolphin model).
 * Uses Vite proxy in dev: /ollama -> http://localhost:11434
 */

const OLLAMA_BASE = '/ollama';
const DEFAULT_MODEL = 'dolphin-llama3';

/**
 * Get a completion from the local Ollama model.
 * @param {string} prompt - User message
 * @param {string} [model] - Model name (default: dolphin)
 * @returns {Promise<string>} Assistant reply text
 */
export async function getOllamaResponse(prompt, model = DEFAULT_MODEL) {
  const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 404) {
      throw new Error(`Model "${model}" not found. Pull it with: ollama pull ${model}`);
    }
    if (res.status === 0 || res.status === 502) {
      throw new Error('Cannot reach Ollama. Is it running? Start it with: ollama serve');
    }
    throw new Error(text || `Ollama error: ${res.status}`);
  }

  const data = await res.json();
  return (data.response && data.response.trim()) || '(No response)';
}
