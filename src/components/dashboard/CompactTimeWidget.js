// src/components/dashboard/CompactTimeWidget.js
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

/**
 * A compact time widget that shows current time and energy status
 */
const CompactTimeWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setCurrentHour(now.getHours());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time as HH:MM
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Determine peak/off-peak status
  const isPeakHour = currentHour >= 17 && currentHour <= 21;

  return (
    <div className="compact-time-widget" style={{
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.375rem',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      maxWidth: 'fit-content',
      marginLeft: 'auto'
    }}>
      <Clock size={16} className="mr-2" style={{ marginRight: '0.5rem', color: '#6b7280' }} />
      
      <div style={{ marginRight: '0.75rem' }}>
        <span style={{ fontWeight: '600' }}>{formattedTime}</span>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.75rem',
        fontWeight: '500',
        color: isPeakHour ? '#ef4444' : '#10b981',
        backgroundColor: isPeakHour ? '#fee2e2' : '#d1fae5',
        padding: '0.125rem 0.5rem',
        borderRadius: '9999px'
      }}>
        {isPeakHour ? 'Peak' : 'Off-Peak'} 
        <span style={{ marginLeft: '0.25rem', fontWeight: '400' }}>
          €{isPeakHour ? '0.28' : '0.15'}
        </span>
      </div>
    </div>
  );
};

export default CompactTimeWidget;