import sqlite3

def create_database():
    conn = sqlite3.connect('time_capsule.db')
    cursor = conn.cursor()
    
    cursor.execute('DROP TABLE IF EXISTS detailed_historical_events')
    
    cursor.execute('''
        CREATE TABLE detailed_historical_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_date TEXT,
            headline TEXT,
            source_url TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database 'time_capsule.db' initialized successfully.")

if __name__ == "__main__":
    create_database()