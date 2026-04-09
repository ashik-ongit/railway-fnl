const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const app = express();
const PORT = 5000;
const SECRET_KEY = 'railway_secret_key_2024';

// Email setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "kashikashik09@gmail.com",
    pass: "zvrtotfdbumhjnlt"
  }
});

transporter.verify((error) => {
  if (error) console.log("EMAIL ERROR:", error);
  else console.log("Email server is ready");
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory databases
let users = [];
let trains = [
  { id: 1, name: 'Chennai Express', from: 'Chennai', to: 'Mumbai', departure: '06:00 AM', arrival: '10:00 PM', price: 1200, seatsAvailable: 50, totalSeats: 50, bookedSeats: [], class: 'Sleeper' },
  { id: 2, name: 'Rajdhani Express', from: 'Delhi', to: 'Mumbai', departure: '04:30 PM', arrival: '08:30 AM', price: 2500, seatsAvailable: 30, totalSeats: 30, bookedSeats: [], class: 'AC' },
  { id: 3, name: 'Shatabdi Express', from: 'Chennai', to: 'Bangalore', departure: '06:00 AM', arrival: '11:00 AM', price: 800, seatsAvailable: 40, totalSeats: 40, bookedSeats: [], class: 'AC' },
  { id: 4, name: 'Duronto Express', from: 'Bangalore', to: 'Delhi', departure: '08:00 PM', arrival: '06:00 AM', price: 2200, seatsAvailable: 25, totalSeats: 25, bookedSeats: [], class: 'AC' },
  { id: 5, name: 'Mumbai Local', from: 'Mumbai', to: 'Pune', departure: '07:00 AM', arrival: '10:30 AM', price: 400, seatsAvailable: 60, totalSeats: 60, bookedSeats: [], class: 'General' },
  { id: 6, name: 'Konkan Express', from: 'Chennai', to: 'Goa', departure: '09:00 AM', arrival: '08:00 PM', price: 1500, seatsAvailable: 35, totalSeats: 35, bookedSeats: [], class: 'Sleeper' },
  { id: 7, name: 'Howrah Express', from: 'Delhi', to: 'Kolkata', departure: '05:00 PM', arrival: '09:00 AM', price: 1800, seatsAvailable: 45, totalSeats: 45, bookedSeats: [], class: 'Sleeper' },
  { id: 8, name: 'Tejas Express', from: 'Mumbai', to: 'Goa', departure: '05:00 AM', arrival: '01:00 PM', price: 1100, seatsAvailable: 50, totalSeats: 50, bookedSeats: [], class: 'AC' }
];
let bookings = [];

// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  const userExists = users.find(u => u.email === email);
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: hashedPassword,
    phone
  };

  users.push(newUser);

  transporter.sendMail({
    from: "kashikashik09@gmail.com",
    to: email,
    subject: "Registration Successful",
    text: `Hello ${name}, your railway account has been created successfully.`
  });

  res.status(201).json({ message: 'User registered successfully + email sent' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '24h' });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
  });
});

// Get all trains
app.get('/api/trains', (req, res) => {
  res.json(trains);
});

// Search trains
app.get('/api/trains/search', (req, res) => {
  const { from, to } = req.query;

  let filteredTrains = trains;

  if (from && to) {
    filteredTrains = trains.filter(
      t => t.from.toLowerCase() === from.toLowerCase() &&
           t.to.toLowerCase() === to.toLowerCase()
    );
  } else if (from) {
    filteredTrains = trains.filter(t => t.from.toLowerCase() === from.toLowerCase());
  } else if (to) {
    filteredTrains = trains.filter(t => t.to.toLowerCase() === to.toLowerCase());
  }

  res.json(filteredTrains);
});

// Booking
app.post('/api/bookings', (req, res) => {
  const { trainId, userId, passengerName, age, seats, selectedSeats, totalPrice } = req.body;

  const train = trains.find(t => t.id === trainId);
  if (!train) return res.status(404).json({ message: 'Train not found' });

  if (train.seatsAvailable < seats) {
    return res.status(400).json({ message: 'Not enough seats available' });
  }

  train.seatsAvailable -= seats;
  if (selectedSeats) train.bookedSeats.push(...selectedSeats);

  const booking = {
    id: bookings.length + 1,
    trainId,
    userId,
    passengerName,
    age,
    seats,
    selectedSeats: selectedSeats || [],
    totalPrice,
    bookingDate: new Date().toISOString(),
    pnr: 'PNR' + Math.floor(1000000000 + Math.random() * 9000000000),
    status: 'Confirmed'
  };

  bookings.push(booking);

  const user = users.find(u => u.id === userId);

  if (user) {
    transporter.sendMail({
      from: "kashikashik09@gmail.com",
      to: user.email,
      subject: "Ticket Booking Confirmed",
      text: `Hello ${user.name},

Your ticket is confirmed!

Train ID: ${trainId}
Passenger: ${passengerName}
Seats: ${seats}
PNR: ${booking.pnr}`
    });
  }

  res.status(201).json({ message: 'Booking successful', booking });
});

// ✅ Get user bookings (RESTORED)
app.get('/api/bookings/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);

  const userBookings = bookings.filter(b => b.userId === userId);

  const bookingsWithTrains = userBookings.map(booking => {
    const train = trains.find(t => t.id === booking.trainId);
    return { ...booking, train };
  });

  res.json(bookingsWithTrains);
});

// Cancel booking
app.delete('/api/bookings/:bookingId', (req, res) => {
  const bookingId = parseInt(req.params.bookingId);
  const index = bookings.findIndex(b => b.id === bookingId);

  if (index === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const booking = bookings[index];
  const train = trains.find(t => t.id === booking.trainId);

  const user = users.find(u => u.id === booking.userId);

  if (user) {
    transporter.sendMail({
      from: "kashikashik09@gmail.com",
      to: user.email,
      subject: "Ticket Cancelled",
      text: `Hello ${user.name},

Your ticket with PNR ${booking.pnr} has been cancelled successfully.`
    });
  }

  if (train) {
    train.seatsAvailable += booking.seats;
    if (booking.selectedSeats && booking.selectedSeats.length > 0) {
      train.bookedSeats = train.bookedSeats.filter(s => !booking.selectedSeats.includes(s));
    }
  }

  bookings.splice(index, 1);

  res.json({ message: 'Booking cancelled successfully' });
});

app.listen(PORT, () => {
  console.log(`🚂 Railway Server running on http://localhost:${PORT}`);
});