from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from google import genai
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app) 

# Google API for summary
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def get_db_connection():
    conn = sqlite3.connect('time_capsule.db')
    conn.row_factory = sqlite3.Row # Returns rows as dictionaries
    return conn

def get_historical_weather(city, date):
    try:
        # fetching coordinates
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1"
        geo_data = requests.get(geo_url).json()
        
        if not geo_data.get('results'):
            return "Weather data unavailable for this city."
            
        lat = geo_data['results'][0]['latitude']
        lon = geo_data['results'][0]['longitude']
        
        # fetching the actual weather
        weather_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={date}&end_date={date}&daily=temperature_2m_max,temperature_2m_min&timezone=auto"
        weather_data = requests.get(weather_url).json()
        
        max_temp = weather_data['daily']['temperature_2m_max'][0]
        min_temp = weather_data['daily']['temperature_2m_min'][0]
        
        return f"High of {max_temp}°C, Low of {min_temp}°C"
    except Exception as e:
        print(f"Weather API Error: {e}")
        return "Weather data currently unavailable."

@app.route('/api/capsule', methods=['GET'])
def get_capsule_data():
    date_requested = request.args.get('date')
    city_requested = request.args.get('city', 'India')  
    
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

    #AI summary
    news = db_data['news_headline']
    weather_string = get_historical_weather(city_requested, date_requested)

    prompt = f"Write a nostalgic, 2-sentence first-person memory about living in {city_requested} on {date_requested}. Mention this news organically: '{news}'. Keep it cinematic and atmospheric."

    try:
        ai_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        ai_story = ai_response.text.strip()
    except Exception as e:
        print(f"AI Error: {e}")
        ai_story = "The memory of this day is a bit hazy..."
    
    # Construct the final response
    response = {
        "date": db_data['date'],
        "gold_price": db_data['gold_price'],
        "silver_price": db_data['silver_price'],
        "news_headline": db_data['news_headline'],
        "weather": weather_string,
        "ai_story": ai_story
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=5000)