# 🎬 IMovies – Online Movie Ticket Booking Platform

## Overview

**IMovies** is a seamless online platform that enhances the cinema experience by allowing users to browse movies, select showtimes, and reserve seats with real-time availability tracking.

Built with **Express.js** and **MongoDB**, it leverages a robust client-server architecture to ensure efficient data management and smooth performance.

This document is a complete guide to the setup, development, and technical architecture of the system.

---

## Key Features

- **Secure user authentication** (JWT-based)
- **Browse movies** and view details
- **Select showtimes** for each movie
- **Seat reservation** with real-time availability tracking
- **Booking management** (view and manage your bookings)
- **Intuitive, personalized interface** for convenient ticket reservations

---

## Skills Required

| Area | Skills |
|------|--------|
| Frontend | HTML, CSS, JavaScript, React.js, Bootstrap |
| Backend | Node.js, Express.js, Asynchronous JavaScript |
| Database | MongoDB |
| Security | JSON Web Token (JWT) |

---

## Project Stats

| Metric | Count |
|--------|-------|
| Total Epics | 6 |
| Total Tasks (Stories) | 19 |
| Total Subtasks | 0 |

**Mentor:** No mentor assigned yet

---

## System Requirements

To ensure smooth development, deployment, and usage of the **IMovies** web application, the following prerequisites must be met. They are grouped into software and hardware requirements.

### 1. Software Requirements

Essential tools and platforms required to develop, test, and run the application.

| Software | Version / Details | Purpose |
|----------|-------------------|---------|
| **Operating System** | Windows 10/11, macOS, or Linux | Cross-platform development and testing |
| **Node.js** | v16 or above | Runtime environment for frontend tooling and server-side logic; handles API routing — [Download](https://nodejs.org/) |
| **npm** | v8 or above | Package manager for installing React and related dependencies |
| **React.js** | Latest stable | Library for building dynamic, responsive user interfaces |
| **Express.js** | Latest stable | Lightweight web framework for building RESTful APIs |
| **MongoDB** | Latest stable | NoSQL database storing users, movies, showtimes, seats, and bookings — [Download](https://www.mongodb.com/try/download/community) |
| **Browser** | Google Chrome / Firefox (latest) | Rendering and testing the UI in real time |
| **Postman** | Latest | Testing APIs during development |
| **Visual Studio Code** | Latest | Preferred code editor with built-in Git and terminal support |

### 2. Hardware Requirements

Minimum and recommended specifications for developing and using the application.

| Component | Requirement | Reason |
|-----------|-------------|--------|
| **Processor** | Intel Core i5 (8th Gen or above) / AMD Ryzen 5 or better | Fast compilation and multitasking during development |
| **RAM** | Minimum 8 GB (16 GB recommended) | Running dev servers, IDE, and browser testing simultaneously |
| **Storage** | At least 1 GB free space | Package installations, MongoDB setup, and local project files |
| **Display** | 1366×768 or higher | Comfortable coding and accurate layout visualization |

---

## Technology Stack

```
Frontend  →  React.js, HTML5, CSS3, Bootstrap, JavaScript
Backend   →  Node.js, Express.js (RESTful APIs)
Database  →  MongoDB
Auth      →  JSON Web Tokens (JWT)
Tools     →  Postman, VS Code, Git
```

---

## Getting Started

```bash
# 1. Verify prerequisites
node -v      # should be v16 or above
npm -v       # should be v8 or above

# 2. Clone the repository
git clone <your-repository-url>
cd imovies

# 3. Install backend dependencies
cd server
npm install

# 4. Install frontend dependencies
cd ../client
npm install

# 5. Configure environment variables (server/.env)
#    PORT=5000
#    MONGO_URI=mongodb://localhost:27017/imovies
#    JWT_SECRET=your_secret_key

# 6. Run the application
cd ../server && npm start      # start the API server
cd ../client && npm start      # start the React app
```

---

## Architecture

```
┌──────────────┐   HTTP / JSON    ┌──────────────────┐   Mongoose   ┌───────────┐
│  React.js    │ ───────────────► │  Express.js API  │ ───────────► │  MongoDB  │
│  (Client)    │ ◄─────────────── │  (Node.js)       │ ◄─────────── │ (Database)│
└──────────────┘    JWT Auth      └──────────────────┘              └───────────┘
```

---

## License

This project is intended for educational purposes.
