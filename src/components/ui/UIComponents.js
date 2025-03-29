import React from 'react';

/**
 * Card component for consistent UI styling
 */
export const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>{children}</div>
);

/**
 * Card header component
 */
export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

/**
 * Card title component
 */
export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`card-title ${className}`}>{children}</h3>
);

/**
 * Card content component
 */
export const CardContent = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>{children}</div>
);

/**
 * Toggle button component
 */
export const Toggle = ({ enabled, onChange, icon, label }) => (
  <div className="toggle-container">
    {label && <span className="toggle-label">{label}</span>}
    <button 
      onClick={onChange}
      className={`toggle-button ${enabled ? 'toggle-on' : 'toggle-off'}`}
    >
      <span className="toggle-slider"></span>
      {icon && (
        <span className={`toggle-icon ${!enabled ? 'toggle-icon-off' : ''}`}>
          {icon}
        </span>
      )}
    </button>
  </div>
);

// Export all components as named exports
export default {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Toggle
};