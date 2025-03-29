import json
import numpy as np

def load_appliances_from_json(json_path):
    """
    Load appliance data from a JSON file
    
    Returns:
    - shiftable_appliances: numpy array of shiftable appliances [power(kW), runtime(h), latest_start_time]
    - non_shiftable_appliances: numpy array of non-shiftable appliances [power(kW), runtime(h), start_time]
    - appliance_names: list of appliance names
    - energy_profile: dictionary with optimization settings
    """
    try:
        # Load the JSON file
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        # Extract appliances
        appliances = data.get('appliances', {})
        
        # Separate shiftable and non-shiftable appliances
        shiftable = []
        non_shiftable = []
        names = []
        
        # Latest start time - assuming a 24-hour optimization window
        # We'll use 22 as default latest start time (10 PM) for shiftable appliances
        latest_start_time = 22
        
        for app_id, app_data in appliances.items():
            name = app_data.get('name', app_id)
            power = app_data.get('power', 0) / 1000  # Convert W to kW
            runtime = app_data.get('run_duration', 1)
            flexible = app_data.get('flexible', False)
            current_hours = app_data.get('current_hours', [])
            
            names.append(name)
            
            if flexible:
                # For shiftable appliances: [power, runtime, latest_start_time]
                # Calculate latest start time based on runtime and a cutoff at midnight
                lst = latest_start_time - runtime + 1
                shiftable.append([power, runtime, lst])
            else:
                # For non-shiftable appliances: [power, runtime, start_time]
                start_time = min(current_hours) if current_hours else 0
                non_shiftable.append([power, runtime, start_time])
        
        # Convert to numpy arrays
        shiftable_array = np.array(shiftable)
        non_shiftable_array = np.array(non_shiftable)
        
        # Get energy profile settings
        energy_profile = data.get('energy_profile', {})
        
        return shiftable_array, non_shiftable_array, names, energy_profile
    
    except Exception as e:
        print(f"Error loading JSON file: {e}")
        # Return default values
        shiftable_default = np.array([
            [0.5, 2, 19],  # Washing Machine
            [1.5, 3, 14],  # Air conditioner
            [1.0, 1, 20],  # Clothes dryer
            [2.0, 2, 16],  # Water heater
            [0.8, 2, 21]   # Dishwasher
        ])
        
        non_shiftable_default = np.array([
            [0.1, 24, 0],  # Refrigerator
            [0.3, 5, 17],  # TV
            [0.02, 8, 22], # Night light
            [0.6, 2, 7],   # Coffee maker
            [0.1, 3, 18],  # Computer
        ])
        
        names_default = ["Washing Machine", "Air conditioner", "Clothes dryer", "Water heater", "Dish Washer"]
        
        energy_profile_default = {
            "optimization_strategy": "cost_savings",
            "solar_enabled": True,
            "battery_settings": {
                "min_reserve": 30,
                "strategy": "peak_price"
            }
        }
        
        return shiftable_default, non_shiftable_default, names_default, energy_profile_default

def save_appliances_to_json(shiftable, non_shiftable, names, energy_profile, output_path):
    """
    Save optimization results back to a JSON file
    
    Parameters:
    - shiftable: numpy array of shiftable appliances with optimized start times
    - non_shiftable: numpy array of non-shiftable appliances
    - names: list of appliance names
    - energy_profile: energy profile settings
    - output_path: path to save the JSON file
    """
    data = {"appliances": {}, "energy_profile": energy_profile}
    
    # Process shiftable appliances
    for i, app in enumerate(shiftable):
        if i < len(names):
            name = names[i]
            power_kw = app[0]
            runtime = app[1]
            
            # Convert name to id (lowercase with underscores)
            app_id = name.lower().replace(' ', '_')
            
            # Calculate the optimized hours based on start time
            start_hour = int(app[2])
            current_hours = list(range(start_hour, start_hour + int(runtime)))
            
            data["appliances"][app_id] = {
                "id": i + 1,
                "name": name,
                "power": int(power_kw * 1000),  # Convert kW to W
                "flexible": True,
                "run_duration": runtime,
                "current_hours": current_hours,
                "priority_level": "medium"
            }
    
    # Process non-shiftable appliances
    for i, app in enumerate(non_shiftable):
        idx = i + len(shiftable)
        if idx < len(names):
            name = names[idx]
        else:
            name = f"Non-Shiftable Appliance {i+1}"
        
        power_kw = app[0]
        runtime = app[1]
        start_hour = int(app[2])
        
        # Convert name to id
        app_id = name.lower().replace(' ', '_')
        
        # Calculate the hours
        current_hours = list(range(start_hour, start_hour + int(runtime)))
        
        data["appliances"][app_id] = {
            "id": idx + 1,
            "name": name,
            "power": int(power_kw * 1000),  # Convert kW to W
            "flexible": False,
            "run_duration": runtime,
            "current_hours": current_hours,
            "priority_level": "medium"
        }
    
    # Save to file
    try:
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Optimization results saved to {output_path}")
    except Exception as e:
        print(f"Error saving results to JSON: {e}")