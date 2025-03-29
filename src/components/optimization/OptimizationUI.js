// src/components/optimization/OptimizationUI.js
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/goodData';

/**
 * Progress bar that appears at the top of the screen during optimization
 */
export const OptimizationProgress = ({ isRunning, progress = 0 }) => {
  const [fakeProgress, setFakeProgress] = useState(0);
  
  // Simulate progress when running
  useEffect(() => {
    if (isRunning) {
      setFakeProgress(0);
      const interval = setInterval(() => {
        setFakeProgress(prev => {
          // Slow down progress as it gets higher
          const increment = (100 - prev) / 10;
          return Math.min(prev + (increment > 0.5 ? increment : 0.5), 95);
        });
      }, 200);
      
      return () => clearInterval(interval);
    } else {
      // When complete, quickly go to 100%
      setFakeProgress(100);
    }
  }, [isRunning]);
  
  if (!isRunning && fakeProgress !== 100) return null;
  
  return (
    <div className="optimization-progress">
      <div 
        className="optimization-progress-bar" 
        style={{ width: `${fakeProgress}%` }}
      />
    </div>
  );
};

/**
 * Success notification that appears after optimization completes
 */
export const OptimizationSuccess = ({ result, onClose }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  if (!visible || !result) return null;
  
  const { savings } = result;
  
  return (
    <div className="optimization-success">
      <div className="success-icon">✓</div>
      <div>
        <div className="success-title">Optimization Complete!</div>
        <div className="success-message">
          Estimated daily savings: {formatCurrency(savings.daily)} 
          ({formatCurrency(savings.monthly)}/month)
        </div>
      </div>
      <button 
        className="close-notification" 
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
      >
        ×
      </button>
    </div>
  );
};

export default {
  OptimizationProgress,
  OptimizationSuccess
};