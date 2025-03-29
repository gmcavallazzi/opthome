import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import random
import requests
import csv
import re
from io import StringIO
from datetime import datetime

def load_shiftable_appliances(file_path):
    """Load shiftable appliances data with names from the first column"""
    try:
        # First try to load with names using genfromtxt with dtype=None
        shift_data_raw = np.genfromtxt(file_path, delimiter=';', dtype=str, encoding='utf-8')
        shift_data_raw = np.delete(shift_data_raw, -1, axis=1) if shift_data_raw.shape[1] > 3 else shift_data_raw
        
        # Extract names from first column
        appliance_names = shift_data_raw[:, 0]
        
        # Convert rest of the data to numeric
        shift_data = np.zeros((len(appliance_names), 3))
        for i in range(len(appliance_names)):
            # Skip the first column (names) and convert the rest to float
            for j in range(1, 4):
                if j < shift_data_raw.shape[1]:
                    try:
                        shift_data[i, j-1] = float(shift_data_raw[i, j])
                    except ValueError:
                        # In case of conversion error, set a default value
                        shift_data[i, j-1] = 0 if j == 1 else 2 if j == 2 else 21
        
        # Format is [power, runtime, EST/LST info]
        if shift_data.ndim == 1:  # Handle the case if only one row is loaded
            shift_data = shift_data.reshape(1, -1)
        
        return shift_data, appliance_names
    except Exception as e:
        print(f"Warning: Could not load shiftable appliances file with names: {e}")
        # Fallback to default values
        default_data = np.array([
            [0.5, 2, 19],  # Washing Machine
            [1.5, 3, 14],  # Air conditioner
            [1.0, 1, 20],  # Clothes dryer
            [2.0, 2, 16],  # Water heater
            [0.8, 2, 21]   # Dishwasher
        ])
        default_names = [
            "Washing Machine", "Air conditioner", "Clothes dryer", 
            "Water heater", "Dish Washer"
        ]
        return default_data, default_names

def load_non_shiftable_appliances(file_path):
    """Load non-shiftable appliances data"""
    try:
        non_shift_data = np.genfromtxt(file_path, delimiter=';', dtype=float, filling_values=np.nan)
        non_shift_data = np.delete(non_shift_data, -1, axis=1)
        if non_shift_data.ndim == 1:  # Handle the case if only one row is loaded
            non_shift_data = non_shift_data.reshape(1, -1)
        
        return non_shift_data
    except Exception as e:
        print(f"Warning: Could not load non-shiftable appliances file: {e}")
        # Fallback to default values
        return np.array([
            [0.1, 24, 0],  # Refrigerator
            [0.3, 5, 17],  # TV
            [0.02, 8, 22], # Night light
            [0.6, 2, 7],   # Coffee maker
            [0.1, 3, 18],  # Computer
            [0.05, 2, 6]   # Hair dryer
        ])

def fetch_omie_prices(url):
    """Fetch electricity prices from OMIE"""
    date_pattern = r'marginalpdbcpt_(\d{8})'
    date_match = re.search(date_pattern, url)
    if date_match:
        date_str = date_match.group(1)
        try:
            plot_date = datetime.strptime(date_str, '%Y%m%d').strftime('%Y-%m-%d')
        except ValueError:
            plot_date = "Unknown Date"
    else:
        plot_date = "Unknown Date"
    
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to download data: Status code {response.status_code}")
        return None, None
    
    data = StringIO(response.text)
    csv_reader = csv.reader(data, delimiter=';')
    next(csv_reader, None)
    hours = []
    prices_portugal = []
    first_row = True
    
    for row in csv_reader:
        if len(row) >= 6:  # Ensure the row has enough columns
            try:
                if first_row and plot_date == "Unknown Date":
                    year = row[0]
                    month = row[1].zfill(2)  # Ensure two digits
                    day = row[2].zfill(2)    # Ensure two digits
                    plot_date = f"{year}-{month}-{day}"
                    first_row = False
                hour = int(row[3])
                price_pt = float(row[4].replace(',', '.'))  # Handle decimal separator
                hours.append(hour)
                prices_portugal.append(price_pt)
            except (ValueError, IndexError) as e:
                print(f"Error parsing row {row}: {e}")
    
    return hours, prices_portugal

def fetch_solar_data(api_key, lat, lon, day_of_year=172):
    """Fetch solar energy generation data from NREL PVWatts API"""
    url = f"https://developer.nrel.gov/api/pvwatts/v6.json?api_key={api_key}&lat={lat}&lon={lon}&system_capacity=1&module_type=0&losses=14&array_type=1&tilt=40&azimuth=180&timeframe=hourly"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        # Extract hourly data
        hourly_data = data['outputs']['ac']
        
        # Choose a specific date
        start_hour = (day_of_year - 1) * 24
        daily_data = np.array(hourly_data[start_hour:start_hour+24])
        
        return daily_data/1000  # Convert to kWh/m²
    except Exception as e:
        print(f"Warning: Could not fetch solar data: {e}")
        # Fallback to synthetic data
        return 2.0 * np.sin(np.linspace(0, np.pi, 24))

