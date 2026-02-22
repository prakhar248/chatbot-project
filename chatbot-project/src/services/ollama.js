/**
 * Service to talk to Ollama (local, tunnel, or via proxy backend).
 * - Dev: app at http://localhost:5173; uses Vite proxy /ollama -> localhost:11434 (no env needed).
 * - Production with proxy (recommended): set VITE_CHAT_API_URL to your Render proxy URL; proxy uses OLLAMA_URL (tunnel) on the server.
 * - Production without proxy: set VITE_OLLAMA_API_URL to your tunnel URL (less stable when tunnel URL changes).
 */

const PROXY_BASE = (import.meta.env.VITE_CHAT_API_URL || '').replace(/\/$/, '');
const OLLAMA_BASE = (import.meta.env.VITE_OLLAMA_API_URL || '/ollama').replace(/\/$/, '');
const DEFAULT_MODEL = 'dolphin-llama3';

/**
 * Get a completion from the Ollama model (via proxy if configured, else direct).
 * @param {string} prompt - User message
 * @param {string} [model] - Model name (default: dolphin-llama3)
 * @returns {Promise<string>} Assistant reply text
 */
export async function getOllamaResponse(prompt, model = DEFAULT_MODEL) {
  if (PROXY_BASE) {
    return getResponseViaProxy(prompt, model);
  }
  return getResponseDirect(prompt, model);
}

async function getResponseViaProxy(prompt, model) {
  const url = `${PROXY_BASE}/chat`;
  const res = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model }),
  });

  const data = await res.json().catch(() => ({}));
  const message = data.error || data.message;

  if (!res.ok) {
    throw new Error(message || `Proxy error: ${res.status}`);
  }

  return (data.response && data.response.trim()) || '(No response)';
}

async function getResponseDirect(prompt, model) {
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
