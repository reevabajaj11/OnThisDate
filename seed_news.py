import sqlite3
import requests
from bs4 import BeautifulSoup
from datetime import date, timedelta
import time

START_DATE = date(2006, 1, 1) 
END_DATE = date(2006, 12, 31) 

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" 
}

def seed_database():
    conn = sqlite3.connect('time_capsule.db')
    cursor = conn.cursor()
    current_date = START_DATE
    
    while current_date <= END_DATE:
        date_str = current_date.strftime("%Y/%m/%d")
        daily_url = f"https://indianexpress.com/archive/{date_str}/"
        print(f"Scraping: {daily_url}")
        
        try:
            response = requests.get(daily_url, headers=HEADERS)
            if response.status_code==200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                article_elements=soup.select('.article-list li p a')
                
                for element in article_elements:
                    headline_text=element.text.strip()
                    article_link=element.get('href')
                    
                    if headline_text and article_link:
                        cursor.execute('''
                            INSERT INTO detailed_historical_events (event_date, headline, source_url)
                            VALUES (?, ?, ?)
                        ''', (current_date.strftime("%Y-%m-%d"), headline_text, article_link))
                
                conn.commit()
            time.sleep(1) # delay
            
        except Exception as e:
            print(f"Error on {date_str}: {e}")
            
        current_date += timedelta(days=1)
        
    conn.close()
    print("Scraping and seeding complete!")

if __name__ == "__main__":
    seed_database()