def appliance_treatment(position, run_time, mat_slots, est):
    """Ensure particles stay within feasible region for appliances"""
    num_appliances = len(run_time)
    matriz = np.zeros((num_appliances, 24))
    start_time = np.zeros(num_appliances)
    
    # Process each appliance
    for i in range(num_appliances):
        flag = 1
        if i == 0:
            # First appliance
            vec_length = mat_slots[i]
            vec = position[:vec_length].copy()  # Create a copy to avoid modifying original
            x = list(range(vec_length))
            
            # Find first 1 in the vector
            for kk in range(len(vec)):
                if vec[kk] == 1 and flag == 1:
                    start_time[i] = kk
                    # Set all subsequent positions to 1
                    vec[kk:] = 1
                    # Set positions after runtime to 0
                    end_idx = kk + int(run_time[i, 1])
                    if end_idx < len(vec):
                        vec[end_idx:] = 0
                    flag = 0
                    break
            
            # If we found a valid start time, update the position
            if flag == 0 and len(x) == len(vec):
                position[x] = vec
        elif i > 0:
            # Other appliances
            start_idx = int(mat_slots[i-1])
            end_idx = int(mat_slots[i])
            
            # Check that we have a valid range
            if start_idx < end_idx and start_idx < len(position):
                vec_length = end_idx - start_idx
                vec = position[start_idx:end_idx].copy()
                x = list(range(start_idx, end_idx))
                
                # Only proceed if we have a valid vector
                if len(vec) > 0:
                    # Find first 1 in the vector
                    for kk in range(len(vec)):
                        if vec[kk] == 1:
                            start_time[i] = kk
                            # Set all subsequent positions to 1
                            vec[kk:] = 1
                            # Set positions after runtime to 0
                            end_idx = kk + int(run_time[i, 1])
                            if end_idx < len(vec):
                                vec[end_idx:] = 0
                            flag = 0
                            break
                    
                    # If we found a valid start time, update the position
                    if flag == 0 and len(x) == len(vec):
                        position[x] = vec
    
    # Create binary matrix for appliance schedule
    for j in range(num_appliances):
        if start_time[j] > 0:  # Only process if we have a valid start time
            jump2 = int(run_time[j, 1] + start_time[j])
            start_idx = est + int(start_time[j])
            end_idx = min(jump2 + est, 24)  # Make sure we don't go beyond 24
            
            if start_idx < 24:  # Only process if start time is within bounds
                matriz[j, start_idx:end_idx] = 1
        else:
            # Handle the case where start_time is 0
            jump2 = int(run_time[j, 1])
            end_idx = min(est + jump2, 24)
            matriz[j, est:end_idx] = 1
    
    return matriz, position, start_time

def correct_battery_modes(vector, charge_rate, efficiency, max_level, max_true_level, min_level):
    """Correct battery modes to maintain feasible ESS operation"""
    vector[0] = 1
    e_level = np.zeros(24)
    initial = 0.5
    
    for i in range(24):
        if i == 0:
            e_level[i] = initial + charge_rate * efficiency
        elif vector[i] == 1:  # Charging
            e_level[i] = e_level[i-1] + charge_rate * efficiency
            if e_level[i] >= max_level:
                vector[i] = 0
                e_level[i] = e_level[i-1] - charge_rate * efficiency
        else:  # Discharging
            e_level[i] = e_level[i-1] - charge_rate * efficiency
            if e_level[i] <= min_level:
                vector[i] = 1
                e_level[i] = e_level[i-1] + charge_rate * efficiency
    
    for i in range(24):
        if i >= 15 and i <= 24:
            required_level = max_true_level - charge_rate * efficiency * (i - 15)
            if e_level[i] >= required_level:
                vector[i] = 0
                if i > 0:
                    e_level[i] = e_level[i-1] - charge_rate * efficiency
    
    return vector, e_level

def position_to_matrix(position, matriz, start_time, shiftable, est):
    """Convert position vector to readable matrix format"""
    num_appliances = len(shiftable)
    matrix = np.zeros((num_appliances + 1, 24))  # +1 for battery
    
    for j in range(num_appliances):
        if j < len(start_time):  # Make sure we have valid start times
            slot = int(start_time[j])
            x = slot + est
            if x < 24:  # Only proceed if within bounds
                runtime = int(shiftable[j, 1])
                end_idx = min(x + runtime, 24)  # Ensure we don't exceed array bounds
                matrix[j, x:end_idx] = 1
    
    matrix[num_appliances, :] = position[-24:]
    
    return matrix

