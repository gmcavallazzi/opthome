import React from 'react';
import { Sun } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/UIComponents';
import StatsGrid from '../dashboard/StatsGrid';
import EnergyCharts from '../EnergyCharts';
import OptimizationResults from '../OptimizationResults';
import ApplianceSchedule from '../dashboard/ApplianceSchedule';

/**
 * Dashboard Tab component that displays the main dashboard view
 */
const DashboardTab = ({
  currentData,
  solarEnabled,
  optimizedSchedule,
  savingsAmount,
  savingsPercentage,
  totalStandardCost,
  appliances,
  userAppliances,
  selectedAppliance,
  setSelectedAppliance,
  handleSetSpecificHours,
  setShowAddApplianceForm
}) => {
  return (
    <div className="dashboard-tab">
      {/* Stats Grid */}
      <StatsGrid 
        currentData={currentData} 
        solarEnabled={solarEnabled} 
        savingsAmount={savingsAmount} 
        savingsPercentage={savingsPercentage} 
      />
      
      {/* Energy Charts */}
      <EnergyCharts 
        currentData={currentData} 
        solarEnabled={solarEnabled}
        optimizedSchedule={optimizedSchedule}
        totalStandardCost={totalStandardCost}
      />
      
      {/* Appliance Schedule */}
      <ApplianceSchedule
        appliances={appliances}
        userAppliances={userAppliances}
        selectedAppliance={selectedAppliance}
        setSelectedAppliance={setSelectedAppliance}
        handleSetSpecificHours={handleSetSpecificHours}
        setShowAddApplianceForm={setShowAddApplianceForm}
      />

      {/* Optimization Results */}
      <OptimizationResults optimizedSchedule={optimizedSchedule} />
      
      {/* Daily Plan */}
      <Card className="plan-card">
        <CardHeader>
          <CardTitle>
            <Sun size={20} className="title-icon" /> 
            Today's Optimization Plan 
            <span className="title-emoji" role="img" aria-label="plan">📅</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="plan-section">
            <h3 className="plan-title">Morning (6:00 - 12:00) ☀️</h3>
            <ul className="plan-list">
              <li className="plan-item plan-done">
                <span className="plan-checkmark">✓</span>
                Run washing machine at 9:00-10:00 during solar production peak
              </li>
              <li className="plan-item plan-done">
                <span className="plan-checkmark">✓</span>
                Water heater scheduled for 10:00-12:00 to use solar power
              </li>
            </ul>
          </div>
          
          <div className="plan-section">
            <h3 className="plan-title">Afternoon (12:00 - 18:00) 🌤️</h3>
            <ul className="plan-list">
              <li className="plan-item plan-done">
                <span className="plan-checkmark">✓</span>
                Run dryer at 13:00-14:00 during solar production
              </li>
              <li className="plan-item plan-done">
                <span className="plan-checkmark">✓</span>
                Charge battery with excess solar production
              </li>
            </ul>
          </div>
          
          <div className="plan-section">
            <h3 className="plan-title">Evening (18:00 - 00:00) 🌙</h3>
            <ul className="plan-list">
              <li className="plan-item plan-done">
                <span className="plan-checkmark">✓</span>
                Use battery power during peak price hours (18:00-21:00)
              </li>
              <li className="plan-item plan-cancel">
                <span className="plan-x">✗</span>
                Avoid running dishwasher, EV charging during peak hours
              </li>
              <li className="plan-item plan-done">
                <span className="plan-checkmark">✓</span>
                Schedule dishwasher and EV charging after 22:00 when prices drop
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;