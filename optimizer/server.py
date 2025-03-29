from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import subprocess
import os

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Server is running!'})

@app.route('/api/optimize', methods=['POST'])
def optimize():
    try:
        # Get JSON data from request
        data = request.json
        
        # Save data to a temporary file
        with open('appliances.json', 'w') as f:
            json.dump(data, f)
        
        # Run the Python optimizer script
        result = subprocess.run(
            ['python', 'mainv2.0.py'],
            capture_output=True,
            text=True
        )
        
        # Check if optimization was successful
        if result.returncode != 0:
            return jsonify({
                'success': False,
                'error': result.stderr
            }), 400
            
        # Read the optimized results
        with open('optimized_appliances.json', 'r') as f:
            optimized_data = json.load(f)
            
        return jsonify({
            'success': True,
            'data': optimized_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)