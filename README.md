# OnThisDate

> Reconstruct the world around a day in India's history.

**OnThisDate** is a historical time-capsule web application that lets
you choose a date, your name, and a city in India, then reconstructs
that day through historical news, weather, prices, and entertainment.

The current archive is focused on **2006**.

## Features

-   **Personalized historical timeline** --- enter a name, date, and
    Indian city to open a reconstructed day.
-   **Historical news** --- displays four headlines associated with the
    selected date and links back to their source articles.
-   **Historical weather** --- retrieves archived weather for the
    selected coordinates, including maximum/minimum temperature, weather
    condition, humidity, wind speed, and rainfall.
-   **Historical prices** --- shows gold (22K, per 10 grams), silver
    (per kilogram), and USD/INR.
-   **Entertainment** --- shows a movie and a selection of songs
    associated with the selected date.
-   **Timeline UI** --- results are presented as a scrolling historical
    timeline with an active section marker and progress line.
-   **City search** --- Indian cities are searched using Open-Meteo's
    geocoding service.
-   **Loading and error states** --- the frontend handles missing input,
    backend connection problems, and failed requests.

## Tech Stack

### Frontend

-   React
-   Vite
-   Tailwind CSS
-   CSS
-   Open-Meteo Geocoding API

### Backend

-   Python
-   Flask
-   Flask-CORS
-   SQLite
-   Requests
-   BeautifulSoup
-   Pandas

### Data Storage

-   SQLite database
-   CSV datasets
-   JSON data stored inside SQLite for entertainment records

## Data Sources & APIs

### Open-Meteo

Open-Meteo is used for both city search and historical weather data.

**Used for:** - Searching for Indian cities and retrieving their
latitude/longitude - Retrieving historical daily weather data for the
selected date and location

**Official website:**\
https://open-meteo.com/

**Historical Weather API:**\
https://archive-api.open-meteo.com/

**Geocoding API:**\
https://geocoding-api.open-meteo.com/

### Kaggle Datasets

The project uses publicly available datasets from Kaggle to populate its
historical archive.

#### 1. India News Headlines Dataset

Used for historical Indian news headlines.

-   File used in the project: `india-news-headlines.csv`
-   Source: Kaggle
-   Dataset:
    https://www.kaggle.com/datasets/therohk/india-headlines-news-dataset

#### 2. Gold Price Dataset

Used as a source for historical gold price data and USD/INR
exchange-rate calculations.

-   File used in the project: `Daily.csv`
-   Source: Kaggle
-   Dataset:
    https://www.kaggle.com/datasets/rizkykiky/gold-price-dataset

#### 3. Gold and Silver Prices Dataset

Used for historical silver price data.

-   File used in the project: `silver_price.csv`
-   Source: Kaggle
-   Dataset:
    https://www.kaggle.com/datasets/lbronchal/gold-and-silver-prices-dataset

> The project uses the `silver_price.csv` file from this dataset.

#### 4. Entertainment Dataset

Used for the movie and song information displayed in the entertainment
section.

-   File used in the project: `master_entertainment_2006.csv`
-   Source: Kaggle
-   Dataset link: `<KAGGLE_LINK>`

> The original Kaggle link for the entertainment dataset can be added
> here.

### Indian Express Archive

Historical news articles are also collected from the Indian Express
archive. The backend stores article headlines along with their source
URLs so that users can open the original article from the timeline.

Archive:\
https://indianexpress.com/archive/

## How It Works

The project is split into a React frontend and a Flask/Python backend.

``` text
User
  │
  ├── Name
  ├── Date (2006)
  └── Indian city
          │
          ▼
     React Frontend
          │
          │ GET /api/capsule
          │ date + latitude + longitude
          ▼
     Flask Backend
       ┌──┼───────────────┐
       │  │               │
       ▼  ▼               ▼
   SQLite DB        Open-Meteo Archive
       │                  │
       ├─ News            └─ Historical weather
       ├─ Prices
       └─ Entertainment
          │
          ▼
     Historical Timeline
```

The frontend sends the selected date and city coordinates to
`/api/capsule`. The backend combines database records with historical
weather data and returns a JSON response containing `date`, `weather`,
`news`, `entertainment`, and `economy`.

## Project Structure

