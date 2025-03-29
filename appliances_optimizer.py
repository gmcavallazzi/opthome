#!/usr/bin/env python3
"""
OptHome Energy Optimizer

This script processes the JSON file exported from the OptHome app
and runs optimization algorithms to determine the best schedule for appliances.
"""

import json
import argparse
import os
from datetime import datetime
from pprint import pprint
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("optimizer.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("optimizer")

# Energy cost data - this could come from a real-time API
HOURLY_RATES = [
    {"hour": 0, "rate": 0.11, "solar_production": 0},
    {"hour": 1, "rate": 0.10, "solar_production": 0},
    {"hour": 2, "rate": 0.10, "solar_production": 0},
    {"hour": 3, "rate": 0.09, "solar_production": 0},
    {"hour": 4, "rate": 0.09, "solar_production": 0},
    {"hour": 5, "rate": 0.10, "solar_production": 0},
    {"hour": 6, "rate": 0.15, "solar_production": 0.1},
    {"hour": 7, "rate": 0.20, "solar_production": 0.6},
    {"hour": 8, "rate": 0.25, "solar_production": 1.2},
    {"hour": 9, "rate": 0.22, "solar_production": 1.8},
    {"hour": 10, "rate": 0.18, "solar_production": 2.4},
    {"hour": 11, "rate": 0.16, "solar_production": 2.8},
    {"hour": 12, "rate": 0.15, "solar_production": 3.0},
    {"hour": 13, "rate": 0.17, "solar_production": 2.9},
    {"hour": 14, "rate": 0.18, "solar_production": 2.8},
    {"hour": 15, "rate": 0.18, "solar_production": 2.5},
    {"hour": 16, "rate": 0.19, "solar_production": 1.9},
    {"hour": 17, "rate": 0.22, "solar_production": 1.2},
    {"hour": 18, "rate": 0.24, "solar_production": 0.6},
    {"hour": 19, "rate": 0.27, "solar_production": 0.2},
    {"hour": 20, "rate": 0.28, "solar_production": 0},
    {"hour": 21, "rate": 0.26, "solar_production": 0},
    {"hour": 22, "rate": 0.20, "solar_production": 0},
    {"hour": 23, "rate": 0.14, "solar_production": 0}
]

def load_appliance_data(filepath):
    """Load and parse the appliance data JSON file"""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
        logger.info(f"Successfully loaded appliance data from {filepath}")
        return data
    except Exception as e:
        logger.error(f"Error loading appliance data: {e}")
        return None

def validate_data(data):
    """Validate the structure of the loaded data"""
    if not data:
        return False
    
    required_keys = ['appliances', 'energy_profile']
    if not all(key in data for key in required_keys):
        logger.error(f"Missing required keys in data. Required: {required_keys}")
        return False
    
    if not data['appliances']:
        logger.warning("No appliances found in the data")
    
    return True

def optimize_schedule(data):
    """
    Optimize the schedule for flexible appliances based on energy profile settings
    
    This is a simplified implementation. A real optimizer would be more complex,
    potentially using linear programming or other optimization techniques.
    """
    appliances = data['appliances']
    energy_profile = data['energy_profile']
    optimization_strategy = energy_profile['optimization_strategy']
    solar_enabled = energy_profile['solar_enabled']
    
    optimized_appliances = {}
    
    # Get rates adjusted for solar if enabled
    rates = get_adjusted_rates(solar_enabled)
    
    for key, appliance in appliances.items():
        # Skip non-flexible appliances
        if not appliance['flexible']:
            optimized_appliances[key] = appliance
            continue
        
        # Create a copy of the appliance to optimize
        optimized_appliance = appliance.copy()
        
        # Get the optimal hours based on the selected strategy
        if optimization_strategy == "cost_savings":
            optimal_hours = optimize_for_cost(appliance, rates)
        elif optimization_strategy == "green_energy":
            optimal_hours = optimize_for_green_energy(appliance, rates)
        elif optimization_strategy == "balanced":
            optimal_hours = optimize_balanced(appliance, rates)
        else:  # comfort_first or fallback
            optimal_hours = optimize_for_comfort(appliance, rates)
            
        # Update the optimized appliance with new hours
        optimized_appliance['optimized_hours'] = optimal_hours
        optimized_appliance['estimated_savings'] = calculate_savings(
            appliance['power'], 
            appliance['run_duration'],
            appliance['current_hours'],
            optimal_hours,
            rates
        )
        
        optimized_appliances[key] = optimized_appliance
    
    return optimized_appliances

def get_adjusted_rates(solar_enabled):
    """Get electricity rates adjusted for solar production if enabled"""
    rates = HOURLY_RATES.copy()
    
    if solar_enabled:
        # Adjust effective rates when solar is producing
        for hour in rates:
            solar_production = hour['solar_production']
            if solar_production > 0:
                # Reduce effective rate based on solar production
                # This is a simple model - a real implementation would be more complex
                hour['effective_rate'] = max(0.01, hour['rate'] - (solar_production * 0.05))
            else:
                hour['effective_rate'] = hour['rate']
    else:
        # Without solar, effective rate is just the grid rate
        for hour in rates:
            hour['effective_rate'] = hour['rate']
    
    return rates

def optimize_for_cost(appliance, rates):
    """Optimize appliance schedule purely for cost savings"""
    # Sort hours by effective rate (lowest first)
    sorted_hours = sorted(rates, key=lambda x: x['effective_rate'])
    
    # Take the first N hours where N is the run duration
    run_duration = int(appliance['run_duration'])
    if run_duration < 1:
        run_duration = 1
        
    # Check if we need consecutive hours (like for EV charging)
    needs_consecutive = appliance['run_duration'] > 1 and 'ev' in appliance['name'].lower()
    
    if needs_consecutive:
        # Find the best block of consecutive hours
        best_start_hour = 0
        lowest_cost = float('inf')
        
        for i in range(24 - run_duration + 1):
            # Calculate cost for this consecutive block
            block_cost = sum(rates[i + j]['effective_rate'] for j in range(run_duration))
            if block_cost < lowest_cost:
                lowest_cost = block_cost
                best_start_hour = i
        
        optimal_hours = list(range(best_start_hour, best_start_hour + run_duration))
    else:
        # Just take the cheapest hours (not necessarily consecutive)
        optimal_hours = [hour['hour'] for hour in sorted_hours[:run_duration]]
    
    # Sort the hours for readability
    return sorted(optimal_hours)

def optimize_for_green_energy(appliance, rates):
    """Optimize appliance schedule for maximum solar/green energy usage"""
    # Sort hours by solar production (highest first)
    sorted_hours = sorted(rates, key=lambda x: x['solar_production'], reverse=True)
    
    # Take the first N hours with highest solar production
    run_duration = int(appliance['run_duration'])
    if run_duration < 1:
        run_duration = 1
    
    optimal_hours = [hour['hour'] for hour in sorted_hours[:run_duration]]
    
    # Sort the hours for readability
    return sorted(optimal_hours)

def optimize_balanced(appliance, rates):
    """Balance between cost, comfort, and green energy"""
    # Create a score for each hour based on multiple factors
    hour_scores = []
    
    # Get preferred time of day and convert to hours
    preferred_times = appliance['preferred_time_of_day']
    preferred_hours = []
    
    if "Morning" in preferred_times:
        preferred_hours.extend([6, 7, 8, 9, 10, 11])
    if "Afternoon" in preferred_times:
        preferred_hours.extend([12, 13, 14, 15, 16, 17])
    if "Evening" in preferred_times:
        preferred_hours.extend([18, 19, 20, 21])
    if "Night" in preferred_times:
        preferred_hours.extend([22, 23, 0, 1, 2, 3, 4, 5])
    
    # Score each hour
    for hour in rates:
        # Base score is negative of the effective rate (cheaper is better)
        cost_score = -hour['effective_rate'] * 10
        
        # Add solar production score
        green_score = hour['solar_production'] * 5
        
        # Add preference score if this is a preferred hour
        preference_score = 3 if hour['hour'] in preferred_hours else 0
        
        # Calculate total score
        total_score = cost_score + green_score + preference_score
        
        hour_scores.append({
            'hour': hour['hour'],
            'score': total_score
        })
    
    # Sort by score (highest first)
    sorted_hours = sorted(hour_scores, key=lambda x: x['score'], reverse=True)
    
    # Take the best N hours
    run_duration = int(appliance['run_duration'])
    if run_duration < 1:
        run_duration = 1
        
    optimal_hours = [hour['hour'] for hour in sorted_hours[:run_duration]]
    
    # Sort the hours for readability
    return sorted(optimal_hours)

def optimize_for_comfort(appliance, rates):
    """Optimize primarily for user comfort/convenience"""
    # For comfort, we prioritize preferred hours and only use cost as a tiebreaker
    preferred_times = appliance['preferred_time_of_day']
    preferred_hours = []
    
    if "Morning" in preferred_times:
        preferred_hours.extend([6, 7, 8, 9, 10, 11])
    if "Afternoon" in preferred_times:
        preferred_hours.extend([12, 13, 14, 15, 16, 17])
    if "Evening" in preferred_times:
        preferred_hours.extend([18, 19, 20, 21])
    if "Night" in preferred_times:
        preferred_hours.extend([22, 23, 0, 1, 2, 3, 4, 5])
    
    # If no preferences, revert to balanced approach
    if not preferred_hours:
        return optimize_balanced(appliance, rates)
    
    # Score hours with very high priority for preferred hours
    hour_scores = []
    for hour in rates:
        # Strong preference for preferred hours
        preference_score = 100 if hour['hour'] in preferred_hours else 0
        
        # Small cost factor as tiebreaker
        cost_score = -hour['effective_rate'] * 5
        
        total_score = preference_score + cost_score
        
        hour_scores.append({
            'hour': hour['hour'],
            'score': total_score
        })
    
    # Sort by score (highest first)
    sorted_hours = sorted(hour_scores, key=lambda x: x['score'], reverse=True)
    
    # Take the best N hours
    run_duration = int(appliance['run_duration'])
    if run_duration < 1:
        run_duration = 1
    
    optimal_hours = [hour['hour'] for hour in sorted_hours[:run_duration]]
    
    # Sort the hours for readability
    return sorted(optimal_hours)

def calculate_savings(power, run_duration, current_hours, optimal_hours, rates):
    """Calculate estimated savings for the optimized schedule"""
    # Convert power from watts to kilowatts
    kw = power / 1000
    
    # Get rates for current and optimal hours
    current_rates = [rates[hour]['rate'] for hour in current_hours]
    optimal_rates = [rates[hour]['effective_rate'] for hour in optimal_hours]
    
    # Calculate costs
    current_cost = sum(current_rates) * kw * run_duration / len(current_hours)
    optimal_cost = sum(optimal_rates) * kw * run_duration / len(optimal_hours)
    
    # Calculate savings
    savings = current_cost - optimal_cost
    
    return {
        'current_cost': round(current_cost, 2),
        'optimal_cost': round(optimal_cost, 2),
        'savings': round(savings, 2),
        'percentage': round((savings / current_cost) * 100 if current_cost > 0 else 0, 1)
    }

def generate_daily_schedule(optimized_appliances):
    """Generate a daily schedule with all appliances"""
    # Create a 24-hour schedule
    hours = list(range(24))
    schedule = {hour: [] for hour in hours}
    
    # Add appliances to each hour they run
    for name, appliance in optimized_appliances.items():
        run_hours = appliance.get('optimized_hours', appliance.get('current_hours', []))
        for hour in run_hours:
            schedule[hour].append({
                'name': appliance['name'],
                'power': appliance['power'],
                'flexible': appliance['flexible']
            })
    
    return schedule

def calculate_total_savings(optimized_appliances):
    """Calculate total daily and monthly savings"""
    daily_savings = 0
    for name, appliance in optimized_appliances.items():
        if 'estimated_savings' in appliance:
            daily_savings += appliance['estimated_savings']['savings']
    
    return {
        'daily': round(daily_savings, 2),
        'monthly': round(daily_savings * 30, 2),
        'yearly': round(daily_savings * 365, 2)
    }

def save_optimization_results(optimized_appliances, schedule, savings, output_path):
    """Save the optimization results to a JSON file"""
    results = {
        'timestamp': datetime.now().isoformat(),
        'optimized_appliances': optimized_appliances,
        'daily_schedule': schedule,
        'savings': savings,
        'recommendations': generate_recommendations(optimized_appliances)
    }
    
    try:
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        logger.info(f"Optimization results saved to {output_path}")
        return True
    except Exception as e:
        logger.error(f"Error saving optimization results: {e}")
        return False

def generate_recommendations(optimized_appliances):
    """Generate human-readable recommendations"""
    recommendations = []
    
    # Group appliances by time period
    morning = []
    afternoon = []
    evening = []
    night = []
    
    for name, appliance in optimized_appliances.items():
        if not appliance['flexible']:
            continue
            
        hours = appliance.get('optimized_hours', [])
        
        # Categorize by predominant time period
        if any(6 <= h <= 11 for h in hours):
            morning.append(appliance)
        elif any(12 <= h <= 17 for h in hours):
            afternoon.append(appliance)
        elif any(18 <= h <= 21 for h in hours):
            evening.append(appliance)
        elif any(h <= 5 or h >= 22 for h in hours):
            night.append(appliance)
    
    # Generate recommendations for each time period
    if morning:
        recommendations.append({
            'period': 'Morning (6:00 - 12:00)',
            'emoji': '☀️',
            'appliances': [f"Run {app['name']} at {format_hours(app['optimized_hours'])}" 
                          for app in morning]
        })
        
    if afternoon:
        recommendations.append({
            'period': 'Afternoon (12:00 - 18:00)',
            'emoji': '🌤️',
            'appliances': [f"Run {app['name']} at {format_hours(app['optimized_hours'])}" 
                          for app in afternoon]
        })
        
    if evening:
        recommendations.append({
            'period': 'Evening (18:00 - 00:00)',
            'emoji': '🌙',
            'appliances': [f"Run {app['name']} at {format_hours(app['optimized_hours'])}" 
                          for app in evening]
        })
        
    if night:
        recommendations.append({
            'period': 'Night (00:00 - 6:00)',
            'emoji': '🌃',
            'appliances': [f"Run {app['name']} at {format_hours(app['optimized_hours'])}" 
                          for app in night]
        })
    
    return recommendations

def format_hours(hours):
    """Format hours array as a readable string"""
    if not hours:
        return "N/A"
        
    # Format each hour as HH:00
    formatted = [f"{h:02d}:00" for h in sorted(hours)]
    
    # Special case for consecutive hours
    if len(hours) > 1 and max(hours) - min(hours) == len(hours) - 1:
        return f"{formatted[0]}-{int(formatted[-1].split(':')[0])+1:02d}:00"
    
    return ", ".join(formatted)

def main():
    """Main function to run the optimizer"""
    parser = argparse.ArgumentParser(description="OptHome Energy Optimizer")
    parser.add_argument('--input', '-i', required=True, help="Path to the appliances JSON file")
    parser.add_argument('--output', '-o', default="optimized_schedule.json", 
                       help="Path to save the optimized schedule (default: optimized_schedule.json)")
    parser.add_argument('--verbose', '-v', action='store_true', help="Print detailed information")
    
    args = parser.parse_args()
    
    # Load and validate data
    data = load_appliance_data(args.input)
    if not validate_data(data):
        logger.error("Invalid data format. Cannot proceed with optimization.")
        return 1
    
    # Optimize schedules
    logger.info("Optimizing appliance schedules...")
    optimized_appliances = optimize_schedule(data)
    
    # Generate daily schedule
    daily_schedule = generate_daily_schedule(optimized_appliances)
    
    # Calculate total savings
    total_savings = calculate_total_savings(optimized_appliances)
    
    # Print results if verbose
    if args.verbose:
        pprint(optimized_appliances)
        print("\nTotal savings:")
        pprint(total_savings)
    
    # Save results
    if save_optimization_results(optimized_appliances, daily_schedule, total_savings, args.output):
        logger.info(f"Optimization complete! Saved results to {args.output}")
        logger.info(f"Daily savings: €{total_savings['daily']}, Monthly: €{total_savings['monthly']}")
    else:
        logger.error("Failed to save optimization results.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())