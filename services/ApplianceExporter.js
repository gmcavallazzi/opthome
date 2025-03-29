import React, { useEffect } from 'react';

/**
 * Converts appliance data from React format to Python-compatible format
 * and exports it as a JSON file.
 * 
 * @param {Array} appliances - System appliances array
 * @param {Array} userAppliances - User-added appliances array
 * @param {boolean} solarEnabled - Whether solar panels are enabled
 * @param {Object} energySettings - Additional energy profile settings
 * @returns {Object} The formatted dictionary for Python
 */
export const exportAppliancesToPython = (appliances, userAppliances, solarEnabled, energySettings = {}) => {
  try {
    const allAppliances = [...appliances, ...userAppliances];
    const appliancesDict = {};
    
    // Convert each appliance to Python-friendly format
    allAppliances.forEach(app => {
      const key = app.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
      
      appliancesDict[key] = {
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
    
    // Create additional data for the optimizer
    const energyProfile = {
      optimization_strategy: energySettings.optimizationStrategy || "cost_savings",
      household_type: energySettings.householdType || "custom",
      battery_settings: {
        min_reserve: energySettings.batteryMinReserve || 30,
        strategy: energySettings.batteryStrategy || "peak_price"
      },
      solar_enabled: solarEnabled
    };
    
    // Create the complete export object
    const exportData = {
      appliances: appliancesDict,
      energy_profile: energyProfile,
      timestamp: new Date().toISOString()
    };
    
    // Convert to JSON and save file
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a hidden download link and trigger it
    const link = document.createElement('a');
    link.href = url;
    link.download = 'appliances_data.json';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
    
    console.log("Appliances data exported successfully");
    return exportData;
    
  } catch (error) {
    console.error("Error exporting appliances data:", error);
    return null;
  }
};

export const importOptimizedSchedule = async () => {
  try {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    
    // Handle file selection
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = JSON.parse(e.target.result);
        // Return the parsed data to the caller
        if (window.onScheduleImported && typeof window.onScheduleImported === 'function') {
          window.onScheduleImported(result);
        }
      };
      reader.readAsText(file);
    };
    
    // Trigger the file input click
    fileInput.click();
  } catch (error) {
    console.error("Error importing optimized schedule:", error);
    return null;
  }
};

// Import button component
export const ImportScheduleButton = ({ onImport }) => {
  const handleImport = () => {
    // Set temporary global callback
    window.onScheduleImported = onImport;
    importOptimizedSchedule();
  };
  
  return (
    <button 
      onClick={handleImport}
      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-4 h-4 mr-1"
      >
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      Import Optimized Schedule
    </button>
  );
};

/**
 * Alternative method that saves the data to localStorage instead of downloading
 */
export const saveAppliancesToLocalStorage = (appliances, userAppliances, solarEnabled, energySettings = {}) => {
  try {
    const allAppliances = [...appliances, ...userAppliances];
    const appliancesDict = {};
    
    allAppliances.forEach(app => {
      const key = app.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
      
      appliancesDict[key] = {
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
    
    const energyProfile = {
      optimization_strategy: energySettings.optimizationStrategy || "cost_savings",
      household_type: energySettings.householdType || "custom",
      battery_settings: {
        min_reserve: energySettings.batteryMinReserve || 30,
        strategy: energySettings.batteryStrategy || "peak_price"
      },
      solar_enabled: solarEnabled
    };
    
    const exportData = {
      appliances: appliancesDict,
      energy_profile: energyProfile,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('optHomeAppliancesData', JSON.stringify(exportData));
    console.log("Appliances data saved to localStorage");
    
    return exportData;
  } catch (error) {
    console.error("Error saving appliances data:", error);
    return null;
  }
};

/**
 * Python Export Hook - use this in your components to handle exports automatically
 */
export const usePythonExport = (appliances, userAppliances, solarEnabled, energySettings, autoSave = true) => {
  useEffect(() => {
    // Export data on component mount (app start)
    saveAppliancesToLocalStorage(appliances, userAppliances, solarEnabled, energySettings);
    
    // Set up interval to save data periodically if autoSave is enabled
    let saveInterval;
    if (autoSave) {
      saveInterval = setInterval(() => {
        saveAppliancesToLocalStorage(appliances, userAppliances, solarEnabled, energySettings);
      }, 60000); // Save every minute
    }
    
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, []); // Run once on mount
  
  // This effect runs whenever the appliance data changes
  useEffect(() => {
    saveAppliancesToLocalStorage(appliances, userAppliances, solarEnabled, energySettings);
  }, [appliances, userAppliances, solarEnabled, energySettings]);
  
  // Return export functions for manual triggering
  return {
    exportToFile: () => exportAppliancesToPython(appliances, userAppliances, solarEnabled, energySettings),
    saveToLocalStorage: () => saveAppliancesToLocalStorage(appliances, userAppliances, solarEnabled, energySettings)
  };
};

/**
 * Python Export Button Component
 */
export const ExportToPythonButton = ({ appliances, userAppliances, solarEnabled, energySettings }) => {
  const handleExport = () => {
    exportAppliancesToPython(appliances, userAppliances, solarEnabled, energySettings);
  };
  
  return (
    <button 
      onClick={handleExport}
      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-4 h-4 mr-1"
      >
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      Export to Python
    </button>
  );
};

export default {
  exportAppliancesToPython,
  saveAppliancesToLocalStorage,
  usePythonExport,
  ExportToPythonButton
};