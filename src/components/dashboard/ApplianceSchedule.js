import React from 'react';
import { Power } from 'lucide-react';
import { formatCurrency } from '../../utils/goodData';  // Fixed path with double dots
import { Card, CardHeader, CardTitle, CardContent } from '../ui/UIComponents';

/**
 * ApplianceSchedule component displays the list of appliances and their schedule
 */
const ApplianceSchedule = ({
  appliances,
  userAppliances,
  selectedAppliance,
  setSelectedAppliance,
  handleSetSpecificHours,
  setShowAddApplianceForm
}) => {
  // Combine both built-in and user appliances
  const allAppliances = [...appliances, ...userAppliances];
  
  return (
    <Card className="appliance-card">
      <CardHeader>
        <CardTitle><Power size={20} className="title-icon" /> Appliance Optimization</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="appliance-grid">
          <div className="appliance-list">
            <div className="appliance-header">
              <h3>Select Appliance</h3>
              <button 
                onClick={() => setShowAddApplianceForm(true)}
                className="add-button"
              >
                <svg className="add-icon" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                Add Appliance
              </button>
            </div>
            <div className="appliance-items">
              {allAppliances.map(appliance => (
                <div 
                  key={appliance.id}
                  className={`appliance-item ${selectedAppliance?.id === appliance.id ? 'selected-appliance' : ''}`}
                  onClick={() => setSelectedAppliance(appliance)}
                >
                  <div className="appliance-item-header">
                    <span className="appliance-name">
                      <span className="appliance-emoji">{appliance.emoji || '🔌'}</span>
                      {appliance.name}
                    </span>
                    <span className="appliance-power">{appliance.power}W</span>
                  </div>
                  <div className="appliance-flexibility">
                    {appliance.flexible ? "Flexible scheduling" : "Fixed schedule"}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedAppliance ? (
            <div className="appliance-detail">
              <h3 className="appliance-detail-title">
                <span className="appliance-emoji">{selectedAppliance.emoji || '🔌'}</span>
                {selectedAppliance.name} Schedule
              </h3>
              <div className="schedule-section">
                <div className="schedule-label">Current Schedule (Higher Cost):</div>
                <div className="hours-grid">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`hour-cell ${selectedAppliance.currentHours.includes(i) ? 'current-hour' : ''}`}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>
              <div className="schedule-section">
                <div className="schedule-label">Recommended Schedule (Savings):</div>
                <div className="hours-grid">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`hour-cell ${selectedAppliance.optimalHours.includes(i) ? 'optimal-hour' : ''}`}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="recommendation">
                <p className="recommendation-title">Recommendation:</p>
                <p className="recommendation-text">
                  {selectedAppliance.flexible 
                    ? `Run your ${selectedAppliance.name.toLowerCase()} during hours ${selectedAppliance.optimalHours.join(', ')} instead of ${selectedAppliance.currentHours.join(', ')} to save money.`
                    : `Your ${selectedAppliance.name.toLowerCase()} runs continuously and cannot be rescheduled.`
                  }
                </p>
                {selectedAppliance.flexible && (
                  <div className="savings-estimate">
                    Estimated daily savings: {formatCurrency((selectedAppliance.power / 1000) * selectedAppliance.runDuration * (0.35 - 0.10))}
                  </div>
                )}
                
                {selectedAppliance.flexible && (
                  <button 
                    className="set-hours-button"
                    onClick={() => handleSetSpecificHours(selectedAppliance.id)}
                  >
                    Customize Hours
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="appliance-placeholder">
              Select an appliance to view optimization options
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplianceSchedule;