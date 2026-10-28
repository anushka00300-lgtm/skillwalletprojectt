import React, { useState, useEffect } from 'react';
import {
  Film,
  Calendar,
  Clock,
  MapPin,
  Star,
  Search,
  CheckCircle,
  Ticket,
  User,
  LogOut,
  X,
  CreditCard,
  AlertCircle,
  Trash2
} from 'lucide-react';

const API_BASE = '/api';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'my-bookings'

  // Auth State
  const [token, setToken] = useState(localStorage.getItem('imovies_token') || '');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Booking Flow State
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [seatLayout, setSeatLayout] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // User's Bookings
  const [myBookings, setMyBookings] = useState([]);

  // Fetch current user if token exists
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
          } else {
            handleLogout();
          }
        })
        .catch(() => handleLogout());
    }
  }, [token]);

  // Fetch movies
  useEffect(() => {
    fetchMovies();
  }, [search, selectedGenre]);

  const fetchMovies = () => {
    setLoading(true);
    let url = `${API_BASE}/movies?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (selectedGenre !== 'All') url += `genre=${encodeURIComponent(selectedGenre)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMovies(data.movies);
        }
      })
      .catch(err => console.error('Error fetching movies:', err))
      .finally(() => setLoading(false));
  };

  // Fetch User Bookings
  const fetchMyBookings = () => {
    if (!token) return;
    fetch(`${API_BASE}/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMyBookings(data.bookings);
        }
      })
      .catch(err => console.error('Error fetching bookings:', err));
  };

  useEffect(() => {
    if (activeTab === 'my-bookings' && token) {
      fetchMyBookings();
    }
  }, [activeTab, token]);

  // Open Movie Booking Modal
  const handleOpenBooking = (movie) => {
    setSelectedMovie(movie);
    const defaultShowtime = movie.showtimes && movie.showtimes[0] ? movie.showtimes[0] : null;
    setSelectedShowtime(defaultShowtime);
    setSelectedSeats([]);
    if (defaultShowtime) {
      loadSeats(defaultShowtime.id);
    }
  };

  const loadSeats = (showtimeId) => {
    fetch(`${API_BASE}/showtimes/${showtimeId}/seats`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSeatLayout(data.layout);
          setOccupiedSeats(data.occupiedSeats);
        }
      })
      .catch(err => console.error('Error loading seats:', err));
  };

  const handleSelectShowtime = (st) => {
    setSelectedShowtime(st);
    setSelectedSeats([]);
    loadSeats(st.id);
  };

  // Toggle seat selection
  const handleToggleSeat = (seatCode, isOccupied) => {
    if (isOccupied) return;
    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatCode));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!selectedShowtime) return 0;
    return selectedSeats.reduce((sum, seatCode) => {
      const row = seatCode.charAt(0);
      let price = selectedShowtime.price;
      if (row === 'C' || row === 'D') price += 4;
      if (row === 'E' || row === 'F') price += 8;
      return sum + price;
    }, 0);
  };

  // Confirm Booking
  const handleConfirmBooking = () => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    setBookingLoading(true);
    fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        movieId: selectedMovie.id,
        showtimeId: selectedShowtime.id,
        seats: selectedSeats
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfirmedBooking(data.booking);
          setSelectedMovie(null);
          setSelectedSeats([]);
          fetchMovies();
        } else {
          alert(data.message || 'Booking failed');
        }
      })
      .catch(err => {
        console.error('Booking error:', err);
        alert('Error processing booking. Please try again.');
      })
      .finally(() => setBookingLoading(false));
  };

  // Cancel Booking
  const handleCancelBooking = (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking? Reserved seats will be released.')) {
      return;
    }

    fetch(`${API_BASE}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchMyBookings();
        } else {
          alert(data.message || 'Could not cancel booking');
        }
      })
      .catch(err => console.error('Cancel booking error:', err));
  };

  // Auth Submit
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
    fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('imovies_token', data.token);
          setToken(data.token);
          setUser(data.user);
          setShowAuthModal(false);
          setAuthForm({ name: '', email: '', password: '' });
        } else {
          setAuthError(data.message || 'Authentication failed');
        }
      })
      .catch(() => setAuthError('Unable to connect to authentication server'));
  };

  const handleDemoLogin = () => {
    setAuthForm({ name: '', email: 'demo@imovies.com', password: 'password123' });
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@imovies.com', password: 'password123' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('imovies_token', data.token);
          setToken(data.token);
          setUser(data.user);
          setShowAuthModal(false);
        } else {
          setAuthError(data.message || 'Demo login failed');
        }
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('imovies_token');
    setToken('');
    setUser(null);
    setActiveTab('movies');
  };

  const genres = ['All', 'Sci-Fi', 'Adventure', 'Action', 'Drama', 'Animation'];
  const featuredMovie = movies.find(m => m.featured) || movies[0];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container nav-container">
          <div
            className="brand-logo"
            onClick={() => {
              setActiveTab('movies');
              setSelectedGenre('All');
              setSearch('');
            }}
          >
            <Film size={28} color="#e11d48" />
            <span>IMOVIES</span>
            <span className="brand-badge">Cinema</span>
          </div>

          <div className="nav-links">
            <button
              className={`nav-btn ${activeTab === 'movies' ? 'active' : ''}`}
              onClick={() => setActiveTab('movies')}
            >
              <Film size={18} />
              Now Showing
            </button>

            {user && (
              <button
                className={`nav-btn ${activeTab === 'my-bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-bookings')}
              >
                <Ticket size={18} />
                My Bookings
              </button>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="user-badge">
                  <div className="avatar-circle">{user.name.charAt(0).toUpperCase()}</div>
                  <span>{user.name}</span>
                </div>
                <button className="nav-btn" onClick={handleLogout} title="Log Out">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                className="btn-primary"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setShowAuthModal(true);
                }}
              >
                <User size={18} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container" style={{ paddingBottom: '4rem' }}>
        {activeTab === 'movies' ? (
          <>
            {/* Hero Section Spotlight */}
            {featuredMovie && !search && selectedGenre === 'All' && (
              <div
                className="hero"
                style={{ backgroundImage: `url(${featuredMovie.backdrop || featuredMovie.poster})` }}
              >
                <div className="hero-overlay"></div>
                <div className="hero-content">
                  <div className="hero-tag">🔥 Featured Premiere</div>
                  <h1 className="hero-title">{featuredMovie.title}</h1>
                  <div className="hero-meta">
                    <span>
                      <Star size={18} color="#facc15" fill="#facc15" />
                      {featuredMovie.rating}/10
                    </span>
                    <span>
                      <Clock size={18} />
                      {featuredMovie.duration}
                    </span>
                    <span>{featuredMovie.genre}</span>
                  </div>
                  <p className="hero-desc">{featuredMovie.description}</p>
                  <button
                    className="btn-primary"
                    style={{ padding: '0.8rem 1.6rem', fontSize: '1.05rem' }}
                    onClick={() => handleOpenBooking(featuredMovie)}
                  >
                    <Ticket size={20} />
                    Book Tickets Now
                  </button>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="filter-bar">
              <div className="search-input-wrapper">
                <Search size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search movies by title, actors..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="genre-chips">
                {genres.map(genre => (
                  <button
                    key={genre}
                    className={`genre-chip ${selectedGenre === genre ? 'active' : ''}`}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Movie Grid */}
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {selectedGenre === 'All' ? 'Now In Theaters' : `${selectedGenre} Movies`}
            </h2>

            {loading ? (
              <div className="empty-state">
                <p>Loading premiering movies...</p>
              </div>
            ) : movies.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎬</div>
                <h3>No movies found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or genre filters.</p>
              </div>
            ) : (
              <div className="movies-grid">
                {movies.map(movie => (
                  <div key={movie.id} className="movie-card">
                    <div className="card-poster-wrap">
                      <img src={movie.poster} alt={movie.title} className="card-poster" />
                      <div className="card-rating">
                        <Star size={14} fill="#facc15" color="#facc15" />
                        <span>{movie.rating}</span>
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="card-genre">{movie.genre}</div>
                      <h3 className="card-title">{movie.title}</h3>
                      <div className="card-meta">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={14} />
                          {movie.duration}
                        </span>
                        <span>{movie.releaseYear}</span>
                      </div>
                      <button className="btn-primary card-btn" onClick={() => handleOpenBooking(movie)}>
                        <Ticket size={16} />
                        Select Showtimes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* My Bookings Tab */
          <div style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              My Tickets & Bookings
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              View your reserved seats, electronic boarding passes, and booking details.
            </p>

            {myBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎟️</div>
                <h3>No bookings yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  You haven't booked any movie tickets yet. Explore now showing movies!
                </p>
                <button className="btn-primary" onClick={() => setActiveTab('movies')}>
                  Browse Movies
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {myBookings.map(b => (
                  <div key={b.id} className="ticket-card">
                    <div className="ticket-header">
                      <div>
                        <span className="brand-badge" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                          CONFIRMED TICKET
                        </span>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{b.movieTitle}</h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                          Booking Reference: <strong style={{ color: '#fff' }}>{b.bookingCode}</strong>
                        </div>
                      </div>
                      <button
                        className="btn-outline"
                        style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                        onClick={() => handleCancelBooking(b.id)}
                      >
                        <Trash2 size={16} />
                        Cancel
                      </button>
                    </div>

                    <div className="ticket-grid">
                      <div>
                        <div className="ticket-field-label">Date</div>
                        <div className="ticket-field-value">{b.date || 'Today'}</div>
                      </div>
                      <div>
                        <div className="ticket-field-label">Showtime</div>
                        <div className="ticket-field-value">{b.showtime}</div>
                      </div>
                      <div>
                        <div className="ticket-field-label">Cinema Screen</div>
                        <div className="ticket-field-value">{b.screen}</div>
                      </div>
                      <div>
                        <div className="ticket-field-label">Seats ({b.seats.length})</div>
                        <div className="ticket-field-value" style={{ color: '#f43f5e' }}>
                          {b.seats.join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="barcode-strip">
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount Paid</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                          ${b.totalPrice}.00
                        </div>
                      </div>
                      <div
                        style={{
                          letterSpacing: '0.3em',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          color: '#64748b',
                          fontSize: '1.1rem'
                        }}
                      >
                        ||| | |||| | || | ||| ||||
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking / Seat Selection Modal */}
      {selectedMovie && (
        <div className="modal-backdrop" onClick={() => setSelectedMovie(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Seat Reservation
                </div>
                <h3 className="modal-title">{selectedMovie.title}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedMovie(null)}>
                <X size={22} />
              </button>
            </div>

            <div className="modal-body">
              {/* Showtime Selection */}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  Select Showtime & Theater:
                </div>
                <div className="showtime-pills">
                  {selectedMovie.showtimes &&
                    selectedMovie.showtimes.map(st => (
                      <div
                        key={st.id}
                        className={`showtime-pill ${selectedShowtime?.id === st.id ? 'selected' : ''}`}
                        onClick={() => handleSelectShowtime(st)}
                      >
                        <div className="showtime-time">{st.time}</div>
                        <div className="showtime-screen">{st.screen}</div>
                        <div className="showtime-price">${st.price}</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Theater Screen Visualizer */}
              <div className="screen-area">
                <div className="screen-bar"></div>
                <div className="screen-text">Cinema Screen This Way</div>
              </div>

              {/* Interactive Seat Matrix */}
              <div className="seat-matrix">
                {seatLayout.map(rowGroup => (
                  <div key={rowGroup.row} className="seat-row">
                    <span className="row-label">{rowGroup.row}</span>
                    {rowGroup.seats.map(seat => {
                      const isSelected = selectedSeats.includes(seat.code);
                      const isOccupied = occupiedSeats.includes(seat.code);

                      return (
                        <button
                          key={seat.code}
                          className={`seat-btn ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
                          disabled={isOccupied}
                          onClick={() => handleToggleSeat(seat.code, isOccupied)}
                          title={`${seat.code} (${seat.tier} - $${selectedShowtime ? selectedShowtime.price + (rowGroup.row === 'C' || rowGroup.row === 'D' ? 4 : rowGroup.row === 'E' || rowGroup.row === 'F' ? 8 : 0) : seat.price})`}
                        >
                          {seat.number}
                        </button>
                      );
                    })}
                    <span className="row-label">{rowGroup.row}</span>
                  </div>
                ))}
              </div>

              {/* Seat Legend */}
              <div className="seat-legend">
                <div className="legend-item">
                  <div className="legend-swatch" style={{ background: 'var(--seat-available)', border: '1px solid #475569' }}></div>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="legend-swatch" style={{ background: 'var(--seat-selected)', border: '1px solid #f43f5e' }}></div>
                  <span>Selected</span>
                </div>
                <div className="legend-item">
                  <div className="legend-swatch" style={{ background: 'var(--seat-occupied)', border: '1px solid #293042' }}></div>
                  <span>Reserved</span>
                </div>
              </div>

              {/* Tier Information */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.5rem',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '0.75rem'
                }}
              >
                <span>Rows A-B: Standard ($12+)</span>
                <span>Rows C-D: Prime ($16+)</span>
                <span>Rows E-F: VIP / Recliner ($20+)</span>
              </div>

              {/* Checkout Summary Bar */}
              <div className="booking-summary-bar">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Selected: <strong>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</strong>
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                    Total: <span style={{ color: '#38bdf8' }}>${calculateTotal()}.00</span>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.5rem' }}
                  disabled={bookingLoading || selectedSeats.length === 0}
                  onClick={handleConfirmBooking}
                >
                  <CreditCard size={18} />
                  {bookingLoading ? 'Processing...' : user ? 'Confirm & Book Seats' : 'Sign In to Reserve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation Dialog */}
      {confirmedBooking && (
        <div className="modal-backdrop" onClick={() => setConfirmedBooking(null)}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
              <CheckCircle size={60} color="#22c55e" style={{ margin: '0 auto 1.25rem' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Booking Confirmed!
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Your movie tickets have been reserved and added to your wallet.
              </p>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'left',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Movie:</span>
                  <strong>{confirmedBooking.movieTitle}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Showtime:</span>
                  <strong>{confirmedBooking.showtime} ({confirmedBooking.date})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Theater Screen:</span>
                  <strong>{confirmedBooking.screen}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Seats:</span>
                  <strong style={{ color: '#f43f5e' }}>{confirmedBooking.seats.join(', ')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Booking Code:</span>
                  <strong style={{ letterSpacing: '0.05em', color: '#38bdf8' }}>{confirmedBooking.bookingCode}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    setConfirmedBooking(null);
                    setActiveTab('my-bookings');
                  }}
                >
                  <Ticket size={18} />
                  View My Bookings
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setConfirmedBooking(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="modal-container" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {authMode === 'login' ? 'Sign In to IMovies' : 'Create an Account'}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowAuthModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                  }}
                >
                  Register
                </button>
              </div>

              {authError && (
                <div className="alert-box alert-error">
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit}>
                {authMode === 'register' && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Jane Doe"
                      required
                      value={authForm.name}
                      onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    required
                    value={authForm.email}
                    onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    required
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
                >
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div style={{ textAlign: 'center', margin: '1.2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ─── OR ───
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleDemoLogin}
              >
                ⚡ Quick Demo Login (Instant Access)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
