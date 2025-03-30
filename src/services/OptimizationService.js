// src/services/OptimizationService.js
import { exportAppliancesToPython } from './ApplianceExporter';
import { hourlyData, optimizedSchedule } from '../utils/mockData';
import worseOptimizationSchedule from '../utils/worseOptimizationData';

/**
 * Simulates the full optimization process by combining export & import steps
 * 
 * In a real implementation, this would:
 * 1. Export data to a file
 * 2. Call the Python script via an API or WebSocket
 * 3. Wait for the optimization to complete
 * 4. Import the results
 * 
 * For this demo, we'll simulate this by returning mock optimization data
 */
export const runOptimization = async (appliances, userAppliances, solarEnabled, energySettings) => {
  try {
    // Prepare data in the format expected by the Python optimizer
    const exportData = {
      appliances: {},
      energy_profile: energySettings,
      timestamp: new Date().toISOString()
    };
    
    // Convert appliances to the format expected by Python
    const allAppliances = [...appliances, ...userAppliances];
    allAppliances.forEach(app => {
      const key = app.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
      
      exportData.appliances[key] = {
        id: app.id,
        name: app.name,
        power: app.power,
        flexible: app.flexible,
        run_duration: app.runDuration,
        current_hours: app.currentHours || [],
        preferred_hours: app.optimalHours || [],
        priority_level: app.priorityLevel || "medium",
        preferred_time_of_day: app.preferredTimeOfDay || ["Afternoon"]
      };
    });
    
    // Update energy profile settings
    exportData.energy_profile.solar_enabled = solarEnabled;
    
    console.log("Sending optimization request to server:", exportData);
    
    // Make API request to the Python backend
    const response = await fetch('http://localhost:5000/api/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Optimization failed');
    }
    
    const result = await response.json();
    console.log("Received optimization result:", result);
    
    return result.data;
  } catch (error) {
    console.error("Optimization error:", error);
    throw error;
  }
};

/**
 * Button component for one-click optimization
 */
export const OptimizeButton = ({ 
  onOptimize, // Change this to receive the handler directly
  isRunning = false
}) => {
  return (
    <button
      onClick={onOptimize} // Use the passed function
      className={`optimize-button ${isRunning ? 'optimizing' : ''}`}
      disabled={isRunning}
      title="Run Python optimization"
    >
      {isRunning ? (
        <>
          <div className="spinner"></div>
          <span>Optimizing...</span>
        </>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="optimize-icon"
          >
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Optimize</span>
        </>
      )}
    </button>
  );
};

export default {
  runOptimization,
  OptimizeButton
};