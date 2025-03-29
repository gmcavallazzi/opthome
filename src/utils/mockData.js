/**
 * Mock hourly energy data for the dashboard
 */
export const hourlyData = [
    { time: "00:00", gridCost: 0.08, solarProduction: 0, optimalCost: 0.25, standardCost: 0.15, batteryCharge: 45 },
    { time: "01:00", gridCost: 0.07, solarProduction: 0, optimalCost: 0.30, standardCost: 0.12, batteryCharge: 43 },
    { time: "02:00", gridCost: 0.06, solarProduction: 0, optimalCost: 0.35, standardCost: 0.10, batteryCharge: 41 },
    { time: "03:00", gridCost: 0.06, solarProduction: 0, optimalCost: 0.32, standardCost: 0.09, batteryCharge: 39 },
    { time: "04:00", gridCost: 0.07, solarProduction: 0, optimalCost: 0.28, standardCost: 0.10, batteryCharge: 38 },
    { time: "05:00", gridCost: 0.08, solarProduction: 0, optimalCost: 0.24, standardCost: 0.15, batteryCharge: 36 },
    { time: "06:00", gridCost: 0.12, solarProduction: 0.1, optimalCost: 0.22, standardCost: 0.32, batteryCharge: 35 },
    { time: "07:00", gridCost: 0.15, solarProduction: 0.6, optimalCost: 0.25, standardCost: 0.48, batteryCharge: 36 },
    { time: "08:00", gridCost: 0.18, solarProduction: 1.2, optimalCost: 0.30, standardCost: 0.65, batteryCharge: 40 },
    { time: "09:00", gridCost: 0.20, solarProduction: 1.8, optimalCost: 0.35, standardCost: 0.75, batteryCharge: 45 },
    { time: "10:00", gridCost: 0.18, solarProduction: 2.4, optimalCost: 0.38, standardCost: 0.55, batteryCharge: 52 },
    { time: "11:00", gridCost: 0.16, solarProduction: 2.8, optimalCost: 0.40, standardCost: 0.48, batteryCharge: 59 },
    { time: "12:00", gridCost: 0.15, solarProduction: 3.0, optimalCost: 0.42, standardCost: 0.45, batteryCharge: 66 },
    { time: "13:00", gridCost: 0.16, solarProduction: 2.9, optimalCost: 0.40, standardCost: 0.50, batteryCharge: 73 },
    { time: "14:00", gridCost: 0.17, solarProduction: 2.8, optimalCost: 0.38, standardCost: 0.52, batteryCharge: 78 },
    { time: "15:00", gridCost: 0.18, solarProduction: 2.5, optimalCost: 0.35, standardCost: 0.55, batteryCharge: 82 },
    { time: "16:00", gridCost: 0.20, solarProduction: 1.9, optimalCost: 0.32, standardCost: 0.60, batteryCharge: 85 },
    { time: "17:00", gridCost: 0.22, solarProduction: 1.2, optimalCost: 0.28, standardCost: 0.70, batteryCharge: 84 },
    { time: "18:00", gridCost: 0.25, solarProduction: 0.6, optimalCost: 0.25, standardCost: 0.90, batteryCharge: 80 },
    { time: "19:00", gridCost: 0.28, solarProduction: 0.2, optimalCost: 0.22, standardCost: 1.20, batteryCharge: 74 },
    { time: "20:00", gridCost: 0.30, solarProduction: 0, optimalCost: 0.20, standardCost: 1.40, batteryCharge: 67 },
    { time: "21:00", gridCost: 0.28, solarProduction: 0, optimalCost: 0.22, standardCost: 1.10, batteryCharge: 60 },
    { time: "22:00", gridCost: 0.20, solarProduction: 0, optimalCost: 0.25, standardCost: 0.70, batteryCharge: 54 },
    { time: "23:00", gridCost: 0.12, solarProduction: 0, optimalCost: 0.28, standardCost: 0.35, batteryCharge: 49 }
  ];
  
  /**
   * Default appliances data
   */
  export const defaultAppliances = [
    { id: 1, name: "Dishwasher", emoji: "🍽️", power: 1200, flexible: true, runDuration: 1.5, optimalHours: [2, 3, 4], currentHours: [19, 20] },
    { id: 2, name: "Washing Machine", emoji: "👕", power: 500, flexible: true, runDuration: 1, optimalHours: [9, 10], currentHours: [18] },
    { id: 3, name: "Dryer", emoji: "💨", power: 3000, flexible: true, runDuration: 1, optimalHours: [13, 14], currentHours: [19] },
    { id: 4, name: "EV Charger", emoji: "🔌", power: 7200, flexible: true, runDuration: 3, optimalHours: [1, 2, 3], currentHours: [18, 19, 20] },
    { id: 5, name: "Water Heater", emoji: "🚿", power: 4500, flexible: true, runDuration: 2, optimalHours: [10, 11], currentHours: [17, 18] },
    { id: 6, name: "Air Conditioner", emoji: "❄️", power: 3500, flexible: false, runDuration: 8, optimalHours: [12, 13, 14, 15, 16, 17, 18, 19], currentHours: [12, 13, 14, 15, 16, 17, 18, 19] },
    { id: 7, name: "Refrigerator", emoji: "🧊", power: 150, flexible: false, runDuration: 24, optimalHours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], currentHours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] },
  ];
  
  /**
   * Helper function to format currency for Euro
   */
  export const formatCurrency = (value) => `€${value.toFixed(2)}`;
  
  export default {
    hourlyData,
    defaultAppliances,
    formatCurrency
  };