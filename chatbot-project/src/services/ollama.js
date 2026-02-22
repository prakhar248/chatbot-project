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
 * 
 * @param {string} prompt - User message
 * @param {string} [systemPrompt] - System message to define bot behavior (optional)
 * @param {string} [model] - Model name (default: dolphin-llama3)
 * @returns {Promise<string>} Assistant reply text
 */
export async function getOllamaResponse(prompt, systemPrompt = '', model = DEFAULT_MODEL) {
  if (PROXY_BASE) {
    return getResponseViaProxy(prompt, systemPrompt, model);
  }
  return getResponseDirect(prompt, systemPrompt, model);
}

/**
 * Send request through the backend proxy server
 * The proxy handles CORS and forwards requests to the Ollama API
 */
async function getResponseViaProxy(prompt, systemPrompt = '', model) {
  const url = `${PROXY_BASE}/chat`;
  
  // Prepare the request body with both user prompt and system prompt
  const requestBody = {
    prompt,
    model,
  };
  
  // Include system prompt if provided
  if (systemPrompt) {
    requestBody.systemPrompt = systemPrompt;
  }
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json().catch(() => ({}));
    const message = data.error || data.message;

    if (!res.ok) {
      throw new Error(message || `Proxy error: ${res.status}`);
    }

    return (data.response && data.response.trim()) || '(No response)';
  } catch (err) {
    // Re-throw with better error messages for common cases
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Failed to fetch: Backend server may be offline');
    }
    throw err;
  }
}

/**
 * Send request directly to Ollama (used in development with local or tunneled Ollama)
 */
async function getResponseDirect(prompt, systemPrompt = '', model) {
  const url = `${OLLAMA_BASE}/api/generate`;
  
  // Combine system prompt with user prompt if system prompt is provided
  const fullPrompt = systemPrompt 
    ? `${systemPrompt}\n\nUser: ${prompt}` 
    : prompt;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: fullPrompt,
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
  } catch (err) {
    // Re-throw with better error messages
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Failed to fetch: Cannot reach Ollama server');
    }
    throw err;
  }
}
