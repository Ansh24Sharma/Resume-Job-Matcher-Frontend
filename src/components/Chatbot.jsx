import React, { useState, useRef, useEffect } from 'react';
import { sendMessage, createChatContext } from '../api/chatbot';
import { getUserData } from '../utils/storage';
import ChatMessage from '../assets/ChatMessage';
import styles from './Chatbot.module.css';

const Chatbot = ({ resumeData = null, jobsData = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const userData = getUserData();

  // Enhanced system prompt
  const SYSTEM_PROMPT = `You are an expert AI Career Assistant for a Resume-Job Matcher platform.

CRITICAL FORMATTING RULES - YOU MUST FOLLOW THESE EXACTLY:

1. When listing jobs, ALWAYS use this exact format for EACH job:

### [Number]. **[Job Title]** at [Company Name]
- **Location:** [Location]
- **Required Skills:** [Skills list]
- **Experience:** [Years]
- **Salary:** [Range if available]

2. ALWAYS add a blank line between each job listing
3. Use ### for job headers
4. Use **bold** for job titles and field labels
5. Use bullet points (-) for job details
6. Keep descriptions concise

EXAMPLE FORMAT YOU MUST FOLLOW:

### 1. **Software Engineer** at Tech Corp
- **Location:** Remote
- **Required Skills:** Java, Python, React
- **Experience:** 2-3 years
- **Salary:** $80k-$100k

### 2. **Backend Developer** at StartupXYZ
- **Location:** New York, NY
- **Required Skills:** Node.js, MongoDB, AWS
- **Experience:** 3-5 years
- **Salary:** Not disclosed


IMPORTANT GUIDELINES:
- Always reference the user's actual skills and experience from their profile
- Mention specific job titles and companies from available listings
- Be specific with numbers (e.g., "You have 3 years of experience in...")
- Provide actionable, practical advice
- Be encouraging but realistic
- Keep responses conversational and easy to understand
- If user data is available, personalize every response
- When presenting jobs, DO NOT categorize or mention different job types. Simply present all jobs as "Available Positions" or "Job Openings".

YOUR ROLE:
- Present ALL available job openings when asked
- Analyze user's profile against job requirements
- Recommend suitable positions based on skills match
- Provide career guidance and growth strategies
- Suggest skills to learn for better matches

RESPONSE STYLE:
- Use bullet points for lists
- Keep paragraphs short (2-3 sentences)
- Use emojis sparingly for visual appeal
- End with a follow-up question when appropriate

Always use the user's actual data from the context when available.`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
  // Enhanced welcome message with user context
  if (isOpen && messages.length === 0) {
    let welcomeContent = `Hi ${userData?.username || 'there'}! 👋 I'm your Resume-Job Matcher AI assistant.\n\n`;
    
    // Add personalized info if resume data is available
    if (resumeData) {
      if (resumeData.skills) {
        const skillsArray = Array.isArray(resumeData.skills) 
          ? resumeData.skills 
          : resumeData.skills.split(',').map(s => s.trim());
        welcomeContent += `I see you have skills in ${skillsArray.slice(0, 3).join(', ')}${skillsArray.length > 3 ? '...' : ''}. `;
      }
      if (resumeData.current_position) {
        welcomeContent += `Currently working as ${resumeData.current_position}. `;
      }
      welcomeContent += '\n\n';
    }
    
    // Count total jobs from nested structure
    let totalJobsCount = 0;
    if (jobsData) {
      if (Array.isArray(jobsData)) {
        jobsData.forEach(item => {
          if (item.jobs) totalJobsCount += item.jobs.length;
          if (item.posted_jobs) totalJobsCount += item.posted_jobs.length;
        });
      } else if (typeof jobsData === 'object') {
        if (jobsData.jobs) totalJobsCount += jobsData.jobs.length;
        if (jobsData.posted_jobs) totalJobsCount += jobsData.posted_jobs.length;
      }
    }
    
    // Add jobs info
    if (totalJobsCount > 0) {
      welcomeContent += `We have ${totalJobsCount} job opening${totalJobsCount !== 1 ? 's' : ''} available for you!\n\n`;
    }
    
    welcomeContent += `I can help you with:
- Finding jobs that match your profile
- Resume and career advice
- Skill gap analysis
- Interview preparation
- Career growth strategies

What would you like to know?`;

    const welcomeMsg = {
      role: 'assistant',
      content: welcomeContent,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
  }
}, [isOpen, resumeData, jobsData]);

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
      // Create context with actual API data
      const context = createChatContext(userData, resumeData, jobsData);
      
      console.log('Sending context to AI:', context); // Debug log

      const data = await sendMessage(input, SYSTEM_PROMPT, context);

      const botMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        model: data.model,
        usage: data.usage,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to send message';
      setError(errorMsg);
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

  // Smart quick action buttons based on user data
  const getQuickActions = () => {
  const actions = [];
  
  if (jobsData) {
    actions.push({ 
      label: '💼 List All Jobs', 
      query: 'Please list all available jobs in the system with their details' 
    });
    
    actions.push({ 
      label: '🎯 Top Matches', 
      query: 'What are the top 5 jobs that best match my skills and experience? Explain why each is a good match.' 
    });
  }
  
  if (resumeData && resumeData.skills) {
    actions.push({ 
      label: '📊 Skill Analysis', 
      query: 'Analyze my current skills and identify any gaps. Suggest skills I should learn to improve my job prospects.' 
    });
  }
  
  actions.push({ 
    label: '📄 Resume Tips', 
    query: 'Give me 5 specific tips to improve my resume and make it more attractive to employers.' 
  });
  
  return actions;
};

  const quickActions = getQuickActions();

  const handleQuickAction = (query) => {
    setInput(query);
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
                  <h2 className={styles.title}>Career Assistant</h2>
                  <span className={styles.status}>
                    {resumeData && jobsData ? 'Ready with your data' : 'Online'}
                  </span>
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
                      {/* Use ChatMessage component for bot messages */}
                      {message.role === 'assistant' ? (
                        <ChatMessage message={message} />
                      ) : (
                        <p className={styles.messageText}>{message.content}</p>
                      )}
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

              {/* Quick Actions */}
              {messages.length === 1 && !isLoading && quickActions.length > 0 && (
                <div className={styles.quickActions}>
                  <p className={styles.quickActionsTitle}>Try asking:</p>
                  <div className={styles.quickActionsGrid}>
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        className={styles.quickActionButton}
                        onClick={() => handleQuickAction(action.query)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
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
                placeholder="Ask about jobs, skills, or career advice..."
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