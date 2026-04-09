import React, { useState, useEffect } from 'react';
import { Search, Train, User, LogOut, Ticket, X, Award, Clock, MapPin } from 'lucide-react';
import './App.css';

const parseTimeString = (timeStr) => {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const calculateDuration = (departure, arrival) => {
  let depMin = parseTimeString(departure);
  let arrMin = parseTimeString(arrival);
  if (arrMin < depMin) arrMin += 24 * 60; // Crosses midnight
  return arrMin - depMin;
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [trains, setTrains] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  // Login/Register states
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Booking states
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerAge, setPassengerAge] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    if (selectedTrain) {
      setSelectedSeats([]);
    }
  }, [selectedTrain]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchAllTrains();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchAllTrains = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trains');
      const data = await response.json();
      setTrains(data);
    } catch (error) {
      alert('Error fetching trains');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registration successful! Please login.');
        setIsLogin(true);
        setRegName(''); setRegEmail(''); setRegPassword(''); setRegPhone('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentPage('home');
        setLoginEmail(''); setLoginPassword('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Login failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('home');
    setBookings([]);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/trains/search?from=${searchFrom}&to=${searchTo}`
      );
      const data = await response.json();
      setTrains(data);
    } catch (error) {
      alert('Error searching trains');
    }
  };

  const handleBookTicket = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to book tickets');
      setCurrentPage('auth');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat from the seat map.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainId: selectedTrain.id,
          userId: user.id,
          passengerName,
          age: parseInt(passengerAge),
          seats: selectedSeats.length,
          selectedSeats,
          totalPrice: selectedTrain.price * selectedSeats.length
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Booking Confirmed! PNR: ${data.booking.pnr}`);
        setSelectedTrain(null);
        setPassengerName(''); setPassengerAge(''); setSelectedSeats([]);
        fetchAllTrains();
        fetchUserBookings();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Booking failed');
    }
  };

  const fetchUserBookings = async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${user.id}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert('Booking cancelled successfully');
          fetchUserBookings();
          fetchAllTrains();
        }
      } catch (error) {
        alert('Cancellation failed');
      }
    }
  };

  // Render Auth Page
  const renderAuth = () => (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-tabs">
          <button
            className={isLogin ? 'active' : ''}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={!isLogin ? 'active' : ''}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <h2>Login to Your Account</h2>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h2>Create New Account</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
            />
            <button type="submit">Register</button>
          </form>
        )}
      </div>
    </div>
  );

  // Calculate suggestions
  const getSuggestions = () => {
    if (trains.length === 0) return null;
    let cheapest = trains[0];
    let fastest = trains[0];
    let optimal = trains[0];
    let minPrice = Infinity;
    let minDuration = Infinity;
    let minScore = Infinity;

    trains.forEach(t => {
      const duration = calculateDuration(t.departure, t.arrival);
      if (t.price < minPrice) { minPrice = t.price; cheapest = t; }
      if (duration < minDuration) { minDuration = duration; fastest = t; }
      const score = t.price * duration;
      if (score < minScore) { minScore = score; optimal = t; }
    });

    return { cheapest, fastest, optimal };
  };

  // Render Home/Search Page
  const renderHome = () => (
    <div className="home-container">
      <div className="search-section">
        <h1>🚂 Railway Ticket Booking</h1>
        <p>Search and book train tickets easily</p>

        <div className="search-box">
          <input
            type="text"
            placeholder="From Station"
            value={searchFrom}
            onChange={(e) => setSearchFrom(e.target.value)}
          />
          <input
            type="text"
            placeholder="To Station"
            value={searchTo}
            onChange={(e) => setSearchTo(e.target.value)}
          />
          <button onClick={handleSearch}>
            <Search size={20} /> Search Trains
          </button>
        </div>
      </div>

      <div className="trains-list">
        {trains.length > 0 && (
          <div className="smart-suggestions">
            <h2>✨ Smart Suggestions</h2>
            <div className="suggestions-grid">
              {(() => {
                const suggestions = getSuggestions();
                if (!suggestions) return null;
                const { cheapest, fastest, optimal } = suggestions;
                return (
                  <>
                    <div className="suggestion-card cheap" onClick={() => setSelectedTrain(cheapest)}>
                      <div className="sugg-badge"><Award size={16} /> Cheapest</div>
                      <h3>{cheapest.name}</h3>
                      <p>₹{cheapest.price}</p>
                    </div>
                    <div className="suggestion-card fast" onClick={() => setSelectedTrain(fastest)}>
                      <div className="sugg-badge"><Clock size={16} /> Fastest</div>
                      <h3>{fastest.name}</h3>
                      <p>{Math.floor(calculateDuration(fastest.departure, fastest.arrival) / 60)}h {calculateDuration(fastest.departure, fastest.arrival) % 60}m</p>
                    </div>
                    <div className="suggestion-card optimal" onClick={() => setSelectedTrain(optimal)}>
                      <div className="sugg-badge"><MapPin size={16} /> Optimal</div>
                      <h3>{optimal.name}</h3>
                      <p>₹{optimal.price} • {Math.floor(calculateDuration(optimal.departure, optimal.arrival) / 60)}h {calculateDuration(optimal.departure, optimal.arrival) % 60}m</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <h2>Available Trains</h2>
        {trains.length === 0 ? (
          <p className="no-trains">No trains found. Try different stations.</p>
        ) : (
          trains.map(train => (
            <div key={train.id} className="train-card">
              <div className="train-header">
                <h3><Train size={20} /> {train.name}</h3>
                <span className={`class-badge ${train.class.toLowerCase()}`}>
                  {train.class}
                </span>
              </div>
              <div className="train-details">
                <div className="route">
                  <span className="station">{train.from}</span>
                  <span className="arrow">→</span>
                  <span className="station">{train.to}</span>
                </div>
                <div className="timings">
                  <span>{train.departure} - {train.arrival}</span>
                </div>
                <div className="info">
                  <span>💺 {train.seatsAvailable} seats available</span>
                  <span className="price">₹{train.price}</span>
                </div>
              </div>
              <button
                className="book-btn"
                onClick={() => setSelectedTrain(train)}
                disabled={train.seatsAvailable === 0}
              >
                {train.seatsAvailable === 0 ? 'Sold Out' : 'Book Now'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render My Bookings Page
  const renderBookings = () => (
    <div className="bookings-container">
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="no-bookings">No bookings yet. Book your first ticket!</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3><Ticket size={20} /> {booking.train?.name}</h3>
                <span className="pnr">PNR: {booking.pnr}</span>
              </div>
              <div className="booking-details">
                <p><strong>Route:</strong> {booking.train?.from} → {booking.train?.to}</p>
                <p><strong>Passenger:</strong> {booking.passengerName}, Age: {booking.age}</p>
                <p><strong>Seats:</strong> {booking.seats} | <strong>Total:</strong> ₹{booking.totalPrice}</p>
                <p><strong>Status:</strong> <span className="status-confirmed">{booking.status}</span></p>
                <p className="booking-date">Booked on: {new Date(booking.bookingDate).toLocaleDateString()}</p>
              </div>
              <button
                className="cancel-btn"
                onClick={() => handleCancelBooking(booking.id)}
              >
                Cancel Booking
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">🚂 RailwayBook</div>
        <div className="nav-links">
          <button onClick={() => setCurrentPage('home')}>Home</button>
          {user && (
            <button onClick={() => setCurrentPage('bookings')}>My Bookings</button>
          )}
          {!user ? (
            <button onClick={() => setCurrentPage('auth')} className="login-btn">
              <User size={18} /> Login
            </button>
          ) : (
            <div className="user-menu">
              <span>👤 {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentPage === 'home' && renderHome()}
        {currentPage === 'auth' && renderAuth()}
        {currentPage === 'bookings' && renderBookings()}
      </main>

      {/* Booking Modal */}
      {selectedTrain && (
        <div className="modal-overlay" onClick={() => setSelectedTrain(null)}>
          <div className="modal-content booking-modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedTrain(null)}>
              <X size={24} />
            </button>
            <h2>Book Ticket - {selectedTrain.name}</h2>
            <p className="route-info">{selectedTrain.from} → {selectedTrain.to}</p>

            <div className="booking-split">
              <form onSubmit={handleBookTicket} className="booking-form-side">
                <input
                  type="text"
                  placeholder="Passenger Name"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={passengerAge}
                  onChange={(e) => setPassengerAge(e.target.value)}
                  required
                  min="1"
                  max="120"
                />
                <div className="price-summary">
                  <div className="seats-tag">Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</div>
                  <div className="amount-row">
                    <span>Total Amount:</span>
                    <span className="total-price">₹{selectedTrain.price * selectedSeats.length}</span>
                  </div>
                </div>
                <button type="submit" className="confirm-btn" disabled={selectedSeats.length === 0}>
                  Confirm Booking
                </button>
              </form>

              <div className="seat-map-side">
                <h3>Select Seats</h3>
                <div className="seat-legend">
                  <div className="legend-item"><div className="legend-box available"></div> Available</div>
                  <div className="legend-item"><div className="legend-box selected"></div> Selected</div>
                  <div className="legend-item"><div className="legend-box booked"></div> Booked</div>
                </div>
                <div className="train-coach">
                  {(() => {
                    const total = selectedTrain.totalSeats || 60;
                    const booked = selectedTrain.bookedSeats || [];
                    const compartments = Math.ceil(total / 6);
                    const seatLayout = [];

                    for (let c = 0; c < compartments; c++) {
                      const base = c * 6;

                      const renderBerth = (num, colorClass) => {
                        if (num > total) return <div className="berth-invisible"></div>;
                        const seatId = `S${num}`;
                        const isBooked = booked.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);
                        return (
                          <div
                            key={seatId}
                            className={`berth ${colorClass} ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              if (isBooked) return;
                              if (isSelected) {
                                setSelectedSeats(prev => prev.filter(s => s !== seatId));
                              } else {
                                setSelectedSeats(prev => [...prev, seatId]);
                              }
                            }}
                            title={isBooked ? 'Booked' : `Seat ${seatId}`}
                          >
                            <div className="pillow"></div>
                            <span className="berth-num">{num}</span>
                          </div>
                        );
                      };

                      seatLayout.push(
                        <div key={`comp-${c}`} className="compartment">
                          <div className="comp-row">
                            <div className="berth-pair">
                              {renderBerth(base + 1, 'lower-berth')}
                              {renderBerth(base + 2, 'upper-berth')}
                            </div>
                            <div className="aisle-gap"></div>
                            <div className="berth-single">
                              {renderBerth(base + 6, 'side-upper')}
                            </div>
                          </div>
                          <div className="comp-row">
                            <div className="berth-pair">
                              {renderBerth(base + 3, 'lower-berth')}
                              {renderBerth(base + 4, 'upper-berth')}
                            </div>
                            <div className="aisle-gap"></div>
                            <div className="berth-single">
                              {renderBerth(base + 5, 'side-lower')}
                            </div>
                          </div>
                          <div className="comp-divider"></div>
                        </div>
                      );
                    }
                    return seatLayout;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;