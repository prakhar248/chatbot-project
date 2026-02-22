# Demo setup: Expose local Ollama with Cloudflare Tunnel + GitHub Pages

This guide walks you through running your chatbot **online** for a demo by:

1. Exposing your local Ollama API via a **Cloudflare tunnel** (public HTTPS URL).
2. Making the **React app** use that URL when built for production.
3. Deploying the **frontend** to **GitHub Pages** (Vite).
4. Handling **CORS** so the browser can call the tunnel from your GitHub Pages site.
5. Following **best practices** so the demo is reliable.

---

## Overview: what happens

- **Locally:** Your app runs at **http://localhost:5173** (Vite dev server). It talks to Ollama at `http://localhost:11434` through a **proxy** (`/ollama` → localhost). No tunnel needed.
- **Online demo:** The app is hosted on **GitHub Pages**. The browser runs that app and needs to call **Ollama**. Ollama runs only on your machine, so you expose it with a **Cloudflare tunnel**: the tunnel gives a public URL (e.g. `https://abc123.trycloudflare.com`) that forwards traffic to `http://localhost:11434`. Your built app is configured with that URL and sends `POST /api/generate` to it. **CORS** must allow requests from your GitHub Pages origin to the tunnel URL; we explain how to fix it if needed.

---

## Step 1: Install and run a Cloudflare tunnel

A **Cloudflare tunnel** lets the internet reach a service on your computer (here, Ollama) without opening your home router or firewall.

### 1.1 Install `cloudflared`

**Linux (Debian/Ubuntu):**

```bash
# Add Cloudflare package repo and install
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
cloudflared --version
```

**macOS:**

```bash
brew install cloudflared
```

