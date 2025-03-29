import React from 'react';
import { Battery, Sun, Zap, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/goodData';  // Fixed path with double dots

/**
 * StatsGrid component displays key metrics in a grid layout
 */
const StatsGrid = ({ currentData, solarEnabled, savingsAmount, savingsPercentage }) => {
  const currentHour = new Date().getHours();
  
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-content">
          <div>
            <p className="stat-label">Today's Estimated Savings</p>
            <p className="stat-value savings-value">{formatCurrency(savingsAmount)}</p>
          </div>
          <div className="stat-icon savings-icon">
            <DollarSign />
          </div>
        </div>
        <p className="stat-details">
          You're saving {savingsPercentage}% compared to standard usage
        </p>
      </div>
      
      <div className="stat-card">
        <div className="stat-content">
          <div>
            <p className="stat-label">Current Grid Price</p>
            <p className="stat-value grid-value">{formatCurrency(currentData[currentHour].gridCost)}/kWh</p>
          </div>
          <div className="stat-icon grid-icon">
            <Zap />
          </div>
        </div>
        <p className="stat-details">
          {currentData[currentHour].gridCost > 0.20 
            ? "High price period - limit grid usage" 
            : "Low price period - good time for high consumption"}
        </p>
      </div>
      
      {solarEnabled && (
        <div className="stat-card">
          <div className="stat-content">
            <div>
              <p className="stat-label">Solar Production</p>
              <p className="stat-value solar-value">
                {currentData[currentHour].solarProduction.toFixed(1)} kW
              </p>
            </div>
            <div className="stat-icon solar-icon">
              <Sun />
            </div>
          </div>
          <p className="stat-details">
            {currentData[currentHour].solarProduction > 1 
              ? "Good solar production - run appliances now" 
              : "Low solar production"}
          </p>
        </div>
      )}
      
      <div className="stat-card">
        <div className="stat-content">
          <div>
            <p className="stat-label">Battery Status</p>
            <p className="stat-value battery-value">
              {currentData[currentHour].batteryCharge}%
            </p>
          </div>
          <div className="stat-icon battery-icon">
            <Battery />
          </div>
        </div>
        <p className="stat-details">
          {currentData[currentHour].batteryCharge > 80 
            ? "Battery well charged - can use during peak prices" 
            : "Battery charging - preserving for later use"}
        </p>
      </div>
    </div>
  );
};

export default StatsGrid;