import json
import numpy as np
from datetime import datetime
import copy

def generate_optimized_json(input_json_path, optimization_results, output_json_path):
    """
    Generates optimized JSON output with detailed schedule and savings,
    including battery information
    
    Parameters:
    - input_json_path: path to original JSON file with appliance info
    - optimization_results: dict containing optimization results (best_cost, start_times, etc.)
    - output_json_path: path to save the optimized JSON output
    """
    try:
        # Load the input JSON
        with open(input_json_path, 'r') as f:
            input_data = json.load(f)
        
        # Create a deep copy for the output data
        output_data = {
            "timestamp": datetime.now().isoformat(),
            "optimized_appliances": {},
            "daily_schedule": {},
            "battery": {
                "hourly_state": {},
                "modes": {},
                "summary": {}
            },
            "energy_flows": {
                "grid_consumption": {},
                "solar_production": {},
                "battery_charge": {},
                "battery_discharge": {}
            },
            "savings": {},
            "recommendations": []
        }
        
        # Extract appliances from input
        appliances = input_data.get('appliances', {})
        
        # Create hourly schedule placeholder for all 24 hours
        for hour in range(24):
            output_data["daily_schedule"][str(hour)] = []
            output_data["battery"]["hourly_state"][str(hour)] = 0
            output_data["battery"]["modes"][str(hour)] = "idle"
            output_data["energy_flows"]["grid_consumption"][str(hour)] = 0
            output_data["energy_flows"]["solar_production"][str(hour)] = 0
            output_data["energy_flows"]["battery_charge"][str(hour)] = 0
            output_data["energy_flows"]["battery_discharge"][str(hour)] = 0
        
        # Track total savings
        total_current_cost = 0
        total_optimal_cost = 0
        
        # Process each appliance
        for app_id, app_data in appliances.items():
            # Copy original data
            optimized_app = copy.deepcopy(app_data)
            
            if app_data.get('flexible', False):
                # Get optimized start hours from optimization results
                appliance_index = app_data.get('id', 0) - 1  # Convert to 0-based index
                
                if appliance_index >= 0 and appliance_index < len(optimization_results['start_times']):
                    start_hour = int(optimization_results['start_times'][appliance_index])
                    run_duration = app_data.get('run_duration', 1)
                    
                    # Calculate optimized hours
                    optimized_hours = list(range(start_hour, start_hour + int(run_duration)))
                    
                    # Add to app data
                    optimized_app['optimized_hours'] = optimized_hours
                    
                    # Calculate savings
                    # Get electricity prices
                    electricity_prices = optimization_results.get('dap', [0.25] * 24)
                    
                    # Current cost
                    current_hours = app_data.get('current_hours', [])
                    power_kw = app_data.get('power', 0) / 1000  # Convert W to kW
                    
                    current_cost = sum(electricity_prices[h] * power_kw for h in current_hours)
                    optimal_cost = sum(electricity_prices[h] * power_kw for h in optimized_hours)
                    
                    # Calculate savings
                    savings = current_cost - optimal_cost
                    percentage = (savings / current_cost * 100) if current_cost > 0 else 0
                    
                    # Add savings info
                    optimized_app['estimated_savings'] = {
                        "current_cost": round(current_cost, 2),
                        "optimal_cost": round(optimal_cost, 2),
                        "savings": round(savings, 2),
                        "percentage": round(percentage, 1)
                    }
                    
                    # Update totals
                    total_current_cost += current_cost
                    total_optimal_cost += optimal_cost
                    
                    # Add to daily schedule
                    for hour in optimized_hours:
                        if 0 <= hour < 24:  # Ensure hour is valid
                            output_data["daily_schedule"][str(hour)].append({
                                "name": app_data.get('name', app_id),
                                "power": app_data.get('power', 0),
                                "flexible": True
                            })
            else:
                # Non-flexible appliance - keep original schedule
                current_hours = app_data.get('current_hours', [])
                
                # Add to daily schedule
                for hour in current_hours:
                    if 0 <= hour < 24:  # Ensure hour is valid
                        output_data["daily_schedule"][str(hour)].append({
                            "name": app_data.get('name', app_id),
                            "power": app_data.get('power', 0),
                            "flexible": False
                        })
            
            # Add the appliance to output
            output_data["optimized_appliances"][app_id] = optimized_app
        
        # Calculate overall savings
        total_savings = total_current_cost - total_optimal_cost
        output_data["savings"] = {
            "daily": round(total_savings, 2),
            "monthly": round(total_savings * 30, 1),  # Approximate monthly savings
            "yearly": round(total_savings * 365, 2)  # Approximate yearly savings
        }
        
        # Add battery information if available
        if 'best_e_level' in optimization_results:
            battery_levels = optimization_results['best_e_level']
            battery_modes = optimization_results.get('battery_modes', np.zeros(24))
            
            # Add initial battery level
            initial_level = 0.5  # Default initial level
            
            # Record hourly battery levels and modes
            for hour in range(24):
                battery_level = battery_levels[hour] if hour < len(battery_levels) else 0
                output_data["battery"]["hourly_state"][str(hour)] = round(battery_level, 2)
                
                # Determine battery mode
                mode = "charging" if battery_modes[hour] == 1 else "discharging"
                output_data["battery"]["modes"][str(hour)] = mode
            
            # Add battery summary
            output_data["battery"]["summary"] = {
                "initial_level": initial_level,
                "final_level": round(battery_levels[-1] if len(battery_levels) > 0 else initial_level, 2),
                "min_level": round(np.min(battery_levels) if len(battery_levels) > 0 else initial_level, 2),
                "max_level": round(np.max(battery_levels) if len(battery_levels) > 0 else initial_level, 2),
                "charge_cycles": sum(1 for mode in battery_modes if mode == 1),
                "discharge_cycles": sum(1 for mode in battery_modes if mode == 0),
            }
        
        # Add energy flow information
        if all(key in optimization_results for key in ['best_eld_home', 'best_e_load_res', 'best_e_charge_mg', 'best_e_load_ess']):
            home_load = optimization_results['best_eld_home']
            res_energy = optimization_results['best_e_load_res']
            grid_charge = optimization_results['best_e_charge_mg']
            battery_discharge = optimization_results['best_e_load_ess']
            
            for hour in range(24):
                if hour < len(home_load):
                    # Grid consumption (home load - RES energy + battery charging - battery discharging)
                    grid_consumption = home_load[hour] - res_energy[hour] + grid_charge[hour] - battery_discharge[hour]
                    output_data["energy_flows"]["grid_consumption"][str(hour)] = round(max(0, grid_consumption), 2)
                    
                    # Solar production
                    if 'res' in optimization_results and hour < len(optimization_results['res']):
                        output_data["energy_flows"]["solar_production"][str(hour)] = round(optimization_results['res'][hour, 2], 2)
                    
                    # Battery flows
                    output_data["energy_flows"]["battery_charge"][str(hour)] = round(grid_charge[hour], 2)
                    output_data["energy_flows"]["battery_discharge"][str(hour)] = round(battery_discharge[hour], 2)
        
        # Generate recommendations
        morning_appliances = []
        afternoon_appliances = []
        battery_recommendations = []
        
        # Appliance recommendations
        for app_id, app_data in output_data["optimized_appliances"].items():
            if app_data.get('flexible', False) and 'optimized_hours' in app_data:
                hours = app_data['optimized_hours']
                name = app_data['name']
                start_hour = min(hours)
                end_hour = max(hours) + 1
                
                recommendation = f"Run {name} at {start_hour:02d}:00-{end_hour:02d}:00"
                
                if start_hour < 12:
                    morning_appliances.append(recommendation)
                else:
                    afternoon_appliances.append(recommendation)
        
        # Battery recommendations
        if 'battery' in output_data and 'modes' in output_data['battery']:
            charging_hours = [int(hour) for hour, mode in output_data['battery']['modes'].items() if mode == 'charging']
            discharging_hours = [int(hour) for hour, mode in output_data['battery']['modes'].items() if mode == 'discharging']
            
            if charging_hours:
                battery_recommendations.append(f"Charge battery during hours: {', '.join(f'{h:02d}:00' for h in sorted(charging_hours))}")
            if discharging_hours:
                battery_recommendations.append(f"Use battery power during hours: {', '.join(f'{h:02d}:00' for h in sorted(discharging_hours))}")
        
        # Add recommendations
        if morning_appliances:
            output_data["recommendations"].append({
                "period": "Morning (6:00 - 12:00)",
                "emoji": "☀️",
                "appliances": morning_appliances
            })
        
        if afternoon_appliances:
            output_data["recommendations"].append({
                "period": "Afternoon (12:00 - 18:00)",
                "emoji": "🌤️",
                "appliances": afternoon_appliances
            })
        
        if battery_recommendations:
            output_data["recommendations"].append({
                "period": "Battery Management",
                "emoji": "🔋",
                "appliances": battery_recommendations
            })
        
        # Save the output JSON
        with open(output_json_path, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"Optimized JSON saved to {output_json_path}")
        return output_data
    
    except Exception as e:
        print(f"Error generating optimized JSON: {e}")
        return None