 import { useState } from 'react'
 import { getOllamaResponse } from '../services/ollama';
 import './ChatInput.css';
 
// Marker ID for typing indicator message
const TYPING_ID = 'typing';

// System prompt that defines the bot's personality and behavior
const SYSTEM_PROMPT = `You are a helpful, friendly, and concise AI assistant. 
Answer questions clearly and provide useful information.
Keep responses brief and to the point unless asked for more details.
Be conversational and approachable.`;

/**
 * ChatInput Component
 * Handles user input and sends messages to the backend
 * 
 * Props:
 *   - chatMessages: Array of message objects
 *   - setChatMessages: Function to update messages
 *   - isLoading: Boolean indicating if API call is in progress
 *   - setIsLoading: Function to update loading state
 */
export function ChatInput({ chatMessages, setChatMessages, isLoading, setIsLoading }) {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(null);

  /**
   * Update input text as user types
   */
  function saveInputText(event) {
    setInputText(event.target.value);
    setError(null); // Clear error when user starts typing
  }

  /**
   * Send the message to the backend API
   */
  async function sendMessage() {
    const text = inputText.trim();
    
    // Validation: don't send empty messages or duplicate requests
    if (!text || isLoading) return;

    // Add user message to chat history
    const userMessage = {
      message: text,
      sender: 'user',
      id: crypto.randomUUID()
    };
    
    const withUser = [...chatMessages, userMessage];
    
    // Add typing indicator to show bot is thinking
    const withTyping = [...withUser, { 
      id: TYPING_ID, 
      sender: 'robot', 
      message: '', 
      isTyping: true 
    }];
    
    setChatMessages(withTyping);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      // Call the API with user message and system prompt
      const response = await getOllamaResponse(text, SYSTEM_PROMPT);
      
      // Replace typing indicator with actual bot response
      setChatMessages((prev) => [
        ...prev.filter((m) => m.id !== TYPING_ID),
        { 
          message: response, 
          sender: 'robot', 
          id: crypto.randomUUID(),
          isError: false
        }
      ]);
    } catch (err) {
      // Handle errors gracefully - show error message in chat
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      setChatMessages((prev) => [
        ...prev.filter((m) => m.id !== TYPING_ID),
        { 
          message: errorMessage, 
          sender: 'robot', 
          id: crypto.randomUUID(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Convert error objects into user-friendly messages
   */
  function getErrorMessage(err) {
    if (err.message.includes('Failed to fetch')) {
      return '❌ Backend is offline. Please check if the server is running at: https://chatbot-project-trgr.onrender.com';
    }
    if (err.message.includes('CORS')) {
      return '❌ CORS error: The server may not be properly configured.';
    }
    if (err.message.includes('timeout') || err.message.includes('Timeout')) {
      return '⏱️ Request timed out. The backend took too long to respond. Please try again.';
    }
    if (err.message.includes('ERR_')) {
      return `❌ Network error: ${err.message}. Check your internet connection.`;
    }
    return `❌ Error: ${err.message}`;
  }

  /**
   * Allow sending message with Enter key
   */
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !isLoading && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-input-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <div className="input-wrapper">
        <input
          placeholder="Send a message to Chatbot"
          size="30"
          onChange={saveInputText}
          onKeyDown={handleKeyDown}
          value={inputText}
          className="chat-input"
          disabled={isLoading}
          autoFocus
        />
        <button
          onClick={sendMessage}
          className="send-button"
          disabled={isLoading || !inputText.trim()}
          title={isLoading ? 'Waiting for response...' : 'Send message'}
        >
          {isLoading ? (
            <>
              <span className="spinner-small"></span>
              Sending...
            </>
          ) : (
            'Send'
          )}
        </button>
      </div>
      <p className="input-hint">Use system prompt: {SYSTEM_PROMPT.split('\n')[0]}...</p>
    </div>
  );
       } 