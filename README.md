# 🚂 Railway Reservation System

A full-stack Railway Reservation System built using React (frontend) and Node.js + Express (backend).  
This project allows users to search trains, book tickets, manage bookings, and receive email notifications.

---

## 📌 Features

- 🔐 User Registration & Login (JWT Authentication)
- 🚆 View and Search Trains
- 🎟️ Ticket Booking System
- 💺 Seat Availability Management
- 🔢 Automatic PNR Generation
- 📜 View Booking History
- ❌ Cancel Booking
- 📧 Email Notifications:
  - Registration confirmation
  - Booking confirmation
  - Cancellation confirmation

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML, CSS, JavaScript

### Backend
- Node.js
- Express.js

### Other Tools
- Nodemailer
- JWT
- Bcrypt

---

## 📂 Project Structure

railway-fnl/
│
├── client/
├── server.js
├── package.json
└── README.md

---

## ⚙️ Setup Instructions

### Clone the Repository
git clone https://github.com/ashik-ongit/railway-fnl.git
cd railway-fnl

### Install Backend
npm install

### Run Backend
node server.js

### Run Frontend
cd client
npm install
npm start

---

## 📡 API Endpoints

POST /api/register  
POST /api/login  
GET /api/trains  
GET /api/trains/search  
POST /api/bookings  
GET /api/bookings/:userId  
DELETE /api/bookings/:bookingId  

---

## 👨‍💻 Author

Ashik K  
https://github.com/ashik-ongit

---

## ⭐ Notes

This is a demo project. Data resets when server restarts.
