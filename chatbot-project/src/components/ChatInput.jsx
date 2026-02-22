 import { useState  } from 'react'
 import { getOllamaResponse } from '../services/ollama';
 import './ChatInput.css';
 
const TYPING_ID = 'typing';

export function ChatInput({ chatMessages, setChatMessages }) {
         const [inputText, setInputText] = useState('');
         const [isLoading, setIsLoading] = useState(false);

         function saveInputText(event) {
           setInputText(event.target.value);
         }

         async function sendMessage() {
           const text = inputText.trim();
           if (!text || isLoading) return;

           const userMessage = {
             message: text,
             sender: 'user',
             id: crypto.randomUUID()
           };
           const withUser = [...chatMessages, userMessage];
           const withTyping = [...withUser, { id: TYPING_ID, sender: 'robot', message: '', isTyping: true }];
           setChatMessages(withTyping);
           setInputText('');
           setIsLoading(true);

           try {
             const response = await getOllamaResponse(text);
             setChatMessages((prev) => [
               ...prev.filter((m) => m.id !== TYPING_ID),
               { message: response, sender: 'robot', id: crypto.randomUUID() }
             ]);
           } catch (err) {
             setChatMessages((prev) => [
               ...prev.filter((m) => m.id !== TYPING_ID),
               { message: `Error: ${err.message}`, sender: 'robot', id: crypto.randomUUID() }
             ]);
           } finally {
             setIsLoading(false);
           }
         }
 
         return (
           <div className="chat-input-container">
             <input
               placeholder="Send a message to Chatbot"
               size="30"
               onChange={saveInputText}
               onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
               value={inputText}
               className="chat-input"
               disabled={isLoading}
             />
             <button
               onClick={sendMessage}
               className="send-button"
               disabled={isLoading}
             >
               {isLoading ? '...' : 'Send'}
             </button>
           </div>
         );
       } 