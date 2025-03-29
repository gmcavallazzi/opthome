import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/UIComponents';
import ApplianceSchedule from '../dashboard/ApplianceSchedule';

/**
 * AppliancesTab component that displays appliance management and statistics
 */
const AppliancesTab = ({
  appliances,
  userAppliances,
  selectedAppliance,
  setSelectedAppliance,
  handleSetSpecificHours,
  setShowAddApplianceForm
}) => {
  return (
    <div className="appliances-tab">
      {/* Appliance Schedule */}
      <ApplianceSchedule
        appliances={appliances}
        userAppliances={userAppliances}
        selectedAppliance={selectedAppliance}
        setSelectedAppliance={setSelectedAppliance}
        handleSetSpecificHours={handleSetSpecificHours}
        setShowAddApplianceForm={setShowAddApplianceForm}
      />
      
      {/* Appliance Power Chart */}
      <Card className="chart-card">
        <CardHeader>
          <CardTitle>Appliance Energy Consumption</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={[...appliances, ...userAppliances]}
                margin={{ top: 20, right: 30, left: 50, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                />
                <YAxis 
                  label={{ value: 'Power (Watts)', angle: -90, position: 'insideLeft' }} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} W`, 'Power Consumption']}
                  labelFormatter={(label) => `Appliance: ${label}`}
                />
                <Bar 
                  dataKey="power" 
                  name="Power Consumption (W)" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="appliance-stats-summary">
            <h4>Appliance Usage Summary</h4>
            <div className="appliance-stats-details">
              <div className="appliance-stat-item">
                <span className="stat-label">Total Appliances:</span>
                <span className="stat-value">{appliances.length + userAppliances.length}</span>
              </div>
              <div className="appliance-stat-item">
                <span className="stat-label">Flexible Appliances:</span>
                <span className="stat-value">
                  {appliances.concat(userAppliances).filter(app => app.flexible).length}
                </span>
              </div>
              <div className="appliance-stat-item">
                <span className="stat-label">Fixed Schedule Appliances:</span>
                <span className="stat-value">
                  {appliances.concat(userAppliances).filter(app => !app.flexible).length}
                </span>
              </div>
              <div className="appliance-stat-item">
                <span className="stat-label">Maximum Power Device:</span>
                <span className="stat-value">
                  {appliances.concat(userAppliances).reduce((max, app) => 
                    app.power > max.power ? app : max
                  , {name: 'None', power: 0}).name} 
                  ({appliances.concat(userAppliances).reduce((max, app) => 
                    app.power > max.power ? app : max
                  , {name: 'None', power: 0}).power} W)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppliancesTab;