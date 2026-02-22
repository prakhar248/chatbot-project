import './Sidebar.css';

export function Sidebar({ onNewChat }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">Dolphin Chat</span>
      </div>
      <button type="button" className="sidebar-new-chat" onClick={onNewChat}>
        + New chat
      </button>
      <div className="sidebar-footer">
        <span className="sidebar-footer-text">Powered by Ollama</span>
      </div>
    </aside>
  );
}
