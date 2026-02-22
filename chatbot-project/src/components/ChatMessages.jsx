import { useRef, useEffect  } from 'react'
import { ChatMessage  } from './ChatMessage';
import './ChatMessages.css';

function ChatMessages({ chatMessages }) {
        const chatMessagesRef = useRef(null);

        useEffect(() => {
          const containerElem = chatMessagesRef.current;
          if (containerElem) {
            containerElem.scrollTop = containerElem.scrollHeight;
          }
        }, [chatMessages]);

        const isEmpty = chatMessages.length === 0;

        return (
          <div className="chat-messages-container" ref={chatMessagesRef}>
            {isEmpty ? (
              <div className="chat-welcome">
                <h2 className="chat-welcome-title">Start a new chat with Dolphin</h2>
                <p className="chat-welcome-subtitle">Send a message below to begin</p>
              </div>
            ) : (
              chatMessages.map((chatMessage) => (
                <ChatMessage
                  message={chatMessage.message}
                  sender={chatMessage.sender}
                  isTyping={chatMessage.isTyping}
                  key={chatMessage.id}
                />
              ))
            )}
          </div>
        );
      }
export default ChatMessages; 