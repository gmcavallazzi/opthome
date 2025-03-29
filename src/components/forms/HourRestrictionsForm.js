// src/components/forms/HourRestrictionsForm.js
import React, { useEffect } from 'react';

/**
 * Enhanced form for setting specific hours for an appliance
 */
const HourRestrictionsForm = ({ 
  editingAppliance, 
  selectedHours, 
  setSelectedHours, 
  onSave, 
  onClose 
}) => {
  // Make sure we have the latest optimal hours when the form opens
  useEffect(() => {
    if (editingAppliance && editingAppliance.optimalHours) {
      setSelectedHours([...editingAppliance.optimalHours]);
    }
  }, [editingAppliance, setSelectedHours]);

  // Toggle selection of an hour
  const toggleHour = (hour) => {
    if (selectedHours.includes(hour)) {
      setSelectedHours(selectedHours.filter(h => h !== hour));
    } else {
      // Add the hour and sort the array
      setSelectedHours([...selectedHours, hour].sort((a, b) => a - b));
    }
  };

  if (!editingAppliance) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Set Hours for {editingAppliance.name}</h3>
          <button 
            onClick={onClose}
            className="close-button"
          >
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          <div className="form-group">
            <label>Select preferred hours to run this appliance:</label>
            <div className="hours-selection">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="hour-item">
                  <div 
                    className={`hour-circle ${
                      selectedHours.includes(i) 
                        ? 'hour-selected' 
                        : ''
                    }`}
                    onClick={() => toggleHour(i)}
                  >
                    {i}
                  </div>
                  <div className="hour-label">{i}:00</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="selected-times">
            <div className="selected-times-label">Selected times:</div>
            <div className="selected-times-content">
              {selectedHours.length > 0 
                ? selectedHours.sort((a, b) => a - b).map(hour => `${hour}:00`).join(', ')
                : 'No hours selected'
              }
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="button button-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="button button-primary"
            >
              Save Hours
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HourRestrictionsForm;