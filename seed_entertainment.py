import sqlite3
import csv

def integrate_entertainment_data():
    conn = sqlite3.connect('time_capsule.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS entertainment (
            date TEXT PRIMARY KEY,
            movies TEXT,
            songs TEXT
        )
    ''')

    with open('master_entertainment_2006.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            raw_date = str(row['date'])
            formatted_date = f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:]}"

            cursor.execute('''
                INSERT OR REPLACE INTO entertainment (date, movies, songs)
                VALUES (?, ?, ?)
            ''', (formatted_date, row['movies'], row['songs']))

    conn.commit()
    conn.close()
    print("Success: Pop culture dataset integrated into time_capsule.db!")

if __name__ == '__main__':
    integrate_entertainment_data()