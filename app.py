from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS 
import sqlite3 
import requests 
import json
import random

app = Flask(__name__) 
CORS(app) 

def get_db_connection():
    conn = sqlite3.connect('time_capsule.db') 
    conn.row_factory = sqlite3.Row 
    return conn 

def get_historical_weather(lat, lon, date):
    try:
        weather_url = (
            f"https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={lat}&longitude={lon}&start_date={date}&end_date={date}"
            f"&daily=temperature_2m_max,temperature_2m_min,weathercode,"
            f"sunrise,sunset,daylight_duration,sunshine_duration,"
            f"rain_sum,precipitation_hours,wind_speed_10m_max,"
            f"wind_gusts_10m_max,wind_direction_10m_dominant,"
            f"relative_humidity_2m_mean"
            f"&timezone=auto"
        )

        weather_response = requests.get(weather_url, timeout=5)
        weather_data = weather_response.json()
        daily = weather_data['daily']

        daylight_seconds = daily.get('daylight_duration', [0])[0]
        hours = int(daylight_seconds // 3600)
        minutes = int((daylight_seconds % 3600) // 60)

        sunshine_seconds = daily.get('sunshine_duration', [0])[0]
        sunshine_hours = int(sunshine_seconds // 3600)
        sunshine_minutes = int((sunshine_seconds % 3600) // 60)

        return {
            "max_temp": daily['temperature_2m_max'][0],
            "min_temp": daily['temperature_2m_min'][0],
            "code": daily['weathercode'][0],
            "sunrise": daily.get('sunrise', [''])[0],
            "sunset": daily.get('sunset', [''])[0],

            "daylight_hours": hours,
            "daylight_minutes": minutes,

            "sunshine_hours": sunshine_hours,
            "sunshine_minutes": sunshine_minutes,

            "rain_mm": daily.get('rain_sum', [0])[0],
            "precipitation_hours": daily.get('precipitation_hours', [0])[0],
            "humidity": daily.get('relative_humidity_2m_mean', [0])[0],
            "wind_speed": daily.get('wind_speed_10m_max', [0])[0],
            "wind_gusts": daily.get('wind_gusts_10m_max', [0])[0],
            "wind_direction": daily.get('wind_direction_10m_dominant', [0])[0]
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

def get_historical_entertainment(target_date):
    """
    Fetches and formats random movies and songs from the entertainment dataset.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT movies, songs FROM entertainment WHERE date = ?", (target_date,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            # Parsing the stringified JSON from the database
            movies_list = json.loads(row["movies"])
            songs_list = json.loads(row["songs"])
            
            selected_movie = random.choice(movies_list)
            movie_title, movie_url = selected_movie.split(', ', 1)
            
            selected_songs = random.sample(songs_list, min(3, len(songs_list)))
            formatted_songs = [{"title": s.split(', ', 1)[0], "url": s.split(', ', 1)[1]} for s in selected_songs]
            
            return {
                "movie": {"title": movie_title, "url": movie_url},
                "songs": formatted_songs
            }
            
        return None
        
    except Exception as e:
        print(f"Entertainment database error: {e}")
        return None

def get_historical_economy(target_date):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT gold_price, silver_price, usd_rate FROM historical_data WHERE date = ?", (target_date,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "gold": row["gold_price"],
                "silver": row["silver_price"],
                "usd": row["usd_rate"]
            }
        return None
        
    except Exception as e:
        print(f"Economy database error: {e}")
        return None

@app.route('/movie_posters/<filename>')
def movie_poster(filename):
    return send_from_directory(
        'movie_posters',
        filename
    )

@app.route('/api/capsule', methods=['GET']) 
def get_capsule_data():
    date_param = request.args.get('date') 
    lat = request.args.get('lat', 28.6139) 
    lon = request.args.get('lon', 77.2090) 
    
    if not date_param: 
        return jsonify({"error": "Date parameter is required"}), 400 
            
    weather_data = get_historical_weather(lat, lon, date_param) 
    news_data = get_historical_news(date_param)
    entertainment_data = get_historical_entertainment(date_param)
    economy_data = get_historical_economy(date_param)

    payload = {
        "date": date_param, 
        "weather": weather_data, 
        "news": news_data,
        "entertainment": entertainment_data,
        "economy": economy_data
    }
    
    return jsonify(payload), 200 

if __name__ == '__main__': 
    app.run(debug=True, port=5000)