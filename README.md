# URL Shortener

A URL shortening service with user authentication, custom short links, click tracking, and an admin dashboard.

## Features

- User signup and login with JWT cookie-based auth
- Shorten any URL to an 8-character unique ID
- Click counter — tracks how many times each short link is visited
- User dashboard showing personal links
- Admin dashboard with visibility over all users' links
- Instant redirect on visiting a short URL

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Auth:** JWT, bcrypt
- **Templating:** EJS
- **Short ID:** `generate-unique-id`
- **Dev:** Nodemon

## Getting Started

### Prerequisites

- Node.js >= 14
- MongoDB (local or Atlas)

### Installation

```bash
git clone https://github.com/amanshakya2001/url-shortener-project.git
cd url-shortener-project
npm install
```

### Environment Variables

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

### Running

```bash
npm start
```

Visit `http://localhost:3000`

## Project Structure

```
├── models/       # Mongoose schemas (User, URL)
├── routes/       # Auth and URL routes
├── views/        # EJS templates
├── public/       # Static assets
└── index.js
```

## License

MIT
