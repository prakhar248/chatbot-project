/**
 * Service to talk to Ollama API (local or tunneled).
 * - Dev: app at http://localhost:5173; uses Vite proxy /ollama -> http://localhost:11434 (no env needed).
 * - Production: set VITE_OLLAMA_API_URL to your tunnel URL (e.g. https://xxx.trycloudflare.com).
 */

const OLLAMA_BASE = (import.meta.env.VITE_OLLAMA_API_URL || '/ollama').replace(/\/$/, '');
const DEFAULT_MODEL = 'dolphin-llama3';

/**
 * Get a completion from the Ollama model.
 * @param {string} prompt - User message
 * @param {string} [model] - Model name (default: dolphin-llama3)
 * @returns {Promise<string>} Assistant reply text
 */
export async function getOllamaResponse(prompt, model = DEFAULT_MODEL) {
  const url = `${OLLAMA_BASE}/api/generate`;
  const res = await fetch(url, {
    method: 'POST',
    mode: 'cors',
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
