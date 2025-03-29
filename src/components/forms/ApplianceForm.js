import React from 'react';

/**
 * Form for adding new appliances
 */
const ApplianceForm = ({ 
  newApplianceData, 
  handleInputChange, 
  handleAddAppliance, 
  onClose 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Add New Appliance</h3>
          <button 
            onClick={onClose}
            className="close-button"
          >
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          <div className="form-group">
            <label>Appliance Name</label>
            <input
              type="text"
              name="name"
              value={newApplianceData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. Pool Pump"
            />
          </div>
          
          <div className="form-group">
            <label>Power Consumption (Watts)</label>
            <input
              type="number"
              name="power"
              value={newApplianceData.power}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. 1500"
              min="1"
            />
          </div>
          
          <div className="form-group">
            <label>Run Duration (Hours)</label>
            <input
              type="number"
              name="runDuration"
              value={newApplianceData.runDuration}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. 2"
              min="0.5"
              step="0.5"
            />
          </div>
          
          <div className="form-checkbox">
            <input
              type="checkbox"
              name="flexible"
              checked={newApplianceData.flexible}
              onChange={handleInputChange}
              className="checkbox-input"
            />
            <label>
              Flexible scheduling (can run at different times)
            </label>
          </div>
          
          <div className="form-group">
            <label>Current Run Time</label>
            <select 
              className="form-select"
              onChange={(e) => handleInputChange({
                target: {
                  name: 'currentHours',
                  value: [parseInt(e.target.value)]
                }
              })}
            >
              {[...Array(24)].map((_, i) => (
                <option key={i} value={i}>{i}:00 - {i+1}:00</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Preferred Time of Day</label>
            <div className="checkbox-group">
              {['Morning', 'Afternoon', 'Evening', 'Night'].map(timeOfDay => (
                <label key={timeOfDay} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    className="checkbox-input" 
                    checked={newApplianceData.preferredTimeOfDay.includes(timeOfDay)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange({
                          target: {
                            name: 'preferredTimeOfDay',
                            value: [...newApplianceData.preferredTimeOfDay, timeOfDay]
                          }
                        });
                      } else {
                        handleInputChange({
                          target: {
                            name: 'preferredTimeOfDay',
                            value: newApplianceData.preferredTimeOfDay.filter(t => t !== timeOfDay)
                          }
                        });
                      }
                    }}
                  />
                  <span>{timeOfDay}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Priority Level</label>
            <select 
              className="form-select"
              name="priorityLevel"
              value={newApplianceData.priorityLevel}
              onChange={handleInputChange}
            >
              <option value="low">Low - Run at cheapest time only</option>
              <option value="medium">Medium - Balance cost and convenience</option>
              <option value="high">High - Run at preferred time when possible</option>
            </select>
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
              onClick={handleAddAppliance}
              className="button button-primary"
            >
              Add Appliance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplianceForm;