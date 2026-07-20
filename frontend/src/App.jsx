import { useState, useEffect } from 'react';
import './App.css';

// fetching cities 
function CityAutocomplete({ onLocationSelect }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${inputValue}&count=5&format=json`);
        const data = await response.json();
        
        if (data.results) {
          const locations = data.results
            .filter(place => place.country === "India") 
            .map(place => ({
              name: place.name,
              state: place.admin1,
              lat: place.latitude,
              lon: place.longitude
            }));
            
          const uniqueLocations = Array.from(new Set(locations.map(a => a.name + a.state)))
            .map(id => locations.find(a => a.name + a.state === id));

          setSuggestions(uniqueLocations);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Geocoding API failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 400); 

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]); 

  return (
    <div className="autocomplete-container" style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Search for an Indian city..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="city-input"
        style={{ padding: '5px', width: '200px' }}
      />
      
      {suggestions.length > 0 && (
        <ul className="suggestions-list" style={{ position: 'absolute', zIndex: 10, background: 'white', listStyle: 'none', padding: 0, margin: 0, width: '100%', border: '1px solid #ccc' }}>
          {suggestions.map((loc, index) => (
            <li 
              key={index} 
              style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee', color: 'black' }}
              onClick={() => {
                setInputValue(`${loc.name}, ${loc.state}`);
                setSuggestions([]);  
                onLocationSelect(loc);  
              }}
            >
              <strong>{loc.name}</strong> <span style={{ fontSize: '0.8em', color: '#666' }}>({loc.state})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

//main app
function App() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null); 
  const [capsuleData, setCapsuleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenCapsule = async () => {
    if (!selectedDate) {
      setError("Please select a valid date.");
      return;
    }
    if (!selectedLocation) {
      setError("Please search and select a valid city from the dropdown.");
      return;
    }

    setLoading(true);
    setError('');
    setCapsuleData(null); 

    try {
      // Sending data to flask
      const url = `http://localhost:5000/api/capsule?date=${selectedDate}&city=${selectedLocation.name}&lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch data.");
      }

      setCapsuleData({
        ...data,
        searchedLocation: selectedLocation 
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>IN India Time Capsule</h1>
      <p>Enter a date in 2006 to see what the world looked like.</p>

      <div className="controls-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <input 
          type="date" 
          value={selectedDate}
          min="2006-01-01"
          max="2006-12-31"
          onChange={(e) => setSelectedDate(e.target.value)} 
          className="date-input"
          style={{ padding: '5px' }}
        />

        <CityAutocomplete onLocationSelect={setSelectedLocation} />

        <button onClick={handleOpenCapsule} disabled={loading} className="submit-btn" style={{ padding: '6px 12px' }}>
          {loading ? 'Opening...' : 'Open Capsule'}
        </button>
      </div>

      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

      {capsuleData && (
        <div className="results-card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '500px', backgroundColor: '#f9f9f9', color: '#333' }}>
          <h2>Date: {capsuleData.date}</h2>
          
          {/* --- NEW NEWS SECTION --- */}
          <div className="news-section" style={{ margin: '15px 0' }}>
            <p><strong>Headlines on this Day:</strong></p>
            <div className="news-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {capsuleData.news && capsuleData.news.length > 0 ? (
                capsuleData.news.map((headline, index) => (
                  <div key={index} className="glass-card">
                    <p style={{ margin: 0, fontSize: '0.95em', lineHeight: '1.4' }}>{headline}</p>
                  </div>
                ))
              ) : (
                <p>No headlines found for this date.</p>
              )}
            </div>
          </div>
          {/* --- END NEW NEWS SECTION --- */}

          <p><strong>Gold Price:</strong> ₹{capsuleData.gold_price} per 10g</p>
          <p><strong>Silver Price:</strong> ₹{capsuleData.silver_price} per kg</p>
          
          <hr style={{ margin: '15px 0' }} />
          
          <p><strong>Weather in {capsuleData.searchedLocation.name}</strong></p>
          <p>{capsuleData.weather}</p>
        </div>
      )}
    </div>
  );
}

export default App;