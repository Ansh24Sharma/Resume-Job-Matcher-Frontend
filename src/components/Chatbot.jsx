import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../api/chatbot';
import styles from './Chatbot.module.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const data = await sendMessage(input);

      const botMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        model: data.model,
        usage: data.usage,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div 
        className={`${styles.floatingButton} ${isOpen ? styles.hidden : ''}`}
        onClick={toggleChat}
      >
        <span className={styles.floatingIcon}>🤖</span>
        <span className={styles.floatingBadge}>AI</span>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.botAvatar}>🤖</div>
                <div className={styles.headerInfo}>
                  <h2 className={styles.title}>AI Assistant</h2>
                  <span className={styles.status}>Online</span>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button 
                  className={styles.clearButton} 
                  onClick={clearChat}
                  title="Clear chat"
                >
                  🗑️
                </button>
                <button 
                  className={styles.closeButton} 
                  onClick={toggleChat}
                  title="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
              {messages.length === 0 && (
                <div className={styles.welcomeMessage}>
                  <div className={styles.welcomeIcon}>💬</div>
                  <h3>Welcome to AI Assistant</h3>
                  <p>How can I help you today?</p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`${styles.messageWrapper} ${
                    message.role === 'user' ? styles.userMessage : styles.botMessage
                  }`}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.messageAvatar}>
                      {message.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className={styles.messageBubble}>
                      <p className={styles.messageText}>{message.content}</p>
                      <span className={styles.messageTime}>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className={`${styles.messageWrapper} ${styles.botMessage}`}>
                  <div className={styles.messageContent}>
                    <div className={styles.messageAvatar}>🤖</div>
                    <div className={styles.messageBubble}>
                      <div className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className={styles.errorMessage}>
                  <span className={styles.errorIcon}>⚠️</span>
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className={styles.inputContainer} onSubmit={handleSendMessage}>
              <textarea
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows="1"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className={styles.sendButton}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;