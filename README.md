# 🎬 IMovies – Online Movie Ticket Booking Platform

**IMovies** is a full-stack cinema ticket booking web application built with **React.js**, **Node.js**, **Express.js**, and **MongoDB/RESTful APIs**. It delivers a modern movie booking experience featuring real-time seat selection, showtime filtering, JWT authentication, and electronic ticket management.

---

## ✨ Features

- **🔐 User Authentication**: Secure registration and login using JWT (JSON Web Tokens) and bcrypt password hashing. Includes a 1-click Demo Account button.
- **🎥 Movie Showcase**: Browse premiering blockbuster movies with synopsis, ratings, durations, genres, director, and cast details.
- **🔍 Search & Genre Filter**: Real-time search and genre filtering (Sci-Fi, Adventure, Action, Drama, Animation, etc.).
- **🕒 Dynamic Showtimes**: Select showtimes across multiple theater screens (IMAX Laser, Dolby Cinema, 4DX, Standard).
- **💺 Interactive Seat Matrix**:
  - Realistic cinema screen visualizer.
  - Interactive seat layout with Rows (A–F) and Columns (1–10).
  - Tiered pricing (Standard, Prime, VIP / Recliner).
  - Real-time seat availability and conflict prevention.
- **🎟️ E-Ticket Generation**: Instant confirmed boarding pass with unique booking reference code, hall, seat numbers, and barcode.
- **📋 Booking Management**: View reserved tickets under "My Bookings" with an option to cancel reservations and immediately release reserved seats.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Modern CSS3
- **Backend**: Node.js, Express.js, CORS, JSON Web Token (JWT), Bcrypt.js
- **Database**: MongoDB / Mongoose support with built-in persistent fallback data store
- **Architecture**: RESTful Client-Server API

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Run the Application

In one terminal, start the backend server:
```bash
cd server
node server.js
```
*Backend runs on `http://localhost:5000`*

In another terminal, start the frontend dev server:
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🔑 Demo Account

- **Email**: `demo@imovies.com`
- **Password**: `password123`
*(Or click "Quick Demo Login" in the Sign In modal)*
