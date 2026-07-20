from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import requests
import json

app = Flask(__name__)
CORS(app) 

def get_db_connection():
    conn = sqlite3.connect('time_capsule.db')
    conn.row_factory = sqlite3.Row 
    return conn

def get_historical_weather(lat, lon, date):
    """
    Fetches historical weather data. 
    Now accepts exact coordinates (lat, lon) directly from the React frontend.
    """
    try:
        weather_url = (
            f"https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={lat}&longitude={lon}&start_date={date}&end_date={date}"
            f"&daily=temperature_2m_max,temperature_2m_min&timezone=auto"
        )
        weather_response = requests.get(weather_url, timeout=5)
        weather_data = weather_response.json()
        
        max_temp = weather_data['daily']['temperature_2m_max'][0]
        min_temp = weather_data['daily']['temperature_2m_min'][0]
        
        return f"High of {max_temp}°C, Low of {min_temp}°C"
        
    except requests.exceptions.RequestException as e:
        print(f"Network error during weather fetch: {e}")
        return "Weather archives are temporarily unreachable."
    except (KeyError, IndexError) as e:
        print(f"Data parsing error: {e}")
        return "Weather data incomplete for this date."

@app.route('/api/capsule', methods=['GET'])
def get_capsule_data():
    date_requested = request.args.get('date')
    city_requested = request.args.get('city')  
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not date_requested:
        return jsonify({"error": "Missing required parameter: 'date'"}), 400
    if not lat or not lon:
        return jsonify({"error": "Missing precise location coordinates"}), 400

    conn = get_db_connection()
    db_data = conn.execute(
        'SELECT * FROM historical_data WHERE date = ?', 
        (date_requested,)
    ).fetchone()
    conn.close()

    if db_data is None:
        return jsonify({"error": f"No data found! Try 2006-08-04 or 2006-01-01."}), 404

    weather_string = get_historical_weather(lat, lon, date_requested)
    
    raw_news = db_data['news_headline']
    parsed_news = []
    
    if raw_news:
        try:
            parsed_news = json.loads(raw_news)
        except json.JSONDecodeError:
            # Fallback just in case a row still has old, unformatted string data
            parsed_news = [raw_news]
    
    # Build the final response
    response = {
        "date": db_data['date'],
        "gold_price": db_data['gold_price'],
        "silver_price": db_data['silver_price'],
        "news": parsed_news, # Passing the clean array to React
        "weather": weather_string
    }

    return jsonify(response), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)