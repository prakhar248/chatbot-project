import RobotProfileImage from '../assets/robot.png';
import UserProfileImage from '../assets/user.png' ;
import './ChatMessage.css';  

/**
 * ChatMessage Component
 * Displays individual chat messages with profile pictures
 * 
 * Props:
 *   - message: The text content of the message
 *   - sender: Either 'user' or 'robot'
 *   - isTyping: Boolean indicating if showing typing animation
 *   - isError: Boolean indicating if this is an error message
 */
export function ChatMessage({ message, sender, isTyping, isError }) {
  return (
    <div className={`${
      sender === 'user'
        ? 'chat-message-user'
        : isError
        ? 'chat-message-error'
        : 'chat-message-robot'
    }`}>
      {sender === 'robot' && (
        <img 
          src={RobotProfileImage} 
          className="chat-message-profile" 
          alt="Robot"
        />
      )}
      <div className={`chat-message-text ${isError ? 'error-text' : ''}`}>
        {isTyping ? (
          <span className="chat-typing-dots">
            <span>.</span><span>.</span><span>.</span>
          </span>
        ) : (
          message
        )}
      </div>
      {sender === 'user' && (
        <img 
          src={UserProfileImage} 
          className="chat-message-profile" 
          alt="User"
        />
      )}
    </div>
  );
}