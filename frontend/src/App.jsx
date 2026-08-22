import { useState, useEffect, useRef } from 'react';

/* -------------------------------------------------------
   THE DAY YOU ARRIVED
   Dark Timeline UI
   Functionality/API logic is preserved; the visual system
   has been rebuilt around a single historical timeline.
------------------------------------------------------- */

/* ---------- INPUT / LANDING ---------- */

function Hero() {
  return (
    <section className="landing-hero">
      <div className="eyebrow">THE DAY YOU ARRIVED</div>

      <h1>
        The world
        <br />
        <em>you arrived into.</em>
      </h1>

      <p>
        Reconstruct a single day in India's history through the
        news, weather, prices, culture and small details that made it real.
      </p>
    </section>
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
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${inputValue}&count=5&format=json`
        );

        const data = await response.json();

        if (data.results) {
          const locations = data.results
            .filter((place) => place.country === 'India')
            .map((place) => ({
              name: place.name,
              state: place.admin1,
              lat: place.latitude,
              lon: place.longitude,
            }));

          const uniqueLocations = Array.from(
            new Set(locations.map((a) => a.name + a.state))
          ).map((id) => locations.find((a) => a.name + a.state === id));

          setSuggestions(uniqueLocations);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Geocoding API failed', error);
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
        placeholder={isSearching ? 'Searching...' : 'Search your city'}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="timeline-input w-full"
      />

      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#11110f] shadow-2xl">
          {suggestions.map((loc, index) => (
            <li
              key={index}
              className="cursor-pointer border-b border-white/5 px-4 py-3 text-gray-200 transition-colors last:border-b-0 hover:bg-white/5"
              onClick={() => {
                setInputValue(`${loc.name}, ${loc.state}`);
                setSuggestions([]);
                onLocationSelect(loc);
              }}
            >
              <strong className="text-white">{loc.name}</strong>{' '}
              <span className="text-sm text-gray-500">({loc.state})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- TIMELINE BUILDING BLOCKS ---------- */

function TimelineSection({
  number,
  label,
  title,
  children,
  image,
  wide = false,
  index = 0,
  activeIndex = 0,
  registerSection,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        registerSection?.(index, node);
      }}
      className={`timeline-section ${wide ? 'timeline-section-wide' : ''} ${
        isVisible ? 'is-visible' : ''
      }`}
    >
      <div className={`timeline-marker ${activeIndex === index ? 'is-active' : ''}`}>
        <span>{number}</span>
      </div>

      <div className="timeline-content">
        <div className="timeline-label">{label}</div>

        <div className="timeline-heading-row">
          <h2>{title}</h2>
          {image && <div className="timeline-image">{image}</div>}
        </div>

        <div className="timeline-stagger">
          {children}
        </div>
      </div>
    </section>
  );
}

function IntroTimeline({ personName, formattedDate, locationName }) {
  return (
    <section className="timeline-opening">
      <div className="timeline-opening-line" />

      <div className="timeline-opening-copy">
        <div className="eyebrow">A PERSONAL ARCHIVE</div>

        <h2>
          On <span>{formattedDate}</span>
          <br />
          <strong>{personName}</strong> arrived.
        </h2>

        <p>
          {locationName}, India
          <br />
          <span>The beginning of a very long story.</span>
        </p>

        <div className="scroll-hint">
          <span className="scroll-dot" />
          SCROLL TO TRAVEL BACK
        </div>
      </div>
    </section>
  );
}

/* ---------- WORLD ---------- */

function WorldSection({ news, date, activeIndex, registerSection }) {
  return (
    <TimelineSection number="01" label="THE WORLD" title="What was happening?" index={0} activeIndex={activeIndex} registerSection={registerSection}>
      <div className="section-intro">
        Headlines and events recorded around the country on this exact date.
      </div>

      {news && news.length > 0 ? (
        <div className="news-list">
          {news.map((item, idx) => (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-item"
              key={idx}
            >
              <span className="news-number">
                {String(idx + 1).padStart(2, '0')}
              </span>

              <div>
                <h3>{item.headline}</h3>
                <p>
                  Archive record · {date}
                </p>
              </div>

              <span className="news-arrow">↗</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="empty-state">No headlines stored for this date.</div>
      )}
    </TimelineSection>
  );
}

/* ---------- SKY ---------- */

function WeatherSection({ weather, location, date, activeIndex, registerSection }) {
  const getWeatherDetails = (code) => {
    const map = {
      0: { text: 'Clear skies', icon: '☀' },
      1: { text: 'Mostly clear', icon: '◐' },
      2: { text: 'Partly cloudy', icon: '◒' },
      3: { text: 'Overcast', icon: '☁' },
      45: { text: 'Misty fog', icon: '◌' },
      48: { text: 'Freezing fog', icon: '◌' },
      51: { text: 'Light drizzle', icon: '╱' },
      53: { text: 'Moderate drizzle', icon: '╱' },
      55: { text: 'Dense drizzle', icon: '╱' },
      61: { text: 'Slight rain', icon: '⌁' },
      63: { text: 'Moderate rain', icon: '⌁' },
      65: { text: 'Heavy rainfall', icon: '⌁' },
      71: { text: 'Light snowfall', icon: '✧' },
      95: { text: 'Thunderstorms', icon: 'ϟ' },
    };

    return map[code] || { text: 'Mild conditions', icon: '○' };
  };

  const details = weather ? getWeatherDetails(weather.code) : null;

  // Support the common Open-Meteo field names as well as the shorter
  // names a backend may already be returning.
  const humidity = weather?.humidity ?? weather?.relative_humidity ?? weather?.relative_humidity_2m;
  const wind = weather?.wind_speed ?? weather?.wind_speed_10m ?? weather?.wind;
  const rainProbability = weather?.precipitation_probability ?? weather?.rain_probability;
  const rainAmount = weather?.rain_mm;

  const formatValue = (value, suffix = '') =>
    value === null || value === undefined || value === '' ? '—' : `${value}${suffix}`;

  const formattedDate = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : 'Historical weather';

  return (
    <TimelineSection number="02" label="THE SKY" title="What did the day feel like?" index={1} activeIndex={activeIndex} registerSection={registerSection}>
      <div className="weather-card">
        <div className="weather-card-header">
          <div>
            <div className="weather-location">{location?.name || 'India'}, India</div>
            <div className="weather-date">{formattedDate}</div>
          </div>
          <div className="weather-condition-dot" aria-hidden="true" />
        </div>

        <div className="weather-hero">
          <div className="weather-icon" aria-hidden="true">{details?.icon || '○'}</div>
          <div className="weather-reading">
            <div className="weather-temperature">
              {weather ? `${weather.max_temp}°` : '—'}
            </div>
            <div className="weather-description">
              {details?.text || 'Weather data unavailable'}
            </div>
          </div>
        </div>

        <div className="weather-range">
          <div className="weather-range-item">
            <span>HIGH</span>
            <strong>{formatValue(weather?.max_temp, '°')}</strong>
            <span className="weather-trend weather-trend-up">↗</span>
          </div>
          <div className="weather-range-item">
            <span>LOW</span>
            <strong>{formatValue(weather?.min_temp, '°')}</strong>
            <span className="weather-trend weather-trend-down">↘</span>
          </div>
        </div>

        <div className="weather-stats">
          <div className="weather-stat">
            <span>HUMIDITY</span>
            <strong>{formatValue(humidity, '%')}</strong>
          </div>
          <div className="weather-stat">
            <span>WIND</span>
            <strong>{formatValue(wind, ' km/h')}</strong>
          </div>
          <div className="weather-stat">
            <span>RAIN</span>
            <strong>{rainProbability !== null && rainProbability !== undefined
                ? formatValue(rainProbability, '%')
                : formatValue(rainAmount, ' mm')}</strong>
          </div>
        </div>
      </div>
    </TimelineSection>
  );
}

/* ---------- MARKET ---------- */

function MarketSection({ economy, activeIndex, registerSection }) {
  return (
    <TimelineSection
      number="03"
      label="THE MARKET"
      title="What did things cost?"
      index={2}
      activeIndex={activeIndex}
      registerSection={registerSection}
    >
      <div className="market-heading">
        <p>A snapshot of prices on this day.</p>

        <div className="market-source">
          <span className="market-calendar-icon" aria-hidden="true">▦</span>
          <span>Prices from historical records</span>
        </div>
      </div>

      <div className="market-grid">
        <MarketValue
          icon="◆"
          label="GOLD (22K)"
          value={economy?.gold}
          prefix="₹"
          suffix="for 10 grams"
        />

        <MarketValue
          icon="▰"
          label="SILVER"
          value={economy?.silver}
          prefix="₹"
          suffix="for 1 kilogram"
        />

        <MarketValue
          icon="$"
          label="USD / INR"
          value={economy?.usd}
          prefix="₹"
          decimals
          suffix="1 US Dollar"
        />
      </div>

      <p className="market-note">
        Note: Prices are approximate and may vary.
      </p>
    </TimelineSection>
  );
}

function MarketValue({
  icon,
  label,
  value,
  prefix = '',
  suffix,
  decimals = false,
}) {
  const numericValue =
    value !== null && value !== undefined && value !== '' ? Number(value) : null;

  const formatted =
    numericValue !== null && !Number.isNaN(numericValue)
      ? decimals
        ? numericValue.toFixed(2)
        : numericValue.toLocaleString('en-IN')
      : '—';

  return (
    <div className="market-value">
      <div className="market-icon" aria-hidden="true">
        <span>{icon}</span>
      </div>

      <div className="market-label">{label}</div>

      <div className="market-price">
        {prefix}
        {formatted}
      </div>

      <div className="market-unit">
        <span>—</span>
        {suffix}
      </div>
    </div>
  );
}


/* ---------- SOUND / CULTURE ---------- */

function SoundSection({ entertainment, location, weather, activeIndex, registerSection }) {
  return (
    <TimelineSection number="04" label="THE SOUND" title="What were people watching and listening?" index={3} activeIndex={activeIndex} registerSection={registerSection}>
      <div className="culture-layout">
        <div className="culture-feature">
          <span className="small-label">IN THEATRES</span>

          {entertainment?.movie ? (
            <a
              href={entertainment.movie.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3>{entertainment.movie.title}</h3>
              <span className="text-link">View record ↗</span>
            </a>
          ) : (
            <h3>Movie data unavailable.</h3>
          )}
        </div>

        <div className="culture-songs">
          <span className="small-label">TRENDING SOUNDTRACK</span>

          {entertainment?.songs?.length ? (
            <ol>
              {entertainment.songs.map((song, i) => (
                <li key={i}>
                  <span>{String(i + 1).padStart(2, '0')}</span>

                  <a
                    href={song.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {song.title}
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty-state">No music records available.</p>
          )}
        </div>
      </div>

      <div className="culture-note">
        <span>SMALL DETAILS</span>
        <p>
          {location?.name || 'India'} · {weather?.max_temp ?? '—'}°C ·
          a completely ordinary day that happened to become yours.
        </p>
      </div>
    </TimelineSection>
  );
}

// /* ---------- THE EVERYDAY ---------- */

// function EverydaySection({ date, activeIndex, registerSection }) {
//   return (
//     <TimelineSection number="05" label="THE EVERYDAY" title="Before it became your past." index={4} activeIndex={activeIndex} registerSection={registerSection}>
//       <div className="everyday-statement">
//         <p>
//           History is usually remembered through the big things.
//           <br />
//           This is about everything else.
//         </p>

//         <span>
//           {date} · An ordinary day, preserved.
//         </span>
//       </div>
//     </TimelineSection>
//   );
// }

/* ---------- ENDING ---------- */

function BirthStatistics({ date }) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const endingRef = useRef(null);

  useEffect(() => {
    const node = endingRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [elapsedMs]);

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

  const liveHeartbeats = Math.floor(
    elapsedMs * (BPM / MS_PER_MINUTE)
  );

  const liveBreaths = Math.floor(
    elapsedMs * (BREATHS_PER_MIN / MS_PER_MINUTE)
  );

  return (
    <section ref={endingRef} className={`timeline-ending dashboard-ending-reveal ${isVisible ? "is-visible" : ""}`}>
      <div className="ending-line" />

      <div className="eyebrow">THE JOURNEY SO FAR</div>

      <h2>And now, look how far you've come.</h2>

      <div className="stats-grid">
        <Stat index={0} label="DAYS ALIVE" value={diffDays.toLocaleString()} note="and counting" />
        <Stat index={1} label="HEARTBEATS" value={liveHeartbeats.toLocaleString()} note={`approx. at ${BPM} bpm`} />
        <Stat index={2} label="BREATHS TAKEN" value={liveBreaths.toLocaleString()} note={`approx. at ${BREATHS_PER_MIN}/min`} />
        <Stat index={3} label="MOONS WITNESSED" value={lunarOrbits.toLocaleString()} note="complete lunar orbits" />
      </div>

      <div className="final-note">
        <br />
      </div>
    </section>
  );
}

function Stat({ label, value, note, index = 0 }) {
  return (
    <div className="stat-item" style={{ '--stat-delay': `${index * 110}ms` }}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

/* ---------- RESULTS ---------- */

function ResultsDashboard({ data, personName }) {
  const dateObj = new Date(`${data?.date}T12:00:00`);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const trackRef = useRef(null);
  const sectionRefs = useRef([]);

  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const registerSection = (index, node) => {
    sectionRefs.current[index] = node;
  };

  // The progress line follows the actual timeline sections instead of
  // being based on viewport distance. This keeps every section's progress
  // visually consistent even when sections have different heights.
  useEffect(() => {
    const updateProgress = () => {
      const track = trackRef.current;
      if (!track) return;

      const currentSection = sectionRefs.current[activeIndex];
      if (!currentSection) {
        setProgress(0);
        return;
      }

      const trackRect = track.getBoundingClientRect();
      const sectionRect = currentSection.getBoundingClientRect();
      const markerOffset = sectionRect.top - trackRect.top + 123 + 19;
      const nextProgress = Math.max(0, Math.min(trackRect.height, markerOffset));

      setProgress(nextProgress);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [activeIndex]);

  useEffect(() => {
    const nodes = sectionRefs.current.filter(Boolean);
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) return;

        const index = nodes.indexOf(visible[0].target);
        if (index >= 0) setActiveIndex(index);
      },
      {
        threshold: [0.15, 0.35, 0.55],
        rootMargin: '-20% 0px -42% 0px',
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="timeline-page dashboard-enter">
      <IntroTimeline
        personName={personName}
        formattedDate={formattedDate}
        locationName={data?.searchedLocation?.name}
      />

      <div
        ref={trackRef}
        className="timeline-track"
        style={{ '--timeline-progress': `${progress}px` }}
      >
        <div className="timeline-progress" aria-hidden="true" />

        <WorldSection
          news={data?.news}
          date={data?.date}
          activeIndex={activeIndex}
          registerSection={registerSection}
        />

        <WeatherSection
          weather={data?.weather}
          location={data?.searchedLocation}
          date={data?.date}
          activeIndex={activeIndex}
          registerSection={registerSection}
        />

        <MarketSection
          economy={data?.economy}
          activeIndex={activeIndex}
          registerSection={registerSection}
        />

        <SoundSection
          entertainment={data?.entertainment}
          location={data?.searchedLocation}
          weather={data?.weather}
          activeIndex={activeIndex}
          registerSection={registerSection}
        />

      </div>

      <BirthStatistics date={data?.date} />
    </main>
  );
}

/* ---------- MAIN APP ---------- */

function App() {
  const [personName, setPersonName] = useState('Reeva');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [capsuleData, setCapsuleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenCapsule = async () => {
    if (!personName) {
      setError('Please enter a name.');
      return;
    }

    if (!selectedDate) {
      setError('Please select a valid date.');
      return;
    }

    if (!selectedLocation) {
      setError('Please search and select a valid city from the dropdown.');
      return;
    }

    setLoading(true);
    setError('');
    setCapsuleData(null);

    try {
      const url =
        `http://localhost:5000/api/capsule?date=${selectedDate}` +
        `&city=${selectedLocation.name}` +
        `&lat=${selectedLocation.lat}` +
        `&lon=${selectedLocation.lon}`;

      const response = await fetch(url);
      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(
          'Cannot connect to the server. Please ensure the Python backend is running.'
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data.');
      }

      setCapsuleData({
        ...data,
        searchedLocation: selectedLocation,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      {!capsuleData && (
        <div className="landing-page">
          <Hero />

          {loading && (
            <div className="loading-overlay" role="status" aria-live="polite">
              <div className="loading-orbit">
                <span className="loading-planet" />
                <span className="loading-ring loading-ring-one" />
                <span className="loading-ring loading-ring-two" />
              </div>
              <div className="loading-copy">
                <span className="loading-kicker">ONTHISDATE</span>
                <strong>Reconstructing your day</strong>
                <span>Gathering the world as it was.</span>
              </div>
            </div>
          )}

          <div className="archive-form">
            <div className="form-field">
              <label>YOUR NAME</label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Enter your name"
                className="timeline-input"
              />
            </div>

            <div className="form-field">
              <label>THE DATE</label>
              <input
                type="date"
                value={selectedDate}
                min="2006-01-01"
                max="2006-12-31"
                onChange={(e) => setSelectedDate(e.target.value)}
                className="timeline-input [color-scheme:dark]"
              />
            </div>

            <div className="form-field">
              <label>THE PLACE</label>
              <CityAutocomplete onLocationSelect={setSelectedLocation} />
            </div>

            <button
              onClick={handleOpenCapsule}
              disabled={loading}
              className="open-button"
            >
              {loading ? 'RECONSTRUCTING...' : 'ENTER THE ARCHIVE ↗'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <p className="landing-footnote">
            Historical data currently available for 2006 · More years coming soon.
          </p>
        </div>
      )}

      {capsuleData && (
        <>
          <button
            className="back-button"
            onClick={() => setCapsuleData(null)}
          >
            ← START AGAIN
          </button>

          <ResultsDashboard
            data={capsuleData}
            personName={personName}
          />
        </>
      )}
    </div>
  );
}

export default App;