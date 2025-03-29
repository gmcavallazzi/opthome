// This simulates a worse optimization result from a Python algorithm
const worseOptimizationSchedule = {
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
      "daily": 1.15, // Lower savings than current optimization
      "monthly": 34.50,
      "yearly": 419.75
    },
    "battery": {
      "hourly_state": {
        "0": 1.50, // kWh values
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
        { "id": 1, "name": "Dishwasher", "power": 1200 }
      ],
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
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
        { "id": 5, "name": "Water Heater", "power": 4500 },
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 },
        { "id": 2, "name": "Washing Machine", "power": 500 }
      ],
      "19": [
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 },
        { "id": 1, "name": "Dishwasher", "power": 1200 },
        { "id": 3, "name": "Dryer", "power": 3000 },
        { "id": 4, "name": "EV Charger", "power": 7200 }
      ],
      "20": [
        { "id": 6, "name": "Air Conditioner", "power": 3500 },
        { "id": 7, "name": "Refrigerator", "power": 150 },
        { "id": 4, "name": "EV Charger", "power": 7200 }
      ],
      "21": [
        { "id": 7, "name": "Refrigerator", "power": 150 },
        { "id": 4, "name": "EV Charger", "power": 7200 }
      ],
      "22": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ],
      "23": [
        { "id": 7, "name": "Refrigerator", "power": 150 }
      ]
    },
    "optimized_appliances": {
      "dishwasher": {
        "id": 1,
        "name": "Dishwasher",
        "power": 1200,
        "flexibility": true,
        "optimized_hours": [0, 19], // Worse hours - during peak pricing
        "priority": "medium",
        "savings": -0.42 // Negative savings
      },
      "washing_machine": {
        "id": 2,
        "name": "Washing Machine",
        "power": 500,
        "flexibility": true,
        "optimized_hours": [18], // Running during peak hours
        "priority": "medium",
        "savings": -0.15
      },
      "dryer": {
        "id": 3,
        "name": "Dryer",
        "power": 3000,
        "flexibility": true,
        "optimized_hours": [19], // Running at peak price
        "priority": "medium",
        "savings": -0.58
      },
      "ev_charger": {
        "id": 4,
        "name": "EV Charger",
        "power": 7200,
        "flexibility": true,
        "optimized_hours": [19, 20, 21], // Running during expensive hours
        "priority": "medium",
        "savings": -1.24
      },
      "water_heater": {
        "id": 5,
        "name": "Water Heater",
        "power": 4500,
        "flexibility": true,
        "optimized_hours": [17, 18], // Running at expensive times
        "priority": "medium",
        "savings": -0.84
      },
      "air_conditioner": {
        "id": 6,
        "name": "Air Conditioner",
        "power": 3500,
        "flexibility": false,
        "optimized_hours": [12, 13, 14, 15, 16, 17, 18, 19, 20],
        "priority": "high",
        "savings": 0
      },
      "refrigerator": {
        "id": 7,
        "name": "Refrigerator",
        "power": 150,
        "flexibility": false,
        "optimized_hours": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        "priority": "high",
        "savings": 0
      }
    },
    "recommendations": [
      {
        "period": "Morning (6:00 - 12:00)",
        "emoji": "☀️",
        "appliances": [
          "Avoid running major appliances during these hours"
        ]
      },
      {
        "period": "Afternoon (12:00 - 18:00)",
        "emoji": "🌤️",
        "appliances": [
          "Run Water Heater at 17:00-18:00"
        ]
      },
      {
        "period": "Evening (18:00 - 00:00)",
        "emoji": "🌙",
        "appliances": [
          "Run Washing Machine at 18:00",
          "Run Dishwasher and Dryer at 19:00",
          "Charge EV between 19:00-21:00"
        ]
      }
    ],
    "error_analysis": {
      "total_peak_usage": 15.15, // kWh
      "total_off_peak_usage": 5.25, // kWh
      "cost_inefficiency": 7.3, // %
      "solar_utilization": 15.2, // % - poor solar utilization
      "energy_waste": 8.5 // %
    }
  };
  
  export default worseOptimizationSchedule;