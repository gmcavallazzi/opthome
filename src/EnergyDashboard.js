// src/EnergyDashboard.js
import React, { useState, useEffect } from 'react';
import { Sun, Home, Power, PieChart, Settings } from 'lucide-react';
import { hourlyData, defaultAppliances, formatCurrency } from './utils/mockData';
import { exportAppliancesToPython, importOptimizedSchedule, saveAppliancesToLocalStorage, ExportToPythonButton, ImportScheduleButton } from './services/ApplianceExporter';
import { OptimizeButton, runOptimization } from './services/OptimizationService';
import { OptimizationProgress, OptimizationSuccess } from './components/optimization/OptimizationUI';
import EnergyCharts from './components/EnergyCharts';
import OptimizationResults from './components/OptimizationResults';
import ApplianceForm from './components/forms/ApplianceForm';
import HourRestrictionsForm from './components/forms/HourRestrictionsForm';
import DashboardTab from './components/tabs/DashboardTab';
import AppliancesTab from './components/tabs/AppliancesTab';
import EnergyTab from './components/tabs/EnergyTab';
import SettingsTab from './components/tabs/SettingsTab';

// Import CSS files
import './styles/ChartStyles.css';
import './styles/components.css';

// Mock window.fs for the demo
if (typeof window !== 'undefined' && !window.fs) {
  window.fs = {
    readFile: (filename, options) => {
      return Promise.resolve(new TextEncoder().encode("mock file content"));
    }
  };
}

