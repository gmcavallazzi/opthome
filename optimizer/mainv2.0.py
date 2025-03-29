import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import random
from datetime import datetime
import json
import hems_utils as utils
from json_loader import load_appliances_from_json
from generate_optimized_json import generate_optimized_json
from month_and_dayconv import day_of_year

plt.rcParams.update({
    "text.usetex": True,
    "font.size": 20
})

class HEMS_BPSO:
    def __init__(self, json_path=None):
        # PSO parameters
        self.max_iterations = 50 
        self.population_size = 10 
        self.w = 1.0  
        self.w_damp = 0.99
        self.c1 = 2.0  
        self.c2 = 2.0  
        
        # Date information
        self.day = '12'
        self.month = '03'
        self.year = '2025'
        
        # Objective function weights
        self.w1 = 0.75  # Cost weight
        self.w2 = 1.0 - self.w1  # PAR weight
        
        # Battery parameters 
        self.max_level = 3.5
        self.max_true_level = 3.35
        self.min_level = 0.5
        self.charge_rate = 0.3
        self.discharge_rate = 0.3
        self.efficiency = 0.95
        self.res_area = 10  # Solar panel area in m²
        
        self.time_slots = 24
        self.json_path = json_path
        
        # Load data
        self.load_data()
        self.setup_variables()
    
    def load_data(self):
        """Load appliance data, RES generation and DAP pricing"""
        data_folder = "./DATA/"
        
        # Load appliances from JSON if provided
        if self.json_path:
            shift_data, non_shift_data, self.appliance_names, self.energy_profile = load_appliances_from_json(self.json_path)
            
            # Extract battery and solar settings
            battery_settings = self.energy_profile.get('battery_settings', {})
            self.min_level = battery_settings.get('min_reserve', 30) / 100 * self.max_level
            self.solar_enabled = self.energy_profile.get('solar_enabled', True)
            
            # Prepare shiftable appliances data
            num_appliances = len(shift_data)
            self.shiftable = shift_data[:, :2]  # Power and runtime
            
            # Set earliest and latest start times
            self.est = 6  # Default earliest start time
            self.lst = shift_data[:, 2].astype(int)  # Latest start time from JSON
            
            # Prepare non-shiftable appliances data
            self.non_shiftable = non_shift_data
            
            print(f"Loaded {num_appliances} shiftable appliances from JSON")
            print(f"Loaded {len(self.non_shiftable)} non-shiftable appliances from JSON")
        else:
            # Fallback to txt files if no JSON provided
            # Load shiftable appliances
            shift_data, self.appliance_names = utils.load_shiftable_appliances(data_folder + "SHIFT_APPLIANCES.txt")
            num_appliances = len(shift_data)
            self.shiftable = np.zeros((num_appliances, 2))
            
            for i in range(num_appliances):
                self.shiftable[i, 0] = shift_data[i, 0]  # Power in kW
                self.shiftable[i, 1] = shift_data[i, 1]  # Runtime in hours
            
            # Set earliest and latest start times
            self.est = 6  # Default earliest start time
            self.lst = np.zeros(num_appliances, dtype=int)
            for i in range(num_appliances):
                self.lst[i] = int(shift_data[i, 2]) if shift_data.shape[1] > 2 else 21
            
            print(f"Loaded {num_appliances} shiftable appliances")
            
            # Load non-shiftable appliances
            self.non_shiftable = utils.load_non_shiftable_appliances(data_folder + "NONSHIFT_APPLIANCES.txt")
            print(f"Loaded {len(self.non_shiftable)} non-shiftable appliances")
            
            # Default energy profile
            self.energy_profile = {
                "optimization_strategy": "cost_savings",
                "solar_enabled": True,
                "battery_settings": {
                    "min_reserve": 30,
                    "strategy": "peak_price"
                }
            }
            self.solar_enabled = True
        
        # Load DAP pricing
        try:
            url = "https://www.omie.es/pt/file-download?parents=marginalpdbcpt&filename=marginalpdbcpt_"+str(self.year)+str(self.month)+str(self.day)+".1"
            hours, portugal_prices = utils.fetch_omie_prices(url)
            portugal_prices = np.array(portugal_prices) * 0.1  # Convert to appropriate units
            
            # Create DAP matrix
            self.dap = np.zeros((24, 3))
            for i in range(24):
                self.dap[i, 0] = i
                self.dap[i, 1] = i + 1
                self.dap[i, 2] = portugal_prices[i]
            print("Loaded DAP data")
            #plt.figure(figsize=(10,6))
            #plt.plot(self.dap[:,2])
            #plt.ylabel('cent')
            #plt.grid()
            #plt.tight_layout()
        except Exception as e:
            print(f"Warning: Could not load DAP data: {e}")
            # Fallback to synthetic data
            self.dap = np.zeros((24, 3))
            self.dap[:, 0] = np.arange(24)  # Time slot
            self.dap[:, 1] = np.arange(1, 25)  # Hour
            self.dap[:, 2] = 0.10 + 0.05 * np.sin(np.linspace(0, 2*np.pi, 24))  # Price in $/kWh
        
        # Load RES (solar) data - only if solar is enabled
        if self.solar_enabled:
            try:
                API_KEY = "RopTwtR9EdSizvSO3s5hF67OQ6peTq1LadnheY1g"
                lat, lon = 38.7169, -9.1399  # Coordinates for Lisbon, Portugal
                daily_data = utils.fetch_solar_data(API_KEY, lat, lon, day_of_year=day_of_year(int(str(self.month)),int(str(self.day))))
                
                self.res = np.zeros((24, 3))
                for i in range(24):
                    self.res[i, 0] = i  # Time slot
                    self.res[i, 1] = i + 1  # Hour
                    self.res[i, 2] = daily_data[i]  # Energy generation in kWh/m²
                
                print("Loaded RES data")
                #plt.figure(figsize=(8,6))
                #plt.plot(daily_data)
                #plt.grid()
            except Exception as e:
                print(f"Warning: Could not load RES data: {e}")
                # Fallback to synthetic data
                self.res = np.zeros((24, 3))
                self.res[:, 0] = np.arange(24)  # Time slot
                self.res[:, 1] = np.arange(1, 25)  # Hour
                self.res[:, 2] = 2.0 * np.sin(np.linspace(0, np.pi, 24))  # Energy in kWh/m²
        else:
            # No solar generation if disabled
            self.res = np.zeros((24, 3))
            self.res[:, 0] = np.arange(24)
            self.res[:, 1] = np.arange(1, 25)
            self.res[:, 2] = 0.0  # No solar generation
        
        # Create time matrix for non-shiftable appliances
        self.time_non_shift = np.zeros((len(self.non_shiftable), 24))
        for i in range(len(self.non_shiftable)):
            start = int(self.non_shiftable[i, 2])
            duration = int(self.non_shiftable[i, 1])
            if start == 0:
                self.time_non_shift[i, 0:duration] = 1
            else:
                end = min(start+duration, 24)  # Ensure we don't exceed array bounds
                self.time_non_shift[i, start:end] = 1

    def setup_variables(self):
        """Set up variables for the optimization problem"""
        self.n_var = 24  # Battery modes
        
        # For binary encoding
        for i in range(len(self.lst)):
            self.n_var += self.lst[i] - self.est + 1
        
        # Time slot jumps for each appliance
        self.mat_slots = np.zeros(len(self.shiftable), dtype=int)
        value = 0
        for j in range(len(self.shiftable)):
            value += self.lst[j] - self.est + 1
            self.mat_slots[j] = value
    
    def sigmoid(self, v):
        """Sigmoid function for binary PSO"""
        s = 1/(1 + np.exp(-v))
        return 1 if random.random() < s else 0, s
    
    def optimize(self):
        """Main PSO optimization loop"""
        # Initialize particles
        particles = []
        num_appliances = len(self.shiftable)
        
        for i in range(self.population_size):
            particle = {
                'position': np.zeros(self.n_var),
                'velocity': np.zeros(self.n_var),
                'cost': float('inf'),
                'best_position': np.zeros(self.n_var),
                'best_cost': float('inf')
            }
            
            # Initialize appliance part of position vector
            for j in range(num_appliances):
                if j == 0:
                    for p in range(self.mat_slots[j]):
                        particle['position'][p] = random.randint(0, 1)
                else:
                    # Ensure we're in bounds
                    start_idx = int(self.mat_slots[j-1])
                    end_idx = int(self.mat_slots[j])
                    if start_idx < end_idx and start_idx < self.n_var-24:
                        for p in range(start_idx, end_idx):
                            particle['position'][p] = random.randint(0, 1)
            
            # Initialize battery modes
            for p in range(self.n_var - 24, self.n_var):
                particle['position'][p] = random.randint(0, 1)
            
            try:
                # Ensure feasibility
                matriz, particle['position'][:self.n_var-24], start_time = utils.appliance_treatment(
                    particle['position'][:self.n_var-24], self.shiftable, self.mat_slots, self.est)
                
                particle['position'][self.n_var-24:], e_level = utils.correct_battery_modes(
                    particle['position'][self.n_var-24:], self.charge_rate, self.efficiency, 
                    self.max_level, self.max_true_level, self.min_level)
                
                # Evaluate
                matrix = utils.position_to_matrix(
                    particle['position'], matriz, start_time, self.shiftable, self.est)
                
                particle['cost'], *_ = utils.objective_function(
                    matrix, self.shiftable, self.non_shiftable, self.time_non_shift, 
                    self.res, self.dap, self.w1, self.w2, self.res_area, self.charge_rate)
                
                # Update personal best
                particle['best_position'] = particle['position'].copy()
                particle['best_cost'] = particle['cost']
                
                particles.append(particle)
            except Exception as e:
                print(f"Error initializing particle {i}: {e}")
                # Generate a default particle if there's an error
                particle['position'] = np.random.randint(0, 2, size=self.n_var)
                particle['cost'] = float('inf')
                particle['best_position'] = particle['position'].copy()
                particle['best_cost'] = float('inf')
                particles.append(particle)
        
        # Initialize global best
        global_best = {
            'position': np.zeros(self.n_var),
            'cost': float('inf')
        }
        
        # Initialize best cost history
        best_costs = np.zeros(self.max_iterations)
        
        # Main loop
        for it in range(self.max_iterations):
            for i in range(self.population_size):
                try:
                    # Update velocity
                    particle = particles[i]
                    particle['velocity'] = (self.w * particle['velocity'] + 
                                           self.c1 * np.random.rand(self.n_var) * (particle['best_position'] - particle['position']) +
                                           self.c2 * np.random.rand(self.n_var) * (global_best['position'] - particle['position']))
                    
                    # Update position
                    for p in range(self.n_var):
                        v = particle['velocity'][p]
                        x, _ = self.sigmoid(v)
                        particle['position'][p] = x
                    
                    # Ensure feasibility
                    matriz, particle['position'][:self.n_var-24], start_time = utils.appliance_treatment(
                        particle['position'][:self.n_var-24], self.shiftable, self.mat_slots, self.est)
                    
                    particle['position'][self.n_var-24:], e_level = utils.correct_battery_modes(
                        particle['position'][self.n_var-24:], self.charge_rate, self.efficiency, 
                        self.max_level, self.max_true_level, self.min_level)
                    
                    # Evaluate
                    matrix = utils.position_to_matrix(
                        particle['position'], matriz, start_time, self.shiftable, self.est)
                    
                    particle['cost'], cost, par, e_load_res, e_charge_mg, eld_home, e_selling_ess, e_load_ess = utils.objective_function(
                        matrix, self.shiftable, self.non_shiftable, self.time_non_shift, 
                        self.res, self.dap, self.w1, self.w2, self.res_area, self.charge_rate)
                    
                    # Update personal best
                    if particle['cost'] < particle['best_cost']:
                        particle['best_position'] = particle['position'].copy()
                        particle['best_cost'] = particle['cost']
                        
                        # Update global best
                        if particle['best_cost'] < global_best['cost']:
                            global_best['position'] = particle['best_position'].copy()
                            global_best['cost'] = particle['best_cost']
                            
                            # Save best metrics
                            self.best_cost = cost
                            self.best_par = par
                            self.best_matrix = matrix
                            self.best_e_level = e_level
                            self.best_e_load_res = e_load_res
                            self.best_e_charge_mg = e_charge_mg
                            self.best_eld_home = eld_home
                            self.best_e_selling_ess = e_selling_ess
                            self.best_e_load_ess = e_load_ess
                            self.best_start_time = start_time
                except Exception as e:
                    print(f"Error in iteration {it}, particle {i}: {e}")
                    continue
            
            # Store best cost
            best_costs[it] = global_best['cost']
            
            # Display iteration info
            print(f"Iteration {it+1}: Best Cost = {best_costs[it]}")
            
            # Update inertia weight
            self.w *= self.w_damp
        
        # Process final results
        self.best_costs = best_costs
        self.get_appliance_start_times()
        
        return best_costs
    
    def get_appliance_start_times(self):
        """Get starting times for appliances from best solution"""
        num_appliances = len(self.shiftable)
        best_time_matrix = self.best_matrix[:num_appliances, :]
        self.start_times = np.zeros(num_appliances)
        
        for i in range(num_appliances):
            for j in range(24):
                if best_time_matrix[i, j] == 1:
                    self.start_times[i] = j
                    break
    
    def plot_results(self):
        """Plot optimization results"""
        # Plot convergence
        #plt.figure(figsize=(10, 6))
        #plt.semilogy(self.best_costs, linewidth=2)
        #plt.xlabel('Iteration')
        #plt.ylabel('Best Cost')
        #plt.title('Best Cost Evolution - PSO Algorithm')
        #plt.grid(True)
        #plt.tight_layout()
        # Plot ESS energy level
        #plt.figure(figsize=(10, 6))
        e_level_plot = np.zeros(25)
        e_level_plot[0] = 0.5
        e_level_plot[1:] = self.best_e_level
        #plt.plot(range(25), e_level_plot)
        #plt.title('Energy Level of ESS at Each Time Slot')
        #plt.xlabel('Time Slot')
        #plt.ylabel('kWh')
        #plt.grid(True)
        
        # Plot home energy load and grid energy
        #plt.figure(figsize=(10, 6))
        total_e_mg = self.best_eld_home - self.best_e_load_res + self.best_e_charge_mg - self.best_e_load_ess
        #plt.plot(range(24), total_e_mg, 'b', label='Energy from Main Grid')
        #plt.plot(range(24), self.best_eld_home, 'r', label='Home Load')
        #plt.legend()
        #plt.title('Energy Consumption Profile')
        #plt.xlabel('Time Slot')
        #plt.ylabel('kWh')
        #plt.grid(True)

    
    def print_results(self):
        """Print optimization results"""
        print("\nOptimization Results:")
        print(f"Total Price for consumed daily energy: ${self.best_cost:.2f}")
        print(f"Peak Average Ratio of the household: {self.best_par:.2f}")
        print(f"Solution obtained with {self.max_iterations} iterations and {self.population_size} particles")
        
        print("\nAppliances                Usage (Hours)                Start Time")
        # Use the loaded appliance names if available
        num_appliances = len(self.shiftable)
        
        for i in range(num_appliances):
            if i < len(self.start_times):  # Make sure we have valid start times
                start_hour = self.start_times[i] - 1 if self.start_times[i] > 0 else 0
                # Use the actual appliance name from the loaded data
                appliance_name = self.appliance_names[i] if i < len(self.appliance_names) else f"Appliance {i+1}"
                # Truncate the name if it's too long
                if len(appliance_name) > 18:
                    appliance_name = appliance_name[:15] + "..."
                print(f"{appliance_name:<20} {int(self.shiftable[i, 1]):>2} Hours                      {int(start_hour):>2}:00")
    
    
    def generate_output_json(self, output_path):
        """Generate the optimized JSON output with detailed battery information"""
        # Prepare the optimization results
        optimization_results = {
            "start_times": self.start_times,
            "dap": self.dap[:, 2]/100.0,  # Extract just the prices
            "best_cost": self.best_cost,
            "best_par": self.best_par,
            "best_matrix": self.best_matrix,
            "best_e_level": self.best_e_level,  # Battery energy levels
            "battery_modes": self.best_matrix[-1, :],  # Last row of matrix has battery modes
            "best_eld_home": self.best_eld_home,
            "best_e_load_res": self.best_e_load_res,
            "best_e_charge_mg": self.best_e_charge_mg,
            "best_e_load_ess": self.best_e_load_ess,
            "best_e_selling_ess": self.best_e_selling_ess,
            "res": self.res  # Solar production data
        }
    
        # Generate the optimized JSON
        return generate_optimized_json(self.json_path, optimization_results, output_path)
# Usage example
if __name__ == "__main__":
    # Set the path to your JSON file
    json_path = "./appliances.json"
    output_path = "./optimized_appliances.json"
    
    # Create the HEMS instance with JSON input
    hems = HEMS_BPSO(json_path)
    
    # Run the optimization
    hems.optimize()
    
    # Print and plot results
    hems.print_results()
    hems.plot_results()
    
    # Generate optimized JSON output
    hems.generate_output_json(output_path)
