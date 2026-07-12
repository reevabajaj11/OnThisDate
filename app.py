from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app) 

def get_db_connection():
    conn = sqlite3.connect('time_capsule.db')
    conn.row_factory = sqlite3.Row # Returns rows as dictionaries
    return conn

@app.route('/api/capsule', methods=['GET'])
def get_capsule_data():
    date_requested = request.args.get('date')
    
    if not date_requested:
        return jsonify({"error": "Please provide a date"}), 400

    conn = get_db_connection()
    # Fetch DB data
    db_data = conn.execute(
        'SELECT * FROM historical_data WHERE date = ?', 
        (date_requested,)
    ).fetchone()
    conn.close()

    if db_data is None:
        return jsonify({"error": "No data found for this date"}), 404

    # TODO: Add External Weather API and AI Generation logic here later
    
    # Construct the final response
    response = {
        "date": db_data['date'],
        "gold_price": db_data['gold_price'],
        "silver_price": db_data['silver_price'],
        "news_headline": db_data['news_headline'],
        "weather": "28°C, Clear Skies (Placeholder)",
        "ai_story": "It was a busy day in 2006... (Placeholder)"
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=5000)