def objective_function(matrix, shiftable, non_shiftable, time_non_shift, res, dap, w1, w2, res_area=10, charge_rate=0.3):
    """Calculate cost and PAR objectives"""
    num_shiftable = len(shiftable)
    num_non_shiftable = len(non_shiftable)
    
    time_shift = matrix[:num_shiftable, :]
    
    # Calculate energy consumption for each appliance and time slot
    en = np.zeros((num_non_shiftable, 24))
    em = np.zeros((num_shiftable, 24))
    
    for j in range(num_non_shiftable):
        for t in range(24):
            en[j, t] = non_shiftable[j, 0] * time_non_shift[j, t]
    
    for j in range(num_shiftable):
        for t in range(24):
            em[j, t] = shiftable[j, 0] * time_shift[j, t]
    
    # Home energy demand per hour
    eld_home = np.sum(en, axis=0) + np.sum(em, axis=0)
    
    # Energy from RES
    e_load_res = np.zeros(24)
    e_res_charge = np.zeros(24)
    
    for i in range(24):
        if eld_home[i] < res[i, 2] * res_area:
            e_load_res[i] = eld_home[i]
            e_res_charge[i] = res[i, 2] * res_area - e_load_res[i]
        else:
            e_load_res[i] = res[i, 2] * res_area
    
    # ESS energy flows
    mode = matrix[num_shiftable, :]  # Battery mode is the last row
    e_charge_mg = np.zeros(24)
    e_selling_ess = np.zeros(24)
    e_load_ess = np.zeros(24)
    
    for i in range(24):
        if mode[i] == 1:  # Charging
            e_charge_mg[i] = charge_rate - e_res_charge[i]
            if e_charge_mg[i] < 0:
                e_charge_mg[i] = 0
        else:  # Discharging
            if charge_rate > (eld_home[i] - e_load_res[i]):
                e_load_ess[i] = eld_home[i] - e_load_res[i]
                e_selling_ess[i] = charge_rate - (eld_home[i] - e_load_res[i])
            else:
                e_load_ess[i] = charge_rate
                e_selling_ess[i] = 0
    
    # Calculate cost
    alpha = 1  # Same buying and selling price
    cost = np.zeros(24)
    
    for i in range(24):
        cost[i] = (eld_home[i] - e_load_res[i] + e_charge_mg[i] - 
                   e_load_ess[i] - alpha * e_selling_ess[i]) * dap[i, 2]
    
    total_cost = np.sum(cost)
    
    # Calculate PAR
    total_eld = np.sum(eld_home + e_charge_mg)
    max_eld = np.max(eld_home + e_charge_mg)
    if total_eld > 0:  # Avoid division by zero
        par = max_eld * 24 / total_eld
    else:
        par = 1.0
    
    # Multi-objective function
    obj = w1 * total_cost + w2 * par
    
    return obj, total_cost, par, e_load_res, e_charge_mg, eld_home, e_selling_ess, e_load_ess

def print_optimization_results(best_cost, best_par, max_iterations, population_size, shiftable, start_times, appliance_names):
    """Print the optimization results"""
    print("\nOptimization Results:")
    print(f"Total Price for consumed daily energy: ${best_cost:.2f}")
    print(f"Peak Average Ratio of the household: {best_par:.2f}")
    print(f"Solution obtained with {max_iterations} iterations and {population_size} particles")

    print("\nAppliances              Usage (Hours)                Start Time")
    # Use the loaded appliance names if available
    num_appliances = len(shiftable)
    
    for i in range(num_appliances):
        if i < len(start_times):  # Make sure we have valid start times
            start_hour = start_times[i] - 1 if start_times[i] > 0 else 0
            # Use the actual appliance name from the loaded data
            appliance_name = appliance_names[i] if i < len(appliance_names) else f"Appliance {i+1}"
            # Truncate the name if it's too long
            if len(appliance_name) > 18:
                appliance_name = appliance_name[:15] + "..."
            print(f"{appliance_name:<20} {int(shiftable[i, 1]):>2} Hours                      {int(start_hour):>2}:00")

def plot_optimization_results(best_costs, best_e_level, best_eld_home, best_e_load_res, best_e_charge_mg, best_e_load_ess):
    """Plot the optimization results"""
    # Plot convergence
    plt.figure(figsize=(10, 6))
    plt.semilogy(best_costs, linewidth=2)
    plt.xlabel('Iteration')
    plt.ylabel('Best Cost')
    plt.title('Best Cost Evolution - PSO Algorithm')
    plt.grid(True)
    plt.tight_layout()
    plt.show()
    
    # Plot ESS energy level
    plt.figure(figsize=(10, 6))
    e_level_plot = np.zeros(25)
    e_level_plot[0] = 0.5
    e_level_plot[1:] = best_e_level
    plt.plot(range(25), e_level_plot)
    plt.title('Energy Level of ESS at Each Time Slot')
    plt.xlabel('Time Slot')
    plt.ylabel('kWh')
    plt.grid(True)
    plt.show()
    
    # Plot home energy load and grid energy
    plt.figure(figsize=(10, 6))
    total_e_mg = best_eld_home - best_e_load_res + best_e_charge_mg - best_e_load_ess
    plt.plot(range(24), total_e_mg, 'b', label='Energy from Main Grid')
    plt.plot(range(24), best_eld_home, 'r', label='Home Load')
    plt.legend()
    plt.title('Energy Consumption Profile')
    plt.xlabel('Time Slot')
    plt.ylabel('kWh')
    plt.grid(True)
    plt.show()