# URL Shortener

A full-stack URL shortening service with click tracking, user authentication, and an admin dashboard.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Templating:** EJS
- **Auth:** JWT + Cookie-based sessions

## Features

- Shorten any long URL into an 8-character unique short link
- Redirect from short URL to original URL
- Track total click count per URL
- User authentication (signup, login)
- User dashboard to manage personal short URLs
- Admin dashboard to view all URLs across users
- Role-based access (user / admin)

## Project Structure

```
url-shortener-project/
├── controllers/       # Route handler logic
├── models/            # Mongoose schemas (URL, User)
├── routers/           # Express route definitions
├── middleware/        # Auth middleware
├── utils/             # JWT helpers
├── views/             # EJS templates (home, login, signup)
└── index.js           # App entry point
```

## How It Works

1. User submits a long URL via the dashboard
2. System generates a unique 8-character short ID
3. Short URL is stored in MongoDB linked to the user
4. Visiting `/:shortid` redirects to the original URL and increments the click counter

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=8000
```

### Run

```bash
node index.js
```

App runs on [http://localhost:8000](http://localhost:8000)
