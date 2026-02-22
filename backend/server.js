/**
 * Minimal proxy backend: forwards /chat to Ollama's /api/generate.
 * Set OLLAMA_URL (e.g. your Cloudflare tunnel URL) in the environment.
 * Port: use PORT for Render; defaults to 3000 locally.
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const OLLAMA_URL = (process.env.OLLAMA_URL || '').replace(/\/$/, '');

if (!OLLAMA_URL) {
  console.warn('Warning: OLLAMA_URL is not set. Set it to your Ollama or tunnel base URL (e.g. https://xxx.trycloudflare.com)');
}

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Chat proxy is running' });
});

app.post('/chat', async (req, res) => {
  if (!OLLAMA_URL) {
    return res.status(503).json({
      error: 'OLLAMA_URL is not configured. Set it in your environment (e.g. on Render).',
    });
  }

  const { prompt, model = 'dolphin-llama3' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "prompt" in request body' });
  }

  const generateUrl = `${OLLAMA_URL}/api/generate`;

  try {
    const ollamaRes = await fetch(generateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text();
      const status = ollamaRes.status;
      if (status === 404) {
        return res.status(404).json({
          error: `Model "${model}" not found. Pull it with: ollama pull ${model}`,
        });
      }
      if (status === 502 || status === 0) {
        return res.status(502).json({
          error: 'Cannot reach Ollama. Is it running? Is the tunnel URL correct and the tunnel running?',
        });
      }
      return res.status(status).json({ error: text || `Ollama error: ${status}` });
    }

    const data = await ollamaRes.json();
    const responseText = (data.response && data.response.trim()) || '(No response)';

    res.json({ response: responseText });
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(502).json({
      error: 'Proxy could not reach Ollama. Check OLLAMA_URL and that the tunnel (or Ollama) is running.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Chat proxy listening on port ${PORT}`);
  if (OLLAMA_URL) {
    console.log(`Ollama base URL: ${OLLAMA_URL}`);
  }
});
