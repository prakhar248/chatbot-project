# Quick Start Guide - Enhanced Chatbot

## What Changed?

Your chatbot now has professional features that improve user experience and code quality.

## New Features at a Glance

| Feature | What It Does | Where to Find It |
|---------|-------------|-----------------|
| 💾 **Save to Browser Storage** | Messages stay after refresh | Automatic (uses localStorage) |
| 🔄 **Clear Chat Button** | Remove all messages easily | Top right of header |
| ⏳ **Loading Spinner** | Visual feedback while waiting | Below messages during API call |
| ⌨️ **Typing Effect** | Shows bot is thinking | Animated dots before response |
| ❌ **Error Messages** | Friendly error alerts | In red box if API fails |
| 🎯 **Smart Personality** | Bot has consistent tone | System prompt sent with each message |
| ⬇️ **Auto-Scroll** | Always see latest message | Automatic when new message arrives |

## How to Use

### 1. **Send a Message**
- Type in the input box at the bottom
- Press **Enter** or click **Send**
- You'll see:
  1. Your message appears (blue bubble, right side)
  2. Typing indicator appears (`. . .` animation)
  3. Bot response appears (white bubble, left side)

### 2. **Chat Persists**
- All messages saved automatically to your browser
- Close the tab and come back later
- Messages will still be there!
- *(Note: Different browsers/devices have separate histories)*

### 3. **Clear All Messages**
- Click **Clear Chat** button in the header
- Confirms before deleting
- All messages removed from chat AND browser storage

### 4. **Handle Errors**
If something goes wrong, you'll see a friendly error message:
- **"Backend offline"** → Server isn't running
- **"Request timed out"** → Server is slow
- **"Network error"** → Check internet connection

Just try again or check the [backend README](../backend/README.md) to restart the server.

### 5. **Customize the Bot's Personality**
Edit the system prompt in `src/components/ChatInput.jsx`:

```javascript
// Line 9-12 - Change this text to customize bot behavior
const SYSTEM_PROMPT = `You are a helpful, friendly, and concise AI assistant. 
Answer questions clearly and provide useful information.
Keep responses brief and to the point unless asked for more details.
Be conversational and approachable.`;
```

### 6. **Debug in Browser**
Open **DevTools** (F12) and check:

**See saved messages:**
```javascript
JSON.parse(localStorage.getItem('chatbot_history'))
```

**Clear storage if corrupted:**
```javascript
localStorage.clear()
```

**Check API requests:**
- DevTools → Network tab
- Send a message
- Find the POST request to `/chat`
- Click it → see Request body with `systemPrompt`

---

## Code Structure (For Developers)

### Components Tree
```
App.jsx (Main - handles state & localStorage)
├── ChatMessages.jsx (Shows all messages with auto-scroll)
│   └── ChatMessage.jsx (Single message bubble)
└── ChatInput.jsx (Input field & send button)

Services:
└── ollama.js (API communication - now with system prompt support)
```

### Key State Variables (in App.jsx)
- `chatMessages` → Array of all messages
- `isLoading` → Boolean for loading state
- `CHAT_STORAGE_KEY` → Where to save in localStorage

### Message Object Format
```javascript
{
  id: "abc123",              // Unique ID (UUID)
  message: "Hello!",         // Message text
  sender: "user" or "robot", // Who sent it
  isTyping: false,           // Animation flag
  isError: false             // Error flag
}
```

---

## Common Tasks

### Add a Feature
1. Edit the component file (e.g., `ChatInput.jsx`)
2. Update any related CSS file
3. Test in browser (npm run dev)
4. Check DevTools for errors

### Change Colors
Edit the CSS files:
- `App.css` - Header, buttons
- `ChatMessages.css` - Message bubbles, spinner
- `ChatInput.css` - Input field, send button

### Change Storage Key
Edit `App.jsx` line 6:
```javascript
const CHAT_STORAGE_KEY = 'my_custom_key';
```

### Add Timeout Handling
Edit `ChatInput.jsx` in the `getErrorMessage()` function to add custom error messages.

---

## Troubleshooting

**Q: Messages disappeared after refresh**
- Check if localStorage is enabled in your browser
- Try clearing browser cache and reload
- Check browser storage limits (usually ~5MB)

**Q: "Backend offline" error keeps appearing**
- Verify the backend URL in your env: `VITE_CHAT_API_URL`
- Check if server is running: `npm run dev` in backend folder
- Try restarting the backend

**Q: Spinner spins forever**
- Backend might be slow or timedout
- Check browser console (F12) for errors
- Try sending a simpler message

**Q: Button stays disabled**
- Refresh the page
- Clear localStorage with: `localStorage.clear()`

---

## File Locations

| File | Purpose | Edit For |
|------|---------|----------|
| `src/App.jsx` | Main app, state, localStorage | Storage settings, UI layout |
| `src/components/ChatInput.jsx` | Message sending, system prompt | Bot personality, error messages |
| `src/components/ChatMessages.jsx` | Message display, auto-scroll | Message styling, animation speed |
| `src/components/ChatMessage.jsx` | Individual message bubbles | Message appearance |
| `src/services/ollama.js` | API communication | API endpoints, request format |
| `src/App.css` | Header styling | Header design, colors |
| `src/components/ChatMessages.css` | Message bubbles, spinner | Bubble colors, animation timing |
| `src/components/ChatInput.css` | Input field, buttons, errors | Button colors, input styling |

---

## Performance Tips

1. **localStorage max:** ~5-10MB (approximately 5,000-10,000 messages)
2. **Clear chat regularly** if using for testing many messages
3. **Spinner animation** is lightweight - no performance impact
4. **Auto-scroll** only triggers when messages change

---

## Browser Compatibility

✅ Chrome/Edge  
✅ Firefox  
✅ Safari  
❌ Internet Explorer (not supported)

---

## Next Steps

1. **Test the features** - Send messages, refresh, clear chat
2. **Customize personality** - Edit the system prompt
3. **Deploy to production** - Use your Render backend URL
4. **Add more features** - See IMPROVEMENTS.md for ideas

---

## Need Help?

Check these files:
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Detailed feature documentation
- [../backend/README.md](../backend/README.md) - Backend setup guide
- [DEPLOY.md](./DEPLOY.md) - Deployment instructions

Happy chatting! 🚀
