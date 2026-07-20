import pandas as pd
import sqlite3
import json

def seed_news_headlines(csv_filepath, db_filepath):
    print("Loading and filtering the massive news dataset. This might take a minute...")
    
    df = pd.read_csv(csv_filepath, usecols=['publish_date', 'headline_text'])
    
    # Convert integer date (20060101) to string
    df['publish_date'] = df['publish_date'].astype(str)
    
    # Filter strictly for the year 2006
    df_2006 = df[df['publish_date'].str.startswith('2006')].copy()
    
    # Reformat date to match our database (YYYY-MM-DD)
    df_2006['formatted_date'] = pd.to_datetime(df_2006['publish_date'], format='%Y%m%d').dt.strftime('%Y-%m-%d')
    
    print(f"Found {len(df_2006)} total headlines for 2006. Grouping and sampling...")

    # Group by the date and pick exactly 4 random headlines per day
    # If a day somehow has less than 4, we take whatever is available
    sampled_news = df_2006.groupby('formatted_date').sample(n=4, replace=True).drop_duplicates()
    
    # Aggregate those 4 headlines into a single list per date
    daily_news_dict = sampled_news.groupby('formatted_date')['headline_text'].apply(list).to_dict()

    print("Connecting to the database to inject the data...")
    conn = sqlite3.connect(db_filepath)
    cursor = conn.cursor()

    for date_str, headlines_list in daily_news_dict.items():
        # Convert the Python list into a JSON string
        headlines_json = json.dumps(headlines_list)
        
        cursor.execute('''
            UPDATE historical_data 
            SET news_headline = ? 
            WHERE date = ?
        ''', (headlines_json, date_str))
        
    conn.commit()
    conn.close()
    
    print("Success! 2006 news headlines poured directly into the database.")

if __name__ == '__main__':
    seed_news_headlines('india-news-headlines.csv', 'time_capsule.db')