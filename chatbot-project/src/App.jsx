import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { ChatInput } from './components/ChatInput'
import ChatMessages from './components/ChatMessages'
import './App.css'

function App() {
  const [chatMessages, setChatMessages] = useState([]);

  function handleNewChat() {
    setChatMessages([]);
  }

  return (
    <div className="app-layout">
      <Sidebar onNewChat={handleNewChat} />
      <div className="app-main">
        <ChatMessages chatMessages={chatMessages} />
        <ChatInput
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
        />
      </div>
    </div>
  );
}

export default App
