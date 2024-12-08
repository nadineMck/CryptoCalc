from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

@app.route('/api/calculate', methods=['POST'])
def calculate():
    # return jsonify({'message': 'Hello from Flask!'})
    # Get JSON data from the request
    data = request.get_json()
    
    # Extract information from the data (example)
    oper = data.get('operation', 'NaN')  # Default to 0 if not provided
    inp = data.get('inputformat', 'NaN')  # Default to 0 if not provided
    out = data.get('outputformat', 'NaN')  # Default to 0 if not provided
    poly1 = data.get('polynomial1', 'NaN')
    poly2 = data.get('polynomial2', 'NaN')
    # Perform a simple calculation
    oper = oper + " " + poly1 + poly2


    # Return the result as JSON
    return jsonify({'operation1': oper, 'inpformat': inp, 'outformat': out})
if __name__ == '__main__':
    app.run(debug=True)
