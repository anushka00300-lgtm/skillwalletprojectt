const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Persistent Local Database Store (works standalone or alongside MongoDB)
const DATA_FILE = path.join(__dirname, 'database.json');

const INITIAL_MOVIES = [
  {
    id: "m1",
    title: "Dune: Part Two",
    genre: "Sci-Fi / Adventure",
    duration: "166 min",
    rating: "8.6",
    releaseYear: 2024,
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
    featured: true,
    showtimes: [
      { id: "st1-1", time: "10:30 AM", screen: "IMAX Laser", price: 18, date: "Today" },
      { id: "st1-2", time: "02:15 PM", screen: "Dolby Cinema", price: 16, date: "Today" },
      { id: "st1-3", time: "06:45 PM", screen: "IMAX Laser", price: 20, date: "Today" },
      { id: "st1-4", time: "09:30 PM", screen: "Screen 1 (Standard)", price: 12, date: "Today" },
      { id: "st1-5", time: "03:00 PM", screen: "IMAX Laser", price: 18, date: "Tomorrow" }
    ]
  },
  {
    id: "m2",
    title: "Oppenheimer",
    genre: "Biography / Drama / History",
    duration: "180 min",
    rating: "8.9",
    releaseYear: 2023,
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80",
    featured: true,
    showtimes: [
      { id: "st2-1", time: "11:00 AM", screen: "70mm IMAX", price: 22, date: "Today" },
      { id: "st2-2", time: "04:30 PM", screen: "Dolby Cinema", price: 16, date: "Today" },
      { id: "st2-3", time: "08:15 PM", screen: "70mm IMAX", price: 22, date: "Today" },
      { id: "st2-4", time: "05:00 PM", screen: "Screen 2", price: 13, date: "Tomorrow" }
    ]
  },
  {
    id: "m3",
    title: "Spider-Man: Across the Spider-Verse",
    genre: "Animation / Action / Adventure",
    duration: "140 min",
    rating: "8.7",
    releaseYear: 2023,
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    director: "Joaquim Dos Santos, Kemp Powers",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac", "Daniel Kaluuya"],
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80",
    featured: false,
    showtimes: [
      { id: "st3-1", time: "01:00 PM", screen: "Screen 3 (4DX)", price: 17, date: "Today" },
      { id: "st3-2", time: "04:15 PM", screen: "Dolby Atmos", price: 15, date: "Today" },
      { id: "st3-3", time: "07:30 PM", screen: "Screen 3 (4DX)", price: 17, date: "Today" }
    ]
  },
  {
    id: "m4",
    title: "Interstellar",
    genre: "Sci-Fi / Adventure / Drama",
    duration: "169 min",
    rating: "8.7",
    releaseYear: 2014,
    description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers.",
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    poster: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    featured: false,
    showtimes: [
      { id: "st4-1", time: "12:30 PM", screen: "IMAX Classic", price: 18, date: "Today" },
      { id: "st4-2", time: "06:00 PM", screen: "IMAX Classic", price: 20, date: "Today" },
      { id: "st4-3", time: "09:45 PM", screen: "Screen 1", price: 12, date: "Today" }
    ]
  },
  {
    id: "m5",
    title: "Cyberpunk: Neon Genesis",
    genre: "Action / Sci-Fi / Cyberpunk",
    duration: "135 min",
    rating: "8.4",
    releaseYear: 2025,
    description: "In a neon-drenched dystopia, a rogue memory-hacker discovers a digital conspiracy that threatens the freedom of the human mind.",
    director: "Alex Garland",
    cast: ["Ana de Armas", "Keanu Reeves", "Steven Yeun"],
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80",
    featured: true,
    showtimes: [
      { id: "st5-1", time: "02:45 PM", screen: "Dolby Atmos", price: 15, date: "Today" },
      { id: "st5-2", time: "08:00 PM", screen: "IMAX Laser", price: 19, date: "Today" },
      { id: "st5-3", time: "11:00 PM", screen: "Screen 4", price: 13, date: "Today" }
    ]
  },
  {
    id: "m6",
    title: "The Batman: Shadow of Arkham",
    genre: "Action / Crime / Mystery",
    duration: "155 min",
    rating: "8.5",
    releaseYear: 2024,
    description: "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.",
    director: "Matt Reeves",
    cast: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano", "Colin Farrell"],
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    featured: false,
    showtimes: [
      { id: "st6-1", time: "03:15 PM", screen: "Screen 2", price: 14, date: "Today" },
      { id: "st6-2", time: "07:15 PM", screen: "Dolby Cinema", price: 17, date: "Today" },
      { id: "st6-3", time: "10:15 PM", screen: "Screen 2", price: 14, date: "Today" }
    ]
  }
];

