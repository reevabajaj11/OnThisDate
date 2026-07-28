import { useState, useEffect } from 'react'; 


function Hero() {
  return (
    <div className="text-center mb-12 mt-8 space-y-4"> 
      <div className="inline-block px-3 py-1 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-sm mb-4"> 
        <span className="mr-2">●</span> A time capsule of India, 2006 
      </div>
      <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight"> 
        Relive the Day <br /> 
        <span className="text-brand-gold italic">You Were Born</span> 
      </h1>
      <p className="text-gray-400 max-w-2xl mx-auto text-lg mt-6"> 
        Explore the weather, news, prices, and major events from any day in India's history. 
      </p>
    </div>
  );
}

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
    <div className="relative w-full"> 
      <input
        type="text" 
        placeholder="Search a city..." 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
        className="glass-input w-full" 
      />
      
      {suggestions.length > 0 && ( 
        <ul className="absolute z-50 w-full mt-2 bg-[#1A1A1A] border border-dark-border rounded-lg shadow-glass overflow-hidden"> 
          {suggestions.map((loc, index) => ( 
            <li 
              key={index}  
              className="px-4 py-3 cursor-pointer hover:bg-white/10 text-gray-200 border-b border-dark-border last:border-b-0 transition-colors" 
              onClick={() => { 
                setInputValue(`${loc.name}, ${loc.state}`); 
                setSuggestions([]);  
                onLocationSelect(loc);  
              }}
            >
              <strong className="text-white">{loc.name}</strong> <span className="text-sm text-gray-400">({loc.state})</span> 
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BirthStatistics({ date }) {
  const [elapsedMs, setElapsedMs] = useState(0); 

  useEffect(() => { 
    if (!date) return; 
    
    const birthTimestamp = new Date(`${date}T00:00:00`).getTime(); 
    
    const interval = setInterval(() => { 
      setElapsedMs(Date.now() - birthTimestamp); 
    }, 1000); 

    setElapsedMs(Date.now() - birthTimestamp); 

    return () => clearInterval(interval); 
  }, [date]); 

  if (!date || !elapsedMs) return null; 

  const diffDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24)); 
  const lunarOrbits = Math.floor(diffDays / 27.3); 
  
  const BPM = 72; 
  const BREATHS_PER_MIN = 16; 
  const MS_PER_MINUTE = 60000; 
  
  const liveHeartbeats = Math.floor(elapsedMs * (BPM / MS_PER_MINUTE)); 
  const liveBreaths = Math.floor(elapsedMs * (BREATHS_PER_MIN / MS_PER_MINUTE)); 

  return (
    <div className="pt-24 pb-16 max-w-5xl mx-auto px-4"> 
      <div className="text-brand-gold text-xs font-sans uppercase tracking-[0.25em] mb-3 text-left"> 
        THE JOURNEY SO FAR 
      </div>
      <h3 className="text-4xl md:text-5xl font-serif text-white mb-10 text-left"> 
        Since that day... 
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
        
        <div className="glass-card p-6 border border-white/5 hover:border-brand-gold/30 transition-colors flex flex-col justify-between text-left min-h-[160px]"> 
          <div className="flex justify-between items-start w-full"> 
            <div className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">Days Alive</div> 
            <div className="text-brand-gold/70 text-sm">✨</div> 
          </div>
          <div className="mt-6"> 
            <div className="text-4xl font-serif text-white mb-1">{diffDays.toLocaleString()}</div> 
            <div className="text-gray-500 font-mono text-[11px]">And counting</div> 
          </div>
        </div>

        <div className="glass-card p-6 border border-white/5 hover:border-brand-gold/30 transition-colors flex flex-col justify-between text-left min-h-[160px]"> 
          <div className="flex justify-between items-start w-full"> 
            <div className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">Heartbeats</div> 
            <div className="text-brand-gold/70 text-sm">♡</div> 
          </div>
          <div className="mt-6"> 
            <div className="text-4xl font-serif text-white mb-1">{liveHeartbeats.toLocaleString()}</div> 
            <div className="text-gray-500 font-mono text-[11px]">Approx. at {BPM} bpm</div> 
          </div>
        </div>

        <div className="glass-card p-6 border border-white/5 hover:border-brand-gold/30 transition-colors flex flex-col justify-between text-left min-h-[160px]"> 
          <div className="flex justify-between items-start w-full"> 
            <div className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">Breaths Taken</div> 
            <div className="text-brand-gold/70 text-sm">💨</div> 
          </div>
          <div className="mt-6"> 
            <div className="text-4xl font-serif text-white mb-1">{liveBreaths.toLocaleString()}</div> 
            <div className="text-gray-500 font-mono text-[11px]">Approx. at {BREATHS_PER_MIN} breaths/min</div> 
          </div>
        </div>

        <div className="glass-card p-6 border border-white/5 hover:border-brand-gold/30 transition-colors flex flex-col justify-between text-left min-h-[160px]"> 
          <div className="flex justify-between items-start w-full"> 
            <div className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">Full Moons Witnessed</div> 
            <div className="text-brand-gold/70 text-sm">☾</div> 
          </div>
          <div className="mt-6"> 
            <div className="text-4xl font-serif text-white mb-1">{lunarOrbits.toLocaleString()}</div> 
            <div className="text-gray-500 font-mono text-[11px]">Complete orbits</div> 
          </div>
        </div>

      </div>
    </div>
  );
}

function ResultsDashboard({ data, personName }) {
  const dateObj = new Date(`${data?.date}T12:00:00`);
  const formattedDate = !isNaN(dateObj.getTime()) 
    ? dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getWeatherDetails = (code) => {
    const map = {
      0: { text: "Clear, sunny skies", icon: "☀️" },
      1: { text: "Mostly clear skies", icon: "🌤️" },
      2: { text: "Partly cloudy", icon: "⛅" },
      3: { text: "Overcast skies", icon: "☁️" },
      45: { text: "Misty fog", icon: "🌫️" },
      48: { text: "Freezing fog", icon: "🌫️" },
      51: { text: "Light drizzle", icon: "🌦️" },
      53: { text: "Moderate drizzle", icon: "🌦️" },
      55: { text: "Dense drizzle", icon: "🌧️" },
      61: { text: "Slight rain", icon: "🌧️" },
      63: { text: "Moderate rain", icon: "🌧️" },
      65: { text: "Heavy rainfall", icon: "🌧️" },
      71: { text: "Light snowfall", icon: "🌨️" },
      95: { text: "Thunderstorms", icon: "🌩️" },
    };
    return map[code] || { text: "Mild conditions", icon: "🌍" };
  };

  const weather = data?.weather;
  const weatherDetails = weather ? getWeatherDetails(weather.code) : null;

  return (
    <div className="w-full animate-fade-in-up mt-16 pb-32">
      
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center relative border-b border-dark-border/50 pb-24">
        <div className="text-brand-gold text-xs font-sans uppercase tracking-[0.3em] mb-8">
          ONTHISDATE
        </div>
        
        <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 leading-tight">
          The world the <br />
          day <span className="text-brand-gold">{personName}</span> arrived.
        </h2>
        
        <div className="text-gray-300 text-xl font-serif mb-3">
          {formattedDate}
        </div>
        
        <div className="text-gray-500 text-sm font-sans">
          {data?.searchedLocation?.name}, India
        </div>
      </div>

      <div className="pt-28 pb-16 max-w-4xl mx-auto px-4">
        <div className="text-brand-gold text-xs font-sans uppercase tracking-[0.25em] mb-3">
          THE AIR AROUND YOU
        </div>
        <h3 className="text-4xl md:text-5xl font-serif text-white mb-10">
          The weather you arrived to.
        </h3>
        
        {weather ? (
          <div className="relative glass-card overflow-hidden p-8 md:p-12 border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent">
            
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="flex flex-col gap-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="relative mb-4">
                    <span className="text-7xl md:text-8xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                      {weatherDetails?.icon}
                    </span>
                  </div>
                  <span className="text-2xl md:text-3xl text-white font-serif tracking-wide">
                    {weatherDetails?.text}
                  </span>
                </div>
                
                <div className="flex flex-col items-center md:items-end">
                  <div className="text-6xl md:text-8xl text-white font-serif tracking-tight mb-2 flex items-baseline">
                    {weather.max_temp}
                    <span className="text-brand-gold font-sans text-4xl md:text-5xl font-light ml-1">°C</span>
                  </div>
                  
                  <div className="text-gray-400 text-xs font-mono tracking-widest uppercase bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    LOW <span className="text-gray-200 font-semibold">{weather.min_temp}°C</span>
                  </div>
                </div>

              </div>

              {weather.sunrise && weather.sunset && (
                <div className="pt-8 border-t border-white/10 flex flex-col items-center text-center gap-3">
                  <div className="text-gray-300 font-mono tracking-widest text-sm">
                    <span className="text-brand-gold text-lg mr-2">☀️</span> {formatTime(weather.sunrise)} 
                    <span className="mx-6 text-dark-border">|</span> 
                    <span className="text-brand-gold text-lg mr-2">🌙</span> {formatTime(weather.sunset)}
                  </div>
                  {weather.daylight_hours !== undefined && (
                    <div className="text-gray-400 font-serif italic text-lg mt-1">
                      A day bathed in {weather.daylight_hours} hours and {weather.daylight_minutes || 0} minutes of sunlight.
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="glass-card p-10 text-center text-gray-500 font-serif">
            Weather archives are unavailable for this date.
          </div>
        )}
      </div>

      <BirthStatistics date={data.date} />

      <div className="pt-16 pb-16 max-w-4xl mx-auto px-4">
        <div className="text-brand-gold text-xs font-sans uppercase tracking-[0.25em] mb-3">
          THE HEADLINES
        </div>
        <h3 className="text-4xl md:text-5xl font-serif text-white mb-10">
          News that defined the day.
        </h3>
        
        {data?.news && data.news.length > 0 ? (
          <div className="grid gap-4">
            {data.news.map((item, index) => (
              <a 
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer" 
                className="glass-card p-6 block hover:bg-white/10 transition-colors border border-white/5 hover:border-brand-gold/50 group"
              >
                <h4 className="text-xl md:text-2xl text-white font-serif group-hover:text-brand-gold transition-colors">
                  {item.headline}
                </h4>
                <div className="text-brand-gold/70 text-sm mt-3 font-sans flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read Full Article <span>→</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
           <div className="glass-card p-10 text-center text-gray-500 font-serif">
            No news archives found for this date.
          </div>
        )}
      </div>

    </div>
  );
}


function App() {
  const [personName, setPersonName] = useState('Reeva'); 
  const [selectedDate, setSelectedDate] = useState(''); 
  const [selectedLocation, setSelectedLocation] = useState(null);  
  const [capsuleData, setCapsuleData] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 

  const handleOpenCapsule = async () => { 
    if (!personName) { 
      setError("Please enter a name."); 
      return; 
    }
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
      const url = `http://localhost:5000/api/capsule?date=${selectedDate}&city=${selectedLocation.name}&lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`; 
      
      const response = await fetch(url); 
      
      const contentType = response.headers.get("content-type"); 
      if (!contentType || !contentType.includes("application/json")) { 
        throw new Error("Cannot connect to the server. Please ensure the Python backend is running."); 
      }

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
    <div className="min-h-screen p-6 md:p-12 flex flex-col items-center"> 
      
      {!capsuleData && ( 
        <>
          <Hero /> 
          <div className="w-full max-w-4xl glass-card p-6 flex flex-col md:flex-row gap-4 items-end mt-8 relative z-20"> 
            <div className="w-full"> 
              <label className="block text-xs font-mono uppercase text-gray-400 mb-2">👤 Name</label> 
              <input 
                type="text"  
                value={personName} 
                onChange={(e) => setPersonName(e.target.value)}  
                placeholder="Enter name..." 
                className="glass-input w-full" 
              />
            </div>

            <div className="w-full"> 
              <label className="block text-xs font-mono uppercase text-gray-400 mb-2">📅 Date</label> 
              <input 
                type="date"  
                value={selectedDate} 
                min="2006-01-01" 
                max="2006-12-31" 
                onChange={(e) => setSelectedDate(e.target.value)}  
                className="glass-input w-full [color-scheme:dark]" 
              />
            </div>

            <div className="w-full"> 
              <label className="block text-xs font-mono uppercase text-gray-400 mb-2">📍 City</label> 
              <CityAutocomplete onLocationSelect={setSelectedLocation} /> 
            </div>

            <button 
              onClick={handleOpenCapsule}  
              disabled={loading}  
              className="w-full md:w-auto px-8 py-3 bg-brand-gold hover:bg-brand-goldHover text-dark-base font-semibold rounded-lg transition-colors flex items-center justify-center whitespace-nowrap disabled:opacity-50" 
            >
              {loading ? 'Opening...' : 'Open Capsule →'} 
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">Currently showing historical data for 2006. More years coming soon.</p> 
        </>
      )}

      {error && ( 
        <div className="mt-8 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg"> 
          {error} 
        </div>
      )}

      {capsuleData && <ResultsDashboard data={capsuleData} personName={personName} />} 
    </div>
  );
}

export default App; 