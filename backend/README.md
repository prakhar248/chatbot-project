# Chatbot proxy backend

A small **Express** server that sits between your chatbot frontend and Ollama. The frontend calls this proxy (e.g. on Render); the proxy calls your Ollama instance (e.g. via a Cloudflare tunnel). When the tunnel URL changes, you only update **OLLAMA_URL** on the proxy—the frontend keeps using the same proxy URL.

## Project structure

```
backend/
├── server.js      # Express app: /chat and /health
├── package.json   # Dependencies and start script
└── README.md      # This file
```

## How it works

1. Frontend sends `POST /chat` with `{ "prompt": "user message", "model": "dolphin-llama3" }`.
2. The server forwards the request to `OLLAMA_URL/api/generate` (your Ollama or tunnel).
3. The server returns `{ "response": "model reply text" }` to the frontend.
4. Errors from Ollama or the network are returned as JSON with an `error` field and an appropriate status code.

## Run locally

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Set the Ollama (or tunnel) base URL and start the server:

   ```bash
   export OLLAMA_URL=https://your-tunnel.trycloudflare.com
   npm start
   ```

   Or use a `.env` file with a tool like `dotenv` (optional). For a quick test with local Ollama:

   ```bash
   export OLLAMA_URL=http://localhost:11434
   npm start
   ```

3. The server listens on **port 3000** by default. Test:

   ```bash
   curl -X POST http://localhost:3000/chat \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Hello","model":"dolphin-llama3"}'
   ```

   You should get JSON with a `response` field.

## Deploy on Render

1. **New → Web Service** and connect your repo (e.g. `prakhar248/chatbot-project`).

2. **Root directory:** set to **`backend`** (so Render uses this folder).

3. **Build command:** leave empty or use:
   ```bash
   npm install
   ```

4. **Start command:** (Render will use this from `package.json` if not overridden)
   ```bash
   npm start
   ```

5. **Environment:** add a variable:
   - **Key:** `OLLAMA_URL`
   - **Value:** your Ollama base URL (e.g. your Cloudflare tunnel: `https://xxxx.trycloudflare.com`).
   - No trailing slash.

6. Deploy. Render assigns a **PORT**; the app uses `process.env.PORT`, so no code change is needed.

7. Note your service URL (e.g. `https://your-proxy.onrender.com`). Use this as **VITE_CHAT_API_URL** when building the frontend (see below).

## Updating OLLAMA_URL when the tunnel URL changes

The Cloudflare **quick** tunnel gives a new URL every time you restart it. Only the proxy needs to know that URL.

1. **On Render:** open your service → **Environment**.
2. Change **OLLAMA_URL** to the new tunnel URL (e.g. the new `https://xxxx.trycloudflare.com`).
3. Save. Render will redeploy (or use **Manual Deploy** if you want to force it).

You do **not** need to change the frontend or redeploy GitHub Pages. The frontend always calls the same proxy URL; only the proxy’s `OLLAMA_URL` changes.

## Frontend configuration

Build the frontend with the **proxy** URL so it talks to Render instead of the tunnel directly:

- Set **VITE_CHAT_API_URL** to your Render backend URL, e.g. `https://your-proxy.onrender.com`.
- Do **not** set `VITE_OLLAMA_API_URL` when using the proxy (so the app uses `/chat` on the proxy).

For **GitHub Actions** (e.g. for GitHub Pages), add a secret or variable:

- **Name:** `VITE_CHAT_API_URL`
- **Value:** `https://your-proxy.onrender.com`

Use it in the build step:

```yaml
env:
  VITE_CHAT_API_URL: ${{ secrets.VITE_CHAT_API_URL }}
```

Then the deployed site will call your Render proxy, and you only update **OLLAMA_URL** on Render when the tunnel URL changes.

## API reference

| Method | Path     | Body (JSON)                    | Response (JSON)        |
|--------|----------|--------------------------------|------------------------|
| GET    | /health  | -                              | `{ "ok": true, ... }`  |
| POST   | /chat    | `{ "prompt": "...", "model"?: "dolphin-llama3" }` | `{ "response": "..." }` or `{ "error": "..." }` |

Errors use standard HTTP status codes (400, 404, 502, 503) and a JSON body with an `error` field.
