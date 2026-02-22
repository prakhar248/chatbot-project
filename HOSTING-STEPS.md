# Exact steps to host your chatbot on GitHub Pages

**Your setup:**  
- GitHub username: **prakhar248**  
- Repository name: **chatbot-project**  
- App folder inside repo: **chatbot-project**  

**Live site URL after hosting:**  
**https://prakhar248.github.io/chatbot-project/**

---

## Step 1: Set the base path (already done)

The app is configured with `base: '/chatbot-project/'` in `chatbot-project/vite.config.js` so that assets load correctly on GitHub Pages. No change needed unless you rename the repo.

---

## Step 2: Push your code to GitHub

If the repo is not on GitHub yet:

```bash
cd /home/prakhar-chouhan/chatbot-project
git add .
git commit -m "Prepare for GitHub Pages"
git remote add origin https://github.com/prakhar248/chatbot-project.git
git branch -M master
git push -u origin master
```

If the repo already exists and you only need to push latest changes:

```bash
cd /home/prakhar-chouhan/chatbot-project
git add .
git commit -m "Update for hosting"
git push origin master
```

---

## Step 3: Enable GitHub Pages with GitHub Actions

1. Open: **https://github.com/prakhar248/chatbot-project**
2. Go to **Settings** (repo settings, not your profile).
3. In the left sidebar, click **Pages** (under "Code and automation").
4. Under **Build and deployment**:
   - **Source:** choose **GitHub Actions** (not "Deploy from a branch").
5. Do **not** create a workflow manually—the repo already has `.github/workflows/deploy.yml`.

---

## Step 4: Trigger the deploy

- If you just pushed in Step 2, the workflow runs automatically. Go to the **Actions** tab and wait for the **Deploy to GitHub Pages** workflow to finish (green check).
- If you didn’t push, push any change to the `master` branch, or run the workflow manually: **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

---

## Step 5: Open your site

After the workflow succeeds (usually 1–2 minutes):

**https://prakhar248.github.io/chatbot-project/**

Bookmark this URL. The chatbot UI will load.  
**Note:** Replies from Dolphin will only work if you expose Ollama with a Cloudflare tunnel and set the secret below (see DEMO-SETUP.md). Otherwise the hosted site is UI only.

---

## Optional: Make the hosted chatbot talk to your local Ollama (demo)

To have the **hosted** site send messages to your **local** Ollama:

1. On your laptop, run a Cloudflare tunnel (see **DEMO-SETUP.md** for install and commands):
   ```bash
   cloudflared tunnel --url http://localhost:11434
   ```
2. Copy the URL it prints (e.g. `https://xxxx.trycloudflare.com`).
3. In the repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - Name: `OLLAMA_TUNNEL_URL`
   - Value: the tunnel URL (e.g. `https://xxxx.trycloudflare.com`) — no trailing slash.
4. Re-run the deploy: **Actions** → **Deploy to GitHub Pages** → **Run workflow**.
5. Keep Ollama and the tunnel running on your laptop when you demo. CORS may require the Cloudflare Worker step in DEMO-SETUP.md if you see CORS errors.

---

## Troubleshooting

| Issue | What to do |
|--------|------------|
| 404 or blank page | Confirm `base: '/chatbot-project/'` in `chatbot-project/vite.config.js` and that the workflow builds from the `chatbot-project` folder. |
| Workflow fails | Open the failed run in the **Actions** tab and read the error (e.g. `npm ci` or path). |
| Site not updating | Push a new commit to `master` or re-run the workflow; GitHub Pages can take a minute to update. |
| Chat doesn’t respond on the live site | Set `OLLAMA_TUNNEL_URL` and run the tunnel (and see DEMO-SETUP.md for CORS). |

---

## Summary checklist

- [ ] Code pushed to **https://github.com/prakhar248/chatbot-project** on branch **master**
- [ ] **Settings → Pages → Source** = **GitHub Actions**
- [ ] **Actions** tab shows a successful **Deploy to GitHub Pages** run
- [ ] Open **https://prakhar248.github.io/chatbot-project/** and confirm the chatbot UI loads
- [ ] (Optional) Set **OLLAMA_TUNNEL_URL** and run tunnel for live responses
