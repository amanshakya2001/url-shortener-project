const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const generateUniqueId = require('generate-unique-id');

const Url = require('./models/urls');
const User = require('./models/users');
const { createJWTToken } = require('./utils/auth');
const { checkAuthentication } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8000;
const DOMAIN = process.env.DOMAIN || `http://localhost:${PORT}`;

mongoose.connect(process.env.MONGODB, { tlsAllowInvalidCertificates: true })
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => console.error('Database connection failed:', err.message));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Rate limit login/signup to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Please try again later.' },
});

app.use(checkAuthentication());

const isValidUrl = (str) => {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// ── Home ──────────────────────────────────────────────
app.get('/', async (req, res) => {
  try {
    let urls = [];
    if (req.role === 'user') urls = await Url.find({ userid: req.id }).sort({ createdAt: -1 });
    else if (req.role === 'admin') urls = await Url.find({}).populate('userid').sort({ createdAt: -1 });
    return res.status(200).render('home', { urls, email: req.email, role: req.role, domain: DOMAIN });
  } catch (error) {
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

app.post('/', async (req, res) => {
  try {
    if (!req.id) {
      return res.status(401).json({ error: 'Please log in to create short URLs.' });
    }
    const { redirecturl } = req.body;
    if (!redirecturl || !isValidUrl(redirecturl)) {
      return res.status(400).json({ error: 'Please provide a valid destination URL (must start with http/https).' });
    }
    const shortid = generateUniqueId({ length: 8 });
    await Url.create({ redirecturl, shortid, userid: req.id });
    return res.status(201).json({ message: 'Short URL created successfully.', url: `${DOMAIN}/${shortid}` });
  } catch (error) {
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

// ── Delete URL ────────────────────────────────────────
app.delete('/url/:shortid', async (req, res) => {
  try {
    if (!req.id) return res.status(401).json({ error: 'Please log in.' });
    const { shortid } = req.params;
    const query = req.role === 'admin' ? { shortid } : { shortid, userid: req.id };
    const deleted = await Url.findOneAndDelete(query);
    if (!deleted) return res.status(404).json({ error: 'Short URL not found or not authorised.' });
    return res.status(200).json({ message: 'Short URL deleted.' });
  } catch (error) {
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

// ── Auth ──────────────────────────────────────────────
app.get('/login', (req, res) => {
  if (req.email) return res.redirect('/');
  return res.status(200).render('login', { domain: DOMAIN });
});

app.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ error: 'No account found with that email address.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Incorrect email or password.' });
    const token = createJWTToken({ email: user.email, id: user.id, role: user.role });
    return res
      .cookie('sessionid', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
      .status(200).json({ message: 'Logged in successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

app.get('/signup', (req, res) => {
  if (req.email) return res.redirect('/');
  return res.status(200).render('signup', { domain: DOMAIN });
});

app.post('/signup', authLimiter, async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: 'Full name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ error: 'An account with this email already exists.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ fullname, email, password: hashedPassword });
    const token = createJWTToken({ email: user.email, id: user.id, role: user.role });
    return res
      .cookie('sessionid', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
      .status(201).json({ message: 'Account created successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

app.get('/logout', (_req, res) => {
  res.clearCookie('sessionid');
  return res.redirect('/');
});

// ── Redirect ──────────────────────────────────────────
app.get('/:shortid', async (req, res) => {
  try {
    const { shortid } = req.params;
    const url = await Url.findOneAndUpdate({ shortid }, { $inc: { clicks: 1 } }, { new: true });
    if (!url) return res.status(404).json({ error: 'Short link not found.' });
    return res.redirect(url.redirecturl);
  } catch (error) {
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

process.on('SIGTERM', () => mongoose.connection.close(() => process.exit(0)));

app.listen(PORT, () => console.log(`URL Shortener running on port ${PORT}`));
