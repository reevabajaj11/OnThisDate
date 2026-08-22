import sqlite3
import csv
from datetime import date, timedelta

def setup_database_with_real_data(gold_csv, silver_csv):
    conn = sqlite3.connect('time_capsule.db')
    cursor = conn.cursor()

    # ADDED: usd_rate column
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS historical_data (
            date TEXT PRIMARY KEY,
            gold_price REAL,
            silver_price REAL,
            usd_rate REAL,
            news_headline TEXT
        )
    ''')

    # Getting gold data
    real_gold_data = {}      
    exchange_rates = {}      
    
    with open(gold_csv, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            csv_date = row['Date'] 
            
            if csv_date.startswith('2006') and row['INR'] and row['USD']:
                clean_inr_oz = float(row['INR'].replace(',', ''))
                clean_usd_oz = float(row['USD'].replace(',', ''))
                
                daily_fx_rate = clean_inr_oz / clean_usd_oz
                exchange_rates[csv_date] = daily_fx_rate
                
                inr_10g = (clean_inr_oz / 31.1034768) * 10
                real_gold_data[csv_date] = inr_10g

    # Getting Silver Data
    real_silver_data = {}    
    
    with open(silver_csv, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            csv_date = row['date'] 
            
            if csv_date.startswith('2006') and csv_date in exchange_rates and row['price']:
                clean_silver_usd_oz = float(row['price'])
                silver_inr_oz = clean_silver_usd_oz * exchange_rates[csv_date]
                silver_inr_kg = silver_inr_oz / 0.0311034768
                real_silver_data[csv_date] = silver_inr_kg

    start_date = date(2006, 1, 1)
    end_date = date(2006, 12, 31)
    current_date = start_date
    
    records_to_insert = []
    
    # Starting base values for early Jan 2006
    last_known_gold = 7448.0
    last_known_silver = 13500.0 
    last_known_usd = 45.00 # Base rate for early 2006

    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        
        if date_str in real_gold_data:
            last_known_gold = real_gold_data[date_str]
        
        if date_str in real_silver_data:
            last_known_silver = real_silver_data[date_str]
            
        if date_str in exchange_rates:
            last_known_usd = exchange_rates[date_str]

        # Baseline headline
        headline = "Economic growth continues steadily across major Indian sectors."
        
        # Injecting real historical facts for authenticity
        if date_str == "2006-08-04":
            headline = "Pluto officially demoted to dwarf planet status by the IAU."
        elif date_str == "2006-07-11":
            headline = "Mumbai local trains hit by tragic coordinated bombings."
        elif date_str == "2006-03-21":
            headline = "Twitter is founded, sending its first-ever micro-message."

        records_to_insert.append((
            date_str, 
            round(last_known_gold, 2), 
            round(last_known_silver, 2), 
            round(last_known_usd, 2), # ADDED USD RATE
            headline
        ))
        
        current_date += timedelta(days=1)

    # UPDATED INSERT STATEMENT
    cursor.executemany('''
        INSERT OR REPLACE INTO historical_data (date, gold_price, silver_price, usd_rate, news_headline)
        VALUES (?, ?, ?, ?, ?)
    ''', records_to_insert)

    conn.commit()
    conn.close()
    
    print("Successfully seeded 365 days of 2006, including daily USD rates.")

if __name__ == '__main__':
    setup_database_with_real_data('Daily.csv', 'silver_price.csv')