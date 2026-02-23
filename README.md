# LLM Chatbot with Ollama + Express Proxy

A locally hosted AI chatbot that integrates an Ollama LLM with a Node.js Express proxy backend.  
The project demonstrates API forwarding, streaming responses, and exposing a local LLM securely over the internet.

---

## Features
- Chat interface powered by a locally running LLM (Ollama)
- Express proxy backend to forward requests to Ollama API
- Remote access using Cloudflare Tunnel
- Streaming / real-time response handling
- Environment variable configuration for secure deployment
- Developed and tested in Linux environment

---

## Architecture
Frontend (Chat UI)
↓
Express Proxy Backend
↓
Ollama Local LLM API
↓
Cloudflare Tunnel (for remote access)

The Express backend acts as a bridge between the frontend and Ollama, enabling flexible request handling and secure exposure.

---

## Tech Stack

Frontend: HTML, CSS, JavaScript  
Backend: Node.js, Express.js  
LLM Runtime: Ollama  
Networking: Cloudflare Tunnel  
Environment: Linux

---

## Setup Instructions
1. Clone the repository
  git clone https://github.com/your-username/your-repo.git
  cd your-repo

2. Install dependencies
  npm install

3. Start Ollama
  Make sure Ollama is installed and running:
  ollama run dolphin

4. Configure environment variables
  Create a .env file:
  OLLAMA_URL=http://localhost:11434
  PORT=3000

5. Start backend server
  node server.js

6. Start Cloudflare tunnel (optional)
  cloudflared tunnel --url http://localhost:3000
