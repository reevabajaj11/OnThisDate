from flask import Flask, request, jsonify 
from flask_cors import CORS 
import sqlite3 
import requests 

app = Flask(__name__) 
CORS(app) 

def get_db_connection():
    conn = sqlite3.connect('time_capsule.db') 
    conn.row_factory = sqlite3.Row 
    return conn 

def get_historical_weather(lat, lon, date):
    """
    Fetches historical weather data, including sunrise, sunset, and daylight duration.
    """
    try:
        weather_url = (
            f"https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={lat}&longitude={lon}&start_date={date}&end_date={date}"
            f"&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset,daylight_duration&timezone=auto"
        ) 
        weather_response = requests.get(weather_url, timeout=5) 
        weather_data = weather_response.json() 
        
        daily = weather_data['daily'] 
        daylight_seconds = daily.get('daylight_duration', [0])[0] 
        hours = int(daylight_seconds // 3600) 
        minutes = int((daylight_seconds % 3600) // 60) 
        
        return {
            "max_temp": daily['temperature_2m_max'][0], 
            "min_temp": daily['temperature_2m_min'][0], 
            "code": daily['weathercode'][0], 
            "sunrise": daily.get('sunrise', [''])[0], 
            "sunset": daily.get('sunset', [''])[0], 
            "daylight_hours": hours, 
            "daylight_minutes": minutes 
        }
        
    except Exception as e: 
        print(f"Weather fetch error: {e}") 
        return None 

def get_historical_news(target_date):
    """
    Fetches exactly 4 random headlines for a specific date from the Indian Express dataset.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Pull 4 random headlines for the exact requested date
        cursor.execute("""
            SELECT headline, source_url 
            FROM detailed_historical_events 
            WHERE event_date = ? 
            ORDER BY RANDOM() 
            LIMIT 4
        """, (target_date,))
        
        rows = cursor.fetchall()
        conn.close()
        
        # Return cleanly mapped dictionaries
        return [{"headline": row["headline"], "url": row["source_url"]} for row in rows]
        
    except Exception as e:
        print(f"Database error: {e}")
        return []

@app.route('/api/capsule', methods=['GET']) 
def get_capsule_data():
    date_param = request.args.get('date') 
    lat = request.args.get('lat', 28.6139) 
    lon = request.args.get('lon', 77.2090) 
    
    if not date_param: 
        return jsonify({"error": "Date parameter is required"}), 400 
            
    weather_data = get_historical_weather(lat, lon, date_param) 
    news_data = get_historical_news(date_param)

    payload = {
        "date": date_param, 
        "weather": weather_data, 
        "news": news_data 
    }
    
    return jsonify(payload), 200 

if __name__ == '__main__': 
    app.run(debug=True, port=5000) 