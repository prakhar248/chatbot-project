# Hosting the chatbot online with GitHub

You can host the **frontend** of this chatbot for free using GitHub. Two simple options:

---

## Option 1: GitHub Pages (free, good for static sites)

Your site will be at: `https://<your-username>.github.io/<repo-name>/`

### Step 1: Push your code to GitHub

If you haven’t already:

```bash
cd /path/to/chatbot-project
git add .
git commit -m "Add sidebar and prepare for deploy"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin master
```

### Step 2: Set the base path for GitHub Pages

If your repo name is `chatbot-project`, your site URL will be  
`https://<username>.github.io/chatbot-project/`.  
So the app must be built with that path as base.

In **`chatbot-project/vite.config.js`** (the one inside the inner `chatbot-project` folder), set `base` to your repo name:

```js
export default defineConfig({
  base: '/chatbot-project/',   // use your actual repo name; must start and end with /
  plugins: [react()],
  // ... rest unchanged
})
```

If your repo has a different name, use that instead of `chatbot-project` (e.g. `base: '/my-chatbot/'`).

### Step 3: Build and deploy

**A) Deploy with GitHub Actions (recommended)**

1. In your repo root (the folder that contains the inner `chatbot-project` app folder), create:

   **`.github/workflows/deploy.yml`**:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [master]

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
             cache-dependency-path: chatbot-project/package-lock.json

         - name: Install and build
           run: |
             cd chatbot-project
             npm ci
             npm run build

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: chatbot-project/dist
   ```

   If your app is **not** in a subfolder (e.g. `package.json` is in the repo root), use this instead for the install/build step:

   ```yaml
         - name: Install and build
           run: |
             npm ci
             npm run build

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: dist
   ```

2. On GitHub: **Settings → Pages**  
   - **Source**: “GitHub Actions”.  
   Save. Push your branch; the workflow will build and deploy.

**B) Deploy manually**

1. From the **app folder** (where `package.json` and `vite.config.js` are):

   ```bash
   cd chatbot-project
   npm run build
   ```

2. Push the **`dist`** folder to a branch named `gh-pages` (or use the “Upload folder” option in the Pages settings and choose `dist`).  
   Or use the `gh-pages` npm package to publish `dist` automatically.

### Step 4: Open your site

After the workflow runs or after you set up Pages, open:

`https://<your-username>.github.io/<repo-name>/`

---

## Option 2: Vercel (free, very easy)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project** and import your repo.
3. If the app is in a subfolder, set **Root Directory** to that folder (e.g. `chatbot-project`).
4. Leave **Build Command** as `npm run build` and **Output Directory** as `dist`.
5. Deploy. You’ll get a URL like `https://your-project.vercel.app`.

No `base` change is needed for Vercel unless you use a custom domain.

---

## Important: chatbot and Ollama

This app is built to talk to **Ollama on your machine** (e.g. `http://localhost:11434`).  
When you host the frontend online:

- The **UI** will be live (welcome screen, sidebar, input, etc.).
- **Replies from Dolphin will not work** on the hosted site, because the browser will try to call “your site’s `/ollama`”, not your laptop.

So:

- **Local use:** Run `npm run dev` and Ollama on your laptop → full chatbot with Dolphin.
- **Hosted use:** You only get the static frontend unless you:
  - Run a **backend** that the hosted site can call, and that backend talks to Ollama (or another API), or  
  - Point the hosted app at a **hosted LLM API** instead of local Ollama.

If you want, the next step can be: “add a config so the hosted app calls a backend URL instead of `/ollama`” and we can sketch that.
