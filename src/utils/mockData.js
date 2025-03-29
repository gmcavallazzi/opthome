/**
 * Mock hourly energy data for the dashboard
 */
export const hourlyData = [
    // Standard cost and grid cost remain the same
    // But optimal cost is much worse now - closer to standard cost
    { time: "00:00", gridCost: 0.08, solarProduction: 0, optimalCost: 0.14, standardCost: 0.15, batteryCharge: 45 },
    { time: "01:00", gridCost: 0.07, solarProduction: 0, optimalCost: 0.11, standardCost: 0.12, batteryCharge: 43 },
    { time: "02:00", gridCost: 0.06, solarProduction: 0, optimalCost: 0.09, standardCost: 0.10, batteryCharge: 41 },
    { time: "03:00", gridCost: 0.06, solarProduction: 0, optimalCost: 0.08, standardCost: 0.09, batteryCharge: 39 },
    { time: "04:00", gridCost: 0.07, solarProduction: 0, optimalCost: 0.09, standardCost: 0.10, batteryCharge: 38 },
    { time: "05:00", gridCost: 0.08, solarProduction: 0, optimalCost: 0.14, standardCost: 0.15, batteryCharge: 36 },
    { time: "06:00", gridCost: 0.12, solarProduction: 0.1, optimalCost: 0.30, standardCost: 0.32, batteryCharge: 35 },
    { time: "07:00", gridCost: 0.15, solarProduction: 0.6, optimalCost: 0.45, standardCost: 0.48, batteryCharge: 36 },
    { time: "08:00", gridCost: 0.18, solarProduction: 1.2, optimalCost: 0.60, standardCost: 0.65, batteryCharge: 40 },
    { time: "09:00", gridCost: 0.20, solarProduction: 1.8, optimalCost: 0.70, standardCost: 0.75, batteryCharge: 45 },
    { time: "10:00", gridCost: 0.18, solarProduction: 2.4, optimalCost: 0.50, standardCost: 0.55, batteryCharge: 52 },
    { time: "11:00", gridCost: 0.16, solarProduction: 2.8, optimalCost: 0.44, standardCost: 0.48, batteryCharge: 59 },
    { time: "12:00", gridCost: 0.15, solarProduction: 3.0, optimalCost: 0.42, standardCost: 0.45, batteryCharge: 66 },
    { time: "13:00", gridCost: 0.16, solarProduction: 2.9, optimalCost: 0.47, standardCost: 0.50, batteryCharge: 73 },
    { time: "14:00", gridCost: 0.17, solarProduction: 2.8, optimalCost: 0.49, standardCost: 0.52, batteryCharge: 78 },
    { time: "15:00", gridCost: 0.18, solarProduction: 2.5, optimalCost: 0.52, standardCost: 0.55, batteryCharge: 82 },
    { time: "16:00", gridCost: 0.20, solarProduction: 1.9, optimalCost: 0.57, standardCost: 0.60, batteryCharge: 85 },
    { time: "17:00", gridCost: 0.22, solarProduction: 1.2, optimalCost: 0.68, standardCost: 0.70, batteryCharge: 84 },
    { time: "18:00", gridCost: 0.25, solarProduction: 0.6, optimalCost: 1.07, standardCost: 0.90, batteryCharge: 80 },
    { time: "19:00", gridCost: 0.28, solarProduction: 0.2, optimalCost: 1.15, standardCost: 1.20, batteryCharge: 74 },
    { time: "20:00", gridCost: 0.30, solarProduction: 0, optimalCost: 1.16, standardCost: 1.40, batteryCharge: 67 },
    { time: "21:00", gridCost: 0.28, solarProduction: 0, optimalCost: 1.05, standardCost: 1.10, batteryCharge: 60 },
    { time: "22:00", gridCost: 0.20, solarProduction: 0, optimalCost: 0.68, standardCost: 0.70, batteryCharge: 54 },
    { time: "23:00", gridCost: 0.12, solarProduction: 0, optimalCost: 0.33, standardCost: 0.35, batteryCharge: 49 }
  ];
  
  /**
   * Default appliances data
   */
  export const defaultAppliances = [
    { id: 1, name: "Dishwasher", emoji: "🍽️", power: 1200, flexible: true, runDuration: 1.5, optimalHours: [19, 20], currentHours: [19, 20] },
    { id: 2, name: "Washing Machine", emoji: "👕", power: 500, flexible: true, runDuration: 1, optimalHours: [18], currentHours: [18] },
    { id: 3, name: "Dryer", emoji: "💨", power: 3000, flexible: true, runDuration: 1, optimalHours: [19], currentHours: [19] },
    { id: 4, name: "EV Charger", emoji: "🔌", power: 7200, flexible: true, runDuration: 3, optimalHours: [18, 19, 20], currentHours: [18, 19, 20] },
    { id: 5, name: "Water Heater", emoji: "🚿", power: 4500, flexible: true, runDuration: 2, optimalHours: [17, 18], currentHours: [17, 18] },
    { id: 6, name: "Air Conditioner", emoji: "❄️", power: 3500, flexible: false, runDuration: 8, optimalHours: [12, 13, 14, 15, 16, 17, 18, 19], currentHours: [12, 13, 14, 15, 16, 17, 18, 19] },
    { id: 7, name: "Refrigerator", emoji: "🧊", power: 150, flexible: false, runDuration: 24, optimalHours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], currentHours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] },
  ];
  
  /**
   * Helper function to format currency for Euro
   */
  export const formatCurrency = (value) => `€${value.toFixed(2)}`;

  /**
   * Mock optimization schedule with minimal savings
   */
  export const optimizedSchedule = {
    "timestamp": "2025-03-29T10:30:00.000Z",
    "optimization_status": "completed",
    "optimization_method": "python_optimizer_v1",
    "optimization_parameters": {
      "solar_enabled": true,
      "battery_enabled": true,
      "cost_priority": 0.8,
      "comfort_priority": 0.2
    },
    "savings": {
      "daily": 1.15,
      "monthly": 34.50,
      "yearly": 419.75
    },
    "battery": {
      "hourly_state": {
        "0": 1.50,
        "1": 1.40,
        "2": 1.30,
        "3": 1.20,
        "4": 1.15,
        "5": 1.10,
        "6": 1.05,
        "7": 1.10,
        "8": 1.20,
        "9": 1.35,
        "10": 1.55,
        "11": 1.80,
        "12": 2.10,
        "13": 2.30,
        "14": 2.45,
        "15": 2.55,
        "16": 2.50,
        "17": 2.40,
        "18": 2.20,
        "19": 1.95,
        "20": 1.75,
        "21": 1.60,
        "22": 1.55,
        "23": 1.50
      },
      "min_state": 1.05,
      "max_state": 2.55
    },
    "daily_schedule": {
      "0": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "1": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "2": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "3": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "4": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "5": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "6": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "7": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "8": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "9": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "10": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "11": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "12": [
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "13": [
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "14": [
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "15": [
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "16": [
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "17": [
        { "id": 5, "name": "Water Heater", "power": 4500 },
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "18": [
        { "id": 2, "name": "Washing Machine", "power": 500 },
        { "id": 4, "name": "EV Charger", "power": 7200 },
        { "id": 5, "name": "Water Heater", "power": 4500 },
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "19": [
        { "id": 1, "name": "Dishwasher", "power": 1200 },
        { "id": 3, "name": "Dryer", "power": 3000 },
        { "id": 4, "name": "EV Charger", "power": 7200 },
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "20": [
        { "id": 1, "name": "Dishwasher", "power": 1200 },
        { "id": 4, "name": "EV Charger", "power": 7200 },
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "21": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "22": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "23": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ]
    },
    "recommendations": [
      {
        "period": "Morning (6:00 - 12:00)",
        "emoji": "☀️",
        "appliances": [
          "Consider utilizing solar production for energy-intensive tasks"
        ]
      },
      {
        "period": "Afternoon (12:00 - 18:00)",
        "emoji": "🌤️",
        "appliances": [
          "Run Water Heater during solar peak (17:00)"
        ]
      },
      {
        "period": "Evening (18:00 - 00:00)",
        "emoji": "🌙",
        "appliances": [
          "Washing Machine runs at 18:00",
          "Dishwasher and Dryer run during peak pricing (19:00-20:00)",
          "EV charging during most expensive hours (18:00-20:00)"
        ]
      }
    ],
    "error_analysis": {
      "total_peak_usage": 15.15,
      "total_off_peak_usage": 5.25,
      "cost_inefficiency": 7.3,
      "solar_utilization": 15.2,
      "energy_waste": 8.5
    }
  };
  
  export default {
    hourlyData,
    defaultAppliances,
    formatCurrency,
    optimizedSchedule
  };