**Windows:**  
Download the Windows binary from [Cloudflare tunnel releases](https://github.com/cloudflare/cloudflared/releases) and add it to your PATH, or use the installer if available.

### 1.2 Start Ollama

Make sure Ollama is running and the model is available:

```bash
ollama serve    # if not already running
ollama run dolphin-llama3
```

### 1.3 Run a quick tunnel (no Cloudflare account)

This creates a **temporary public URL** that forwards to `http://localhost:11434`:

```bash
cloudflared tunnel --url http://localhost:11434
```

**What happens:**  
- `cloudflared` connects to Cloudflare and opens a tunnel.  
- Traffic to the public URL is sent through Cloudflare to your machine and then to `localhost:11434`.  
- You’ll see a line like: **`Your quick Tunnel has been created! Visit it at:`**  
  **`https://<random>.trycloudflare.com`**

**Copy that URL** (e.g. `https://abc-xyz-123.trycloudflare.com`). You’ll use it as the Ollama API base URL in the app.  
**Important:** This URL **changes every time** you run the command. For a stable URL (optional), see “Named tunnel” below.

### 1.4 (Optional) Named tunnel for a stable URL

If you have a Cloudflare account and a domain (or free `*.cfargotunnel.com`), you can create a **named tunnel** so the URL stays the same across restarts. Then you set that URL once in your app and in GitHub.

1. Log in: `cloudflared tunnel login`
2. Create a tunnel: `cloudflared tunnel create ollama-demo`
3. Configure it to forward to localhost:11434 (see [Cloudflare tunnel docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)).
4. Run the tunnel: `cloudflared tunnel run ollama-demo`

Use the stable public hostname (e.g. `ollama-demo.yourdomain.com`) as your API base URL everywhere below.

---

## Step 2: Use the tunnel URL in the React app

The chatbot already uses a **configurable** Ollama base URL.

- **Development:** If `VITE_OLLAMA_API_URL` is not set, the app (at **http://localhost:5173**) uses `/ollama`, which the Vite proxy sends to `http://localhost:11434`. No change needed for local dev.
- **Production (e.g. GitHub Pages):** The app must call the **tunnel URL** instead. That URL is baked in at **build time** via the env variable `VITE_OLLAMA_API_URL`.

**In code:**

- `src/services/ollama.js` uses:  
  `(import.meta.env.VITE_OLLAMA_API_URL || '/ollama')`  
  and then requests **`${OLLAMA_BASE}/api/generate`** with `POST` and JSON body (same as before). So the **fetch** is correct for both local and tunnel; only the base URL changes.

**For a local production build (e.g. to test before deploy):**

Create a `.env` in the **app folder** (same folder as `vite.config.js`):

```env
VITE_OLLAMA_API_URL=https://your-tunnel-url.trycloudflare.com
```

(No trailing slash. Use the URL from Step 1.3 or 1.4.)

Then build:

```bash
cd chatbot-project
npm run build
```

The built files in `dist/` will call your tunnel URL for `/api/generate`.

**For GitHub Pages:**  
The URL is set in the **GitHub Actions** workflow (Step 4). You don’t need a `.env` file in the repo for the tunnel URL.

---

## Step 3: Confirm `/api/generate` (and optional `/api/chat`)

The app uses **`/api/generate`** (Ollama’s completion API). The service builds:

- `url = ${OLLAMA_BASE}/api/generate`
- `method: 'POST'`
- `body: { model, prompt, stream: false }`

So the **fetch** is correct. If you later switch to **`/api/chat`** (chat API), you’d change the path and body in `src/services/ollama.js` to match [Ollama’s chat API](https://github.com/ollama/ollama/blob/main/docs/api.md); the tunnel and CORS steps stay the same.

---

## Step 4: Deploy the React frontend on GitHub Pages (Vite)

### 4.1 Base path for GitHub Pages

Your site will be at `https://<username>.github.io/<repo-name>/`. Vite must know this base.

In **`chatbot-project/vite.config.js`** add (use your real repo name):

```js
export default defineConfig({
  base: '/your-repo-name/',   // e.g. '/chatbot-project/' — must start and end with /
  plugins: [react()],
  server: { ... },
})
```

### 4.2 Push code and enable GitHub Pages

1. Push your repo to GitHub (including the workflow and `base` change).
2. In the repo: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **“GitHub Actions”.**
4. Save.

### 4.3 Set the tunnel URL for the build

The workflow builds the app and bakes in the Ollama API URL from a **secret**:

1. In the repo: **Settings → Secrets and variables → Actions**.
2. **New repository secret**
   - Name: `OLLAMA_TUNNEL_URL`
   - Value: your tunnel URL, e.g. `https://abc-xyz.trycloudflare.com` (no trailing slash).
3. Save.

The workflow (`.github/workflows/deploy.yml`) passes this into the build as `VITE_OLLAMA_API_URL`. So the deployed site will call your tunnel.

**If you use a quick tunnel:**  
The URL changes each time you run `cloudflared tunnel --url http://localhost:11434`. After starting a new tunnel, update the secret `OLLAMA_TUNNEL_URL` and re-run the “Deploy to GitHub Pages” workflow (or push a small commit) so the frontend is rebuilt with the new URL.

### 4.4 Deploy

Push to the branch that triggers the workflow (e.g. `master`). The workflow will:

1. Install dependencies and run `npm run build` in the app folder with `VITE_OLLAMA_API_URL` set.
2. Deploy the `dist` artifact to GitHub Pages.

Your chatbot will be at `https://<username>.github.io/<repo-name>/`.

---

## Step 5: CORS between GitHub Pages and the tunneled API

When the app runs on GitHub Pages, the **origin** is e.g. `https://<username>.github.io`. The browser sends requests to your **tunnel URL** (e.g. `https://xxx.trycloudflare.com`). That’s **cross-origin**, so the browser enforces **CORS**: the tunnel (or whatever responds at that URL) must send back headers like:

- `Access-Control-Allow-Origin: *` (or your GitHub Pages origin)
- And for `POST` with JSON, the server must respond correctly to the `OPTIONS` preflight.

**Ollama** may already send permissive CORS in some versions. If your demo works without any extra step, you’re done.

If you see a CORS error in the browser console (e.g. “blocked by CORS policy”):

### Option A: Cloudflare Worker as CORS proxy (recommended for demo)

Put a **Cloudflare Worker** in front of your tunnel so the **browser only talks to the Worker**; the Worker adds CORS and forwards to the tunnel.

1. In Cloudflare Dashboard: **Workers & Pages → Create application → Worker**.
2. Replace the script with something like this (use your tunnel URL in `OLLAMA_TUNNEL`):

```js
const OLLAMA_TUNNEL = 'https://your-actual-tunnel.trycloudflare.com';

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname || '/';
    const target = `${OLLAMA_TUNNEL.replace(/\/$/, '')}${path}${url.search}`;

    const res = await fetch(target, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    const newHeaders = new Headers(res.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    return new Response(res.body, { status: res.status, headers: newHeaders });
  },
};
```

3. Deploy the Worker and note its URL (e.g. `https://ollama-proxy.<your-subdomain>.workers.dev`).
4. Use **this Worker URL** as the Ollama API base everywhere:
   - In GitHub secret `OLLAMA_TUNNEL_URL` set the **Worker URL** (e.g. `https://ollama-proxy.<your-subdomain>.workers.dev`).
   - The app will send requests to `https://worker-url/api/generate`; the Worker forwards to `https://tunnel-url/api/generate` and adds CORS.

So: **Browser → Worker (CORS added) → Tunnel → Ollama.**

### Option B: Run Ollama with CORS (if supported)

If your Ollama build supports a CORS flag or config, you could allow your GitHub Pages origin. Check Ollama’s docs and release notes; this isn’t always available.

---

## Step 6: Best practices for a reliable demo

1. **Stable URL:** Use a **named tunnel** (Step 1.4) so you don’t have to update the secret and redeploy every time you restart the tunnel.
2. **Keep tunnel and Ollama running:** During the demo, leave `ollama serve` and `cloudflared tunnel ...` running on your machine. If the tunnel drops, restart it and (if using a quick tunnel) update `OLLAMA_TUNNEL_URL` and redeploy.
3. **Don’t commit the tunnel URL:** Use GitHub **Secrets** for `OLLAMA_TUNNEL_URL`; don’t put the live URL in `.env` committed to the repo. Use `.env.example` (without the real URL) for documentation.
4. **Security:** The tunnel is public. Anyone with the URL can use your Ollama (and your machine’s resources). Use this only for short demos; stop the tunnel when you’re done. For anything more, use auth or a private backend.
5. **Test before the demo:** Open the GitHub Pages site, start the tunnel and Ollama, ensure the secret is set and the last deploy used it. Send a few messages to confirm responses load.
6. **Errors in the UI:** The app already shows “Error: …” in the chat when the request fails (network, CORS, 502, etc.). That helps you see when the tunnel or Ollama is down.
7. **Local dev:** Always use **http://localhost:5173** to run the chatbot locally (Vite’s default port).

---

## Quick checklist

- [ ] Ollama running; `dolphin-llama3` available.
- [ ] Cloudflare tunnel running and public URL copied.
- [ ] `vite.config.js` has `base: '/your-repo-name/'`.
- [ ] GitHub Pages source set to **GitHub Actions**.
- [ ] Secret `OLLAMA_TUNNEL_URL` set to tunnel URL (or Worker URL if using CORS proxy).
- [ ] Push to trigger deploy; wait for workflow to finish.
- [ ] If CORS errors appear, add the Worker (Step 5) and set `OLLAMA_TUNNEL_URL` to the Worker URL, then redeploy.
- [ ] Test the live site; run tunnel (and Worker if used) during the demo.

You now have the app built to use the tunnel URL, deploy to GitHub Pages, and a clear path to fix CORS and run a reliable demo.