const EnergyDashboard = () => {
  // State variables
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddApplianceForm, setShowAddApplianceForm] = useState(false);
  const [showHourRestrictionsForm, setShowHourRestrictionsForm] = useState(false);
  const [editingApplianceId, setEditingApplianceId] = useState(null);
  const [selectedHours, setSelectedHours] = useState([]);
  const [solarEnabled, setSolarEnabled] = useState(true);
  const [optimizationRunning, setOptimizationRunning] = useState(false);
  const [optimizationSuccess, setOptimizationSuccess] = useState(null);
  const [newApplianceData, setNewApplianceData] = useState({
    name: "",
    power: 0,
    flexible: true,
    runDuration: 1,
    currentHours: [18],
    optimalHours: [12],
    preferredTimeOfDay: ["Afternoon"],
    priorityLevel: "medium"
  });
  const [appliances, setAppliances] = useState(defaultAppliances);
  const [userAppliances, setUserAppliances] = useState([]);
  const [optimizedSchedule, setOptimizedSchedule] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState('peakPrice'); 
  const [selectedProfile, setSelectedProfile] = useState("cost_savings");
  const [batteryMinReserve, setBatteryMinReserve] = useState(30);
  const [batteryStrategy, setBatteryStrategy] = useState("peak_price");
  const [householdType, setHouseholdType] = useState("custom");
  
  // Energy settings for Python export
  const energySettings = {
    optimizationStrategy: selectedProfile,
    householdType: householdType,
    batteryMinReserve: batteryMinReserve,
    batteryStrategy: batteryStrategy
  };

  // Setup auto-saving
  useEffect(() => {
    // Save on component mount
    saveAppliancesToLocalStorage(appliances, userAppliances, solarEnabled, energySettings);
    
    // Set up interval to save data periodically
    const saveInterval = setInterval(() => {
      saveAppliancesToLocalStorage(appliances, userAppliances, solarEnabled, energySettings);
    }, 60000); // Save every minute
    
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [appliances, userAppliances, solarEnabled, energySettings]);
  
  // Calculate data based on solar status
  const calculateData = () => {
    let data = hourlyData;
  
    if (!solarEnabled) {
      // Create a version with no solar production and adjusted optimal costs
      data = hourlyData.map(hour => ({
        ...hour,
        solarProduction: 0,
        // When solar is disabled, optimal costs are closer to standard costs (less optimization potential)
        optimalCost: hour.standardCost * 0.85, // Only about 15% savings without solar
        // Battery charge stays lower without solar charging
        batteryCharge: Math.max(20, hour.batteryCharge * 0.5)
      }));
    }
  
    // If we have an optimized schedule, update the optimalCost values and battery charge
    if (optimizedSchedule && optimizedSchedule.daily_schedule) {
      return data.map((hour, index) => {
        const hourKey = index.toString();
      
        // If we have data for this hour in the optimized schedule
        if (hourKey in optimizedSchedule.daily_schedule) {
          const hourSchedule = optimizedSchedule.daily_schedule[hourKey];
        
          // Calculate total power for this hour
          const totalPower = hourSchedule.reduce((sum, app) => sum + app.power, 0) / 1000; // convert to kW
        
          // Calculate new optimal cost based on power consumption
          const newOptimalCost = totalPower * hour.gridCost;
        
          // Get battery level from optimized schedule if available
          const batteryLevel = optimizedSchedule.battery && 
                              optimizedSchedule.battery.hourly_state && 
                              optimizedSchedule.battery.hourly_state[hourKey] ?
                              // Convert to percentage (assuming max level is 3.5 kWh from the Python code)
                              (optimizedSchedule.battery.hourly_state[hourKey] / 3.5) * 100 :
                              hour.batteryCharge;
        
          return {
            ...hour,
            optimizedCost: newOptimalCost, // Add a new property for the optimized cost
            batteryCharge: batteryLevel    // Update battery charge from optimization
          };
        }
      
        return {
          ...hour,
          optimizedCost: hour.optimalCost // Default to current optimal cost if no optimized data
        };
      });
    }
  
    return data;
  };
  
  const currentData = calculateData();
  
  // Calculate savings based on current data
  const calculateSavings = () => {
    const totalStandardCost = currentData.reduce((sum, hour) => sum + hour.standardCost, 0);
    
    // If we have an optimized schedule with its own savings, use that directly
    if (optimizedSchedule && optimizedSchedule.savings && optimizedSchedule.savings.daily) {
      const savingsAmount = optimizedSchedule.savings.daily;
      const savingsPercentage = (savingsAmount / totalStandardCost * 100).toFixed(1);
      return { totalStandardCost, savingsAmount, savingsPercentage };
    }
    
    // Otherwise, calculate from the current optimalCost data
    const totalOptimalCost = currentData.reduce((sum, hour) => {
      // Use optimizedCost if available, otherwise fall back to optimalCost
      return sum + (hour.optimizedCost !== undefined ? hour.optimizedCost : hour.optimalCost);
    }, 0);
    
    const savingsAmount = totalStandardCost - totalOptimalCost;
    const savingsPercentage = (savingsAmount / totalStandardCost * 100).toFixed(1);
    
    return { totalStandardCost, savingsAmount, savingsPercentage };
  };

  const { totalStandardCost, savingsAmount, savingsPercentage } = calculateSavings();

  // Handle imported schedule
  const handleScheduleImport = (data) => {
    console.log("Imported optimized schedule:", data);
    setOptimizedSchedule(data);
    
    // Optional: Apply optimized hours to appliances
    if (data.optimized_appliances) {
      // Update system appliances
      const updatedAppliances = appliances.map(app => {
        const optimizedApp = data.optimized_appliances[app.name.toLowerCase().replace(/\s+/g, '_')];
        if (optimizedApp && optimizedApp.optimized_hours) {
          return {
            ...app,
            optimalHours: optimizedApp.optimized_hours
          };
        }
        return app;
      });
      setAppliances(updatedAppliances);
      
      // Update user appliances
      const updatedUserAppliances = userAppliances.map(app => {
        const optimizedApp = data.optimized_appliances[app.name.toLowerCase().replace(/\s+/g, '_')];
        if (optimizedApp && optimizedApp.optimized_hours) {
          return {
            ...app,
            optimalHours: optimizedApp.optimized_hours
          };
        }
        return app;
      });
      setUserAppliances(updatedUserAppliances);
    }
  };
  
  // Handle optimization
const handleOptimization = async () => {
  setOptimizationRunning(true); // Set to true when starting
  try {
    const result = await runOptimization(
      appliances, 
      userAppliances, 
      solarEnabled, 
      energySettings
    );
    setOptimizedSchedule(result);
    setOptimizationSuccess(result);
    
    // Update appliances with optimized schedule if available
    if (result && result.optimized_appliances) {
      handleScheduleImport(result);
    }
  } catch (error) {
    console.error("Optimization failed:", error);
  } finally {
    setOptimizationRunning(false); // Set to false when completed
  }
};
  
  // Handle adding a new appliance
  const handleAddAppliance = () => {
    // Validate input
    if (!newApplianceData.name || newApplianceData.power <= 0 || newApplianceData.runDuration <= 0) {
      return;
    }
    
    // Assign an emoji based on appliance name (simple mapping)
    let emoji = "🔌"; // Default emoji
    const nameLower = newApplianceData.name.toLowerCase();
    if (nameLower.includes("pool")) emoji = "🏊";
    else if (nameLower.includes("tv") || nameLower.includes("television")) emoji = "📺";
    else if (nameLower.includes("oven") || nameLower.includes("stove")) emoji = "🍳";
    else if (nameLower.includes("light")) emoji = "💡";
    else if (nameLower.includes("computer") || nameLower.includes("pc")) emoji = "💻";
    else if (nameLower.includes("heat") || nameLower.includes("furnace")) emoji = "🔥";
    else if (nameLower.includes("fan")) emoji = "🌀";
    else if (nameLower.includes("vacuum")) emoji = "🧹";
    else if (nameLower.includes("microwave")) emoji = "🍲";
    
    // Create new appliance with unique ID
    const newAppliance = {
      ...newApplianceData,
      id: appliances.length + userAppliances.length + 1,
      emoji: emoji
    };
    
    // Add to user appliances list
    const updatedUserAppliances = [...userAppliances, newAppliance];
    setUserAppliances(updatedUserAppliances);
    
    // Reset form
    setNewApplianceData({
      name: "",
      power: 0,
      flexible: true,
      runDuration: 1,
      currentHours: [18],
      optimalHours: [12],
      preferredTimeOfDay: ["Afternoon"],
      priorityLevel: "medium"
    });
    
    // Export to Python after adding a new appliance
    saveAppliancesToLocalStorage(appliances, updatedUserAppliances, solarEnabled, energySettings);

    // Close form
    setShowAddApplianceForm(false);
  };
  
  // Handle input changes in the new appliance form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setNewApplianceData({
        ...newApplianceData,
        [name]: checked
      });
    } else if (name === 'power' || name === 'runDuration') {
      setNewApplianceData({
        ...newApplianceData,
        [name]: parseInt(value) || 0
      });
    } else if (name === 'currentHours') {
      setNewApplianceData({
        ...newApplianceData,
        [name]: [parseInt(value)]
      });
    } else if (name === 'preferredTimeOfDay') {
      if (checked) {
        setNewApplianceData({
          ...newApplianceData,
          [name]: [...newApplianceData.preferredTimeOfDay, value]
        });
      } else {
        setNewApplianceData({
          ...newApplianceData,
          [name]: newApplianceData.preferredTimeOfDay.filter(t => t !== value)
        });
      }
    } else {
      setNewApplianceData({
        ...newApplianceData,
        [name]: value
      });
    }
  };
  
  // Handle setting specific hours for an appliance
  const handleSetSpecificHours = (applianceId) => {
    // Find the appliance to get its current optimal hours
    const allAppliances = [...appliances, ...userAppliances];
    const appliance = allAppliances.find(a => a.id === applianceId);
    
    if (appliance) {
      // Initialize with the current optimal hours
      setSelectedHours([...appliance.optimalHours] || []);
    } else {
      setSelectedHours([]);
    }
    
    setEditingApplianceId(applianceId);
    setShowHourRestrictionsForm(true);
  };
  
  // Handle updating an appliance's hours
  const handleUpdateApplianceHours = () => {
    // Only proceed if we have a valid appliance ID
    if (!editingApplianceId) return;
    
    // Sort selected hours for consistency
    const sortedHours = [...selectedHours].sort((a, b) => a - b);

    // Find if it's a system appliance or user appliance
    const isSystemAppliance = appliances.some(app => app.id === editingApplianceId);
    
    if (isSystemAppliance) {
      // Update system appliance
      const updatedAppliances = appliances.map(app => 
        app.id === editingApplianceId 
          ? {...app, optimalHours: sortedHours} 
          : app
      );
      setAppliances(updatedAppliances);
      
      // Also update selectedAppliance if this is the one currently selected
      if (selectedAppliance && selectedAppliance.id === editingApplianceId) {
        setSelectedAppliance({...selectedAppliance, optimalHours: sortedHours});
      }
    } else {
      // Update user appliance
      const updatedUserAppliances = userAppliances.map(app => 
        app.id === editingApplianceId 
          ? {...app, optimalHours: sortedHours} 
          : app
      );
      setUserAppliances(updatedUserAppliances);
      
      // Also update selectedAppliance if this is the one currently selected
      if (selectedAppliance && selectedAppliance.id === editingApplianceId) {
        setSelectedAppliance({...selectedAppliance, optimalHours: sortedHours});
      }
    }
    
    // Close form and reset editing state
    setShowHourRestrictionsForm(false);
    setEditingApplianceId(null);
  };
  
  // Find the appliance being edited
  const findEditingAppliance = () => {
    const allAppliances = [...appliances, ...userAppliances];
    return allAppliances.find(a => a.id === editingApplianceId);
  };
  
  // Handle updating settings
  const handleUpdateSettings = (newSettings) => {
    if (newSettings.batteryMinReserve !== undefined) {
      setBatteryMinReserve(newSettings.batteryMinReserve);
    }
    if (newSettings.batteryStrategy !== undefined) {
      setBatteryStrategy(newSettings.batteryStrategy);
    }
    if (newSettings.optimizationStrategy !== undefined) {
      setSelectedProfile(newSettings.optimizationStrategy);
    }
    if (newSettings.householdType !== undefined) {
      setHouseholdType(newSettings.householdType);
    }
  };
  
  return (
    <div className="dashboard-container">
      {/* Optimization progress & success notifications */}
      <OptimizationProgress isRunning={optimizationRunning} />
      {optimizationSuccess && (
        <OptimizationSuccess 
          result={optimizationSuccess} 
          onClose={() => setOptimizationSuccess(null)} 
        />
      )}
      
      {/* Header */}
      <div className="header">
        <div className="header-content">
        <div className="logo-and-title" style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/images/opthome.png" 
            alt="OptHome Logo" 
            className="header-logo"
            style={{ 
              height: '60px', // Increased from 32px to 60px
              width: 'auto',
              marginRight: '15px'
            }}
          />
          <div>
            <h1 className="header-title" style={{ margin: 0 }}>
              Home Energy Optimization Dashboard
            </h1>
            <p className="header-subtitle">
              Optimize your energy usage, reduce costs, and maximize solar production
            </p>
          </div>
        </div>
          <div className="header-controls">
            <div className="solar-toggle">
              <span>Solar Panels:</span>
              <button 
                onClick={() => {
                  const newSolarState = !solarEnabled;
                  setSolarEnabled(newSolarState);
                  // Export to Python after toggling solar
                  saveAppliancesToLocalStorage(appliances, userAppliances, newSolarState, energySettings);
                }}
                className={`toggle-button ${solarEnabled ? 'toggle-on' : 'toggle-off'}`}
              >
                <span className="toggle-slider"></span>
                {solarEnabled ? 
                  <Sun size={12} className="toggle-icon" /> : 
                  <Sun size={12} className="toggle-icon toggle-icon-off" />
                }
              </button>
            </div>
            {/* Buttons for export, import and optimize */}
            <div className="header-buttons">
              <OptimizeButton 
                onOptimize={handleOptimization}
                isRunning={optimizationRunning}
              />
              <ExportToPythonButton 
                appliances={appliances} 
                userAppliances={userAppliances} 
                solarEnabled={solarEnabled} 
                energySettings={energySettings} 
              />
              <ImportScheduleButton onImport={handleScheduleImport} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Tabs Navigation */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <PieChart size={16} className="tab-icon" /> Dashboard
          </button>
          <button 
            className={`tab ${activeTab === 'appliances' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('appliances')}
          >
            <Power size={16} className="tab-icon" /> Appliance Scheduler
          </button>
          <button 
            className={`tab ${activeTab === 'energy' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('energy')}
          >
            <Sun size={16} className="tab-icon" /> Energy Production
          </button>
          <button 
            className={`tab ${activeTab === 'settings' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} className="tab-icon" /> Settings
          </button>
        </div>
      
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <DashboardTab 
            currentData={currentData} 
            solarEnabled={solarEnabled} 
            optimizedSchedule={optimizedSchedule}
            savingsAmount={savingsAmount}
            savingsPercentage={savingsPercentage}
            totalStandardCost={totalStandardCost}
            appliances={appliances}
            userAppliances={userAppliances}
            selectedAppliance={selectedAppliance}
            setSelectedAppliance={setSelectedAppliance}
            handleSetSpecificHours={handleSetSpecificHours}
            setShowAddApplianceForm={setShowAddApplianceForm}
          />
        )}
        
        {/* Appliances Tab */}
        {activeTab === 'appliances' && (
          <AppliancesTab 
            appliances={appliances}
            userAppliances={userAppliances}
            selectedAppliance={selectedAppliance}
            setSelectedAppliance={setSelectedAppliance}
            handleSetSpecificHours={handleSetSpecificHours}
            setShowAddApplianceForm={setShowAddApplianceForm}
          />
        )}
        
        {/* Energy Tab */}
        {activeTab === 'energy' && (
          <EnergyTab 
            currentData={currentData}
            solarEnabled={solarEnabled}
          />
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsTab 
            appliances={appliances}
            userAppliances={userAppliances}
            handleSetSpecificHours={handleSetSpecificHours}
            energySettings={energySettings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
        
        {/* Modal forms */}
        {showAddApplianceForm && (
          <ApplianceForm
            newApplianceData={newApplianceData}
            handleInputChange={handleInputChange}
            handleAddAppliance={handleAddAppliance}
            onClose={() => setShowAddApplianceForm(false)}
          />
        )}
        
        {showHourRestrictionsForm && (
        <HourRestrictionsForm
          editingAppliance={findEditingAppliance()}
          selectedHours={selectedHours}
          setSelectedHours={setSelectedHours}
          onSave={handleUpdateApplianceHours}
          onClose={() => {
            setShowHourRestrictionsForm(false);
            setEditingApplianceId(null);
          }}
        />
      )}
      </div>
    </div>
  );
};

export default EnergyDashboard;