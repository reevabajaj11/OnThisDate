import sqlite3

def setup_database():
    conn = sqlite3.connect('time_capsule.db')
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE historical_data (
        date TEXT PRIMARY KEY,
        gold_price REAL,
        silver_price REAL,
        news_headline TEXT
    )
    ''')

    # Insert sample 2006 data
    sample_data = [
        ('2006-08-04', 9500.50, 17500.00, 'Pluto demoted to dwarf planet status.'),
        ('2006-01-01', 9200.00, 16800.00, 'New Year brings economic boom to Indian markets.')
    ]

    cursor.executemany('''
    INSERT INTO historical_data (date, gold_price, silver_price, news_headline)
    VALUES (?, ?, ?, ?)
    ''', sample_data)

    conn.commit()
    conn.close()
    print("Database created and seeded successfully!")

if __name__ == '__main__':
    setup_database()