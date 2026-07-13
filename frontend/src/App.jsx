import { useState } from 'react'

function App() {
  const [date, setDate] = useState('2006-08-04')
  const [city, setCity] = useState('Mumbai')
  const [capsuleData, setCapsuleData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCapsule = async (e) => {
    e.preventDefault() 
    setLoading(true)
    setError(null)
    setCapsuleData(null)

    try {
      const response = await fetch(`http://localhost:5000/api/capsule?date=${date}&city=${city}`)
      
      if (!response.ok) {
        throw new Error("No data found! Try 2006-08-04 or 2006-01-01.")
      }
      
      const data = await response.json()
      setCapsuleData(data) 
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  //frontend
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🇮🇳 India Time Capsule</h1>
      <p>Enter a date in 2006 to see what the world looked like.</p>

      {/* The Input Form */}
      <form onSubmit={fetchCapsule} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          value={city} 
          onChange={(e) => setCity(e.target.value)} 
          placeholder="City (e.g. Mumbai)"
        />
        <button type="submit">Open Capsule</button>
      </form>

      {/* Loading and Error States */}
      {loading && <p>Opening capsule...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* The Output Data (Only shows if capsuleData exists) */}
      {capsuleData && (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2>Date: {capsuleData.date}</h2>
          <p><strong> Major Headline:</strong> {capsuleData.news_headline}</p>
          <p><strong> Gold Price:</strong> ₹{capsuleData.gold_price} per 10g</p>
          <p><strong> Silver Price:</strong> ₹{capsuleData.silver_price} per kg</p>
          <hr />
          <p><strong> Weather in {city}:</strong> {capsuleData.weather}</p>
          <p><strong> AI Memory:</strong> {capsuleData.ai_story}</p>
        </div>
      )}
    </div>
  )
}

export default App