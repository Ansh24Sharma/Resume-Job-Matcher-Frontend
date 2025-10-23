import React from 'react';
import styles from './ChatMessage.module.css';

const ChatMessage = ({ message }) => {
  const formatMessage = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    const formattedContent = [];
    let inList = false;
    let listItems = [];
    let currentSection = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle headers (###, ##, #)
      if (/^#{1,3}\s/.test(trimmedLine)) {
        // Flush any pending lists
        if (inList && listItems.length > 0) {
          formattedContent.push(
            <ul key={`list-${index}`} className={styles.messageList}>
              {listItems.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        
        const level = trimmedLine.match(/^#{1,3}/)[0].length;
        let text = trimmedLine.replace(/^#{1,3}\s/, '');
        
        // Handle bold within headers
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        formattedContent.push(
          <h4 
            key={index} 
            className={styles[`heading${level}`]}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      }
      // Handle bullet points (-, *, •)
      else if (/^[-\*•]\s/.test(trimmedLine)) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        let item = trimmedLine.replace(/^[-\*•]\s/, '');
        // Handle bold in list items
        item = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        listItems.push(item);
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(trimmedLine)) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        let item = trimmedLine.replace(/^\d+\.\s/, '');
        item = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        listItems.push(item);
      }
      // Regular text
      else if (trimmedLine) {
        // Flush any pending lists
        if (inList && listItems.length > 0) {
          formattedContent.push(
            <ul key={`list-${index}`} className={styles.messageList}>
              {listItems.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        
        // Handle bold text
        let text = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        formattedContent.push(
          <p 
            key={index} 
            className={styles.messageParagraph}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      }
      // Empty line - flush lists
      else if (!trimmedLine && inList && listItems.length > 0) {
        formattedContent.push(
          <ul key={`list-${index}`} className={styles.messageList}>
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
        inList = false;
        listItems = [];
      }
    });

    // Flush any remaining list items
    if (inList && listItems.length > 0) {
      formattedContent.push(
        <ul key="final-list" className={styles.messageList}>
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
    }

    return formattedContent;
  };

  return (
    <div className={styles.formattedMessage}>
      {formatMessage(message.content)}
    </div>
  );
};

export default ChatMessage;