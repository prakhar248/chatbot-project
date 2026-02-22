import { useState, useEffect } from 'react'
import { ChatInput } from './components/ChatInput'
import ChatMessages from './components/ChatMessages'
import './App.css'

// Key used for storing chat history in localStorage
const CHAT_STORAGE_KEY = 'chatbot_history';

function App() {
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedMessages) {
      try {
        setChatMessages(JSON.parse(savedMessages));
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Function to clear all chat history
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setChatMessages([]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Chat with Dolphin</h1>
        {chatMessages.length > 0 && (
          <button onClick={handleClearChat} className="clear-btn">
            Clear Chat
          </button>
        )}
      </div>
      <ChatMessages 
        chatMessages={chatMessages} 
        isLoading={isLoading}
      />
      <ChatInput
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}

export default App
