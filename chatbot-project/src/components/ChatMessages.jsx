import { useRef, useEffect, useState } from 'react'
import { ChatMessage } from './ChatMessage';
import './ChatMessages.css';

function ChatMessages({ chatMessages, isLoading }) {
  const chatMessagesRef = useRef(null);
  const [displayedMessages, setDisplayedMessages] = useState([]);

  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    const containerElem = chatMessagesRef.current;
    if (containerElem) {
      containerElem.scrollTop = containerElem.scrollHeight;
    }
  }, [displayedMessages, isLoading]);

  // Handle typing effect for bot messages
  // When a new bot message arrives, display it character by character
  useEffect(() => {
    setDisplayedMessages(chatMessages.map(msg => ({
      ...msg,
      displayedText: msg.sender === 'user' ? msg.message : msg.displayedText || msg.message
    })));
  }, [chatMessages]);

  const isEmpty = chatMessages.length === 0;

  return (
    <div className="chat-messages-container" ref={chatMessagesRef}>
      {isEmpty ? (
        <div className="chat-welcome">
          <h2 className="chat-welcome-title">Welcome to Dolphin Chat</h2>
          <p className="chat-welcome-subtitle">Send a message below to begin your conversation</p>
        </div>
      ) : (
        <>
          {displayedMessages.map((chatMessage) => (
            <ChatMessage
              message={chatMessage.displayedText || chatMessage.message}
              sender={chatMessage.sender}
              isTyping={chatMessage.isTyping}
              isError={chatMessage.isError}
              key={chatMessage.id}
            />
          ))}
          {isLoading && (
            <div className="chat-loading">
              <div className="chat-spinner"></div>
              <p>Thinking...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ChatMessages; 