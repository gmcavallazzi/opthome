import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/UIComponents';

/**
 * SettingsTab component for configuring user preferences
 */
const SettingsTab = ({ 
  appliances, 
  userAppliances,
  handleSetSpecificHours,
  energySettings
}) => {
  // State for settings
  const [batteryReserve, setBatteryReserve] = useState(energySettings.batteryMinReserve);
  const [householdType, setHouseholdType] = useState(energySettings.householdType);
  const [optimizationStrategy, setOptimizationStrategy] = useState(energySettings.optimizationStrategy);
  const [batteryStrategy, setBatteryStrategy] = useState(energySettings.batteryStrategy);
  
  return (
    <Card className="settings-card">
      <CardHeader>
        <CardTitle>Settings & Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="settings-description">Configure your energy optimization preferences</p>
        
        {/* Appliance Preferences Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">Appliance Preferences</h3>
          <p className="settings-section-description">Set preferred operating times for your appliances</p>
          
          <div className="appliance-preferences">
            {[...appliances, ...userAppliances].filter(a => a.flexible).map(appliance => (
              <div key={appliance.id} className="appliance-preference-item">
                <div className="appliance-preference-header">
                  <h4 className="appliance-preference-name">
                    <span className="appliance-emoji">{appliance.emoji || '🔌'}</span>
                    {appliance.name}
                  </h4>
                  <span className="flexible-tag">Flexible</span>
                </div>
                
                <div className="time-preference">
                  <label className="time-preference-label">Preferred Operating Hours</label>
                  <div className="time-preference-options">
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map(timeOfDay => (
                      <label key={timeOfDay} className="time-preference-option">
                        <input 
                          type="checkbox" 
                          className="time-checkbox" 
                          defaultChecked={timeOfDay === 'Afternoon'} 
                        />
                        <span className="time-label">{timeOfDay}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Display specific hours if set */}
                  {appliance.optimalHours && appliance.optimalHours.length > 0 && (
                    <div className="specific-hours">
                      <span className="specific-hours-label">Specific hours: </span>
                      <span className="specific-hours-value">
                        {appliance.optimalHours.sort((a, b) => a - b).map(h => `${h}:00`).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="priority-setting">
                  <label className="priority-label">Priority Level</label>
                  <select className="priority-select" defaultValue="medium">
                    <option value="low">Low - Run at cheapest time only</option>
                    <option value="medium">Medium - Balance cost and convenience</option>
                    <option value="high">High - Run at preferred time when possible</option>
                  </select>
                </div>
                
                <div 
                  className="set-hours-link"
                  onClick={() => handleSetSpecificHours(appliance.id)}
                >
                  + Set specific hour restrictions
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Energy Profiles Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">Energy Profiles</h3>
          <p className="settings-section-description">Choose your consumption profile and optimization priority</p>
          
          <div className="household-type">
            <label className="setting-label">Household Type</label>
            <select 
              className="setting-select"
              value={householdType}
              onChange={(e) => setHouseholdType(e.target.value)}
            >
              <option value="working_family">Working Family (Away 9-5)</option>
              <option value="work_from_home">Work From Home</option>
              <option value="family_with_children">Family with Children</option>
              <option value="retired">Retired</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div className="energy-profiles">
            <div 
              className={`energy-profile ${optimizationStrategy === 'cost_savings' ? 'selected-profile' : ''}`}
              onClick={() => setOptimizationStrategy('cost_savings')}
            >
              <div className="profile-header">
                <div className="profile-radio">
                  {optimizationStrategy === 'cost_savings' && <div className="radio-dot"></div>}
                </div>
                <span className="profile-name">Maximize Cost Savings</span>
                <span className="profile-value">-32%</span>
              </div>
              <p className="profile-description">Prioritize running appliances during lowest-cost periods</p>
            </div>
            
            <div 
              className={`energy-profile ${optimizationStrategy === 'green_energy' ? 'selected-profile' : ''}`}
              onClick={() => setOptimizationStrategy('green_energy')}
            >
              <div className="profile-header">
                <div className="profile-radio">
                  {optimizationStrategy === 'green_energy' && <div className="radio-dot"></div>}
                </div>
                <span className="profile-name">Maximize Green Energy</span>
                <span className="profile-value green-value">-24%</span>
              </div>
              <p className="profile-description">Optimize for solar production and renewable energy</p>
            </div>
            
            <div 
              className={`energy-profile ${optimizationStrategy === 'balanced' ? 'selected-profile' : ''}`}
              onClick={() => setOptimizationStrategy('balanced')}
            >
              <div className="profile-header">
                <div className="profile-radio">
                  {optimizationStrategy === 'balanced' && <div className="radio-dot"></div>}
                </div>
                <span className="profile-name">Balanced Approach</span>
                <span className="profile-value">-27%</span>
              </div>
              <p className="profile-description">Balance between cost, comfort and green energy</p>
            </div>
            
            <div 
              className={`energy-profile ${optimizationStrategy === 'comfort' ? 'selected-profile' : ''}`}
              onClick={() => setOptimizationStrategy('comfort')}
            >
              <div className="profile-header">
                <div className="profile-radio">
                  {optimizationStrategy === 'comfort' && <div className="radio-dot"></div>}
                </div>
                <span className="profile-name">Comfort First</span>
                <span className="profile-value">-18%</span>
              </div>
              <p className="profile-description">Prioritize convenience with moderate savings</p>
            </div>
          </div>
          
          <div className="profile-impact">
            <div className="impact-header">
              <div className="impact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="impact-title">Profile Impact</span>
            </div>
            <p className="impact-description">Changing your profile affects how the system prioritizes cost savings versus convenience. Your current profile could save you approximately €84.30 per month.</p>
          </div>
        </div>
        
        {/* Battery Settings Section */}
        <div className="settings-section">
          <h3 className="settings-section-title">Battery Settings</h3>
          <p className="settings-section-description">Configure your battery usage strategy</p>
          
          <div className="battery-reserve">
            <label className="setting-label">Minimum Battery Reserve</label>
            <div className="range-container">
              <input
                type="range"
                className="range-slider"
                min="0"
                max="50"
                step="5"
                value={batteryReserve}
                onChange={(e) => setBatteryReserve(parseInt(e.target.value))}
              />
              <div className="range-labels">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
                <span>30%</span>
                <span>40%</span>
                <span>50%</span>
              </div>
            </div>
            <div className="range-value">{batteryReserve}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;