``` text
project-root/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
│
├── movie_posters/
│
├── app.py
├── db.py
├── news.py
├── script.py
├── seed_entertainment.py
├── seed_news.py
│
├── Daily.csv
├── silver_price.csv
├── india-news-headlines.csv
├── master_entertainment_2006.csv
│
├── time_capsule.db
├── .env
└── README.md
```

> The exact generated database/files may vary depending on which
> data-seeding scripts have been run.

## Requirements

Make sure you have:

-   Python 3.9+
-   Node.js and npm
-   Internet access for historical weather, city search, and archive
    scraping

## Installation

### 1. Clone the repository

``` bash
git clone <your-repository-url>
cd <your-repository-folder>
```

### 2. Set up the Python backend

Install the required Python packages:

``` bash
pip install flask flask-cors requests beautifulsoup4 pandas
```

### 3. Set up the frontend

Move into the frontend directory:

``` bash
cd frontend
npm install
```

## Database Setup

The project uses SQLite and stores its data in `time_capsule.db`.

### 1. Seed historical economic data

Run:

``` bash
python db.py
```

This creates/populates the `historical_data` table for all 365 days of
2006 using the available gold, silver, and exchange-rate data.

### 2. Create the detailed news table

Run:

``` bash
python news.py
```

This initializes the `detailed_historical_events` table.

### 3. Fetch historical news

Run:

``` bash
python script.py
```

This goes through the Indian Express archive for every day of 2006 and
stores available article headlines and source URLs in the database.

> This step performs web requests and includes a delay between archive
> requests. It can take some time.

### 4. Add entertainment data

Run:

``` bash
python seed_entertainment.py
```

This imports the 2006 movie and song data into the `entertainment`
table.

### 5. Optional news-dataset seeding

The project also contains:

``` bash
python seed_news.py
```

This processes the `india-news-headlines.csv` dataset and updates the
`news_headline` field in `historical_data`.

## Running the Application

You need to run the backend and frontend separately.

### Start the backend

From the project root:

``` bash
python app.py
```

The Flask server runs on:

``` text
http://localhost:5000
```

### Start the frontend

In a second terminal:

``` bash
cd frontend
npm run dev
```

Vite will provide the local development URL, usually:

``` text
http://localhost:5173
```

Open that address in your browser.

## API

### `GET /api/capsule`

Returns the historical information for a selected date and location.

Example:

``` text
/api/capsule?date=2006-08-04&city=Delhi&lat=28.6139&lon=77.2090
```

The response contains:

``` json
{
  "date": "2006-08-04",
  "weather": {},
  "news": [],
  "entertainment": {},
  "economy": {}
}
```

The backend uses the supplied latitude and longitude to request
historical weather from Open-Meteo. News, entertainment, and economic
information are read from SQLite.

## Frontend Flow

1.  Enter your name.
2.  Select a date between January 1, 2006 and December 31, 2006.
3.  Search for and select an Indian city.
4.  Click **ENTER THE ARCHIVE**.
5.  The frontend requests `/api/capsule`.
6.  The results are displayed as a historical timeline.
7.  Use **START AGAIN** to return to the input screen.

## Design

The application uses a dark archival visual style with:

-   A dark blue-black background
-   Serif display typography for historical/editorial headings
-   Blue accent colors
-   Minimal borders and timeline markers
-   Scroll-based section activation
-   A progress line that follows the timeline sections
-   Responsive layouts for smaller screens

## Data Notes

-   The current date selector is intentionally restricted to **2006**.
-   Historical weather is fetched dynamically from Open-Meteo's archive
    API using the selected city's coordinates.
-   News is stored in SQLite with the article headline and source URL.
-   Entertainment records are stored as JSON strings in the SQLite
    `entertainment` table.
-   Gold and silver values are converted into INR values during database
    seeding.
-   Economic records are generated for every day of 2006, using the most
    recent available value when a specific day's source data is
    unavailable.
-   Historical news from the Indian Express archive is stored with links
    to the original articles.

## Important

The application is a historical reconstruction rather than a guarantee
that every value represents the exact conditions experienced by every
person in a city on that date.

The historical price section itself notes that prices are approximate
and may vary.

## Future Improvements

Some natural next steps for the project are:

-   Expand the archive beyond 2006
-   Add more historical datasets
-   Add richer movie information and posters
-   Add more historical cultural events
-   Improve source attribution for each section
-   Add deployment configuration for the frontend and backend
-   Move API URLs into environment variables
-   Add automated database/data validation
-   Add tests for the API and frontend components

## Author

Developed as a personal historical-data web project.