function loadDatabase() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading database file, resetting:', err);
  }

  // Pre-seed default user (demo: pass: password123) and some pre-booked seats
  const salt = bcrypt.genSaltSync(10);
  const demoHashed = bcrypt.hashSync('password123', salt);

  const initialDb = {
    users: [
      {
        id: "u_demo",
        name: "Demo Moviegoer",
        email: "demo@imovies.com",
        password: demoHashed,
        createdAt: new Date().toISOString()
      }
    ],
    movies: INITIAL_MOVIES,
    bookings: [
      {
        id: "bk-101",
        userId: "u_demo",
        movieTitle: "Dune: Part Two",
        movieId: "m1",
        showtimeId: "st1-3",
        showtime: "06:45 PM",
        screen: "IMAX Laser",
        date: "Today",
        seats: ["C4", "C5"],
        totalPrice: 40,
        bookingCode: "IMO-78921",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    // Map of showtimeId -> Array of booked seat codes (e.g. "C4", "C5")
    reservedSeats: {
      "st1-1": ["B3", "B4", "C5"],
      "st1-3": ["C4", "C5", "D5", "D6"],
      "st2-1": ["E5", "E6"],
      "st3-1": ["A1", "A2"]
    }
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

// ---------------- ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'IMovies Platform API' });
});

// AUTH: Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'User with this email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: 'u_' + Date.now(),
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);

  const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email }
  });
});

// AUTH: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// AUTH: Current User
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
});

// MOVIES: List movies (with optional search and genre filter)
app.get('/api/movies', (req, res) => {
  const { search, genre } = req.query;
  let result = [...db.movies];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(m => m.title.toLowerCase().includes(q) || m.cast.some(c => c.toLowerCase().includes(q)));
  }

  if (genre && genre !== 'All') {
    result = result.filter(m => m.genre.toLowerCase().includes(genre.toLowerCase()));
  }

  res.json({ success: true, count: result.length, movies: result });
});

// MOVIES: Get Movie by ID
app.get('/api/movies/:id', (req, res) => {
  const movie = db.movies.find(m => m.id === req.params.id);
  if (!movie) {
    return res.status(404).json({ success: false, message: 'Movie not found' });
  }
  res.json({ success: true, movie });
});

// SHOWTIMES & SEATS: Get seat layout and occupied seats for a showtime
app.get('/api/showtimes/:showtimeId/seats', (req, res) => {
  const { showtimeId } = req.params;
  const occupied = db.reservedSeats[showtimeId] || [];

  // Generate standard 6 rows (A to F) x 10 seats (1 to 10)
  // Rows A-B: Silver ($10), C-D: Gold ($15), E-F: VIP / Platinum ($20)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatLayout = rows.map(row => {
    let tier = 'Silver';
    let basePrice = 12;
    if (row === 'C' || row === 'D') {
      tier = 'Gold';
      basePrice = 16;
    } else if (row === 'E' || row === 'F') {
      tier = 'VIP / Platinum';
      basePrice = 20;
    }

    const seats = [];
    for (let i = 1; i <= 10; i++) {
      const seatCode = `${row}${i}`;
      seats.push({
        code: seatCode,
        number: i,
        row: row,
        tier: tier,
        price: basePrice,
        isOccupied: occupied.includes(seatCode)
      });
    }
    return { row, tier, basePrice, seats };
  });

  res.json({
    success: true,
    showtimeId,
    occupiedSeats: occupied,
    layout: seatLayout
  });
});

