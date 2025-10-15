import React, { useEffect } from 'react';
import styles from './Notification.module.css';

export const Notification = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`${styles.container} ${styles[type]}`}>
      <span className={styles.icon}>
        {type === 'success' ? '✓' : '✕'}
      </span>
      <div className={styles.content}>{message}</div>
      {onClose && (
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
};