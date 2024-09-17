import React, { useState, useEffect } from 'react';

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [checkins, setCheckins] = useState([]);  // Store current week check-ins

  // Fetch current week's check-ins when the component mounts
  useEffect(() => {
    fetch('http://localhost:5000/checkins/current')
      .then((response) => response.json())
      .then((data) => setCheckins(data))
      .catch((error) => console.error('Error fetching check-ins:', error));
  }, []);

  // Handle the form submission to send a POST request
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (response.ok) {
      alert('Check-in successful!');
      setName('');
      setEmail('');

      // Fetch updated current week check-ins after a successful check-in
      fetch('http://localhost:5000/checkins/current')
        .then((response) => response.json())
        .then((data) => setCheckins(data))
        .catch((error) => console.error('Error fetching updated check-ins:', error));
    } else {
      alert('Failed to check in. Please try again.');
    }
  };

  return (
    <div>
      <h1>Weekly Class Check-in</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Check In</button>
      </form>

      <h2>Current Week Check-in List</h2>
      <ul>
        {checkins.map((checkin) => (
          <li key={checkin._id}>
            {checkin.name} - {checkin.email} (Checked in at {new Date(checkin.date).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