// BOOKINGS: Create Booking (Reserve Seats)
app.post('/api/bookings', authenticateToken, (req, res) => {
  const { movieId, showtimeId, seats } = req.body;

  if (!movieId || !showtimeId || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid booking data. Please select at least one seat.' });
  }

  const movie = db.movies.find(m => m.id === movieId);
  if (!movie) {
    return res.status(404).json({ success: false, message: 'Movie not found' });
  }

  const showtime = movie.showtimes.find(st => st.id === showtimeId);
  if (!showtime) {
    return res.status(404).json({ success: false, message: 'Showtime not found' });
  }

  // Check if any seat is already booked
  const currentlyOccupied = db.reservedSeats[showtimeId] || [];
  const conflicts = seats.filter(seat => currentlyOccupied.includes(seat));
  if (conflicts.length > 0) {
    return res.status(409).json({
      success: false,
      message: `Seats ${conflicts.join(', ')} are already booked. Please choose other seats.`,
      conflicts
    });
  }

  // Calculate total price based on showtime base price & tiers
  let totalPrice = 0;
  seats.forEach(seatCode => {
    const row = seatCode.charAt(0);
    let seatPrice = showtime.price;
    if (row === 'C' || row === 'D') seatPrice += 4;
    if (row === 'E' || row === 'F') seatPrice += 8;
    totalPrice += seatPrice;
  });

  // Mark seats as reserved
  db.reservedSeats[showtimeId] = [...currentlyOccupied, ...seats];

  const bookingCode = 'IMO-' + Math.floor(100000 + Math.random() * 900000);
  const newBooking = {
    id: 'bk-' + Date.now(),
    userId: req.user.id,
    userEmail: req.user.email,
    userName: req.user.name,
    movieId: movie.id,
    movieTitle: movie.title,
    moviePoster: movie.poster,
    showtimeId: showtime.id,
    showtime: showtime.time,
    date: showtime.date,
    screen: showtime.screen,
    seats: seats,
    totalPrice: totalPrice,
    bookingCode: bookingCode,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  db.bookings.unshift(newBooking);
  saveDatabase(db);

  res.status(201).json({
    success: true,
    message: 'Booking confirmed successfully!',
    booking: newBooking
  });
});

// BOOKINGS: Get User Bookings
app.get('/api/bookings/my', authenticateToken, (req, res) => {
  const userBookings = db.bookings.filter(b => b.userId === req.user.id);
  res.json({ success: true, count: userBookings.length, bookings: userBookings });
});

// BOOKINGS: Cancel Booking
app.delete('/api/bookings/:id', authenticateToken, (req, res) => {
  const bookingIndex = db.bookings.findIndex(b => b.id === req.params.id && b.userId === req.user.id);
  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
  }

  const booking = db.bookings[bookingIndex];

  // Free up reserved seats
  if (db.reservedSeats[booking.showtimeId]) {
    db.reservedSeats[booking.showtimeId] = db.reservedSeats[booking.showtimeId].filter(
      seat => !booking.seats.includes(seat)
    );
  }

  // Remove booking or mark cancelled
  db.bookings.splice(bookingIndex, 1);
  saveDatabase(db);

  res.json({
    success: true,
    message: 'Booking cancelled successfully. Reserved seats released.'
  });
});

app.listen(PORT, () => {
  console.log(`🎬 IMovies Backend Server running on port ${PORT}`);
  console.log(`Ready at http://localhost:${PORT}`);
});
