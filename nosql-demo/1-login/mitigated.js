
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // we use bcryptjs for Windows compatibility
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10kb' }));

// -------------------------
// Manual sanitizer
// -------------------------
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = sanitizeObject(obj[i]);
    }
    return obj;
  }
  const result = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.indexOf('.') !== -1) {
      // skip operator-looking keys and dotted keys
      continue;
    }
    const val = obj[key];
    if (val && typeof val === 'object') {
      result[key] = sanitizeObject(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    try {
      req.body = sanitizeObject(req.body);
    } catch (e) {
      console.warn('Sanitization error:', e);
    }
  }
  next();
}
app.use(sanitizeBody); // run AFTER express.json()

// -------------------------
// DB connection
// -------------------------
mongoose.connect('mongodb://127.0.0.1:27017/nosql-login')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// -------------------------
// Schema & model
// -------------------------
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }, // hashed
});

// Hash passwords before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      console.error('Hashing error:', e);
      return next(e);
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);

// -------------------------
// Helpers
// -------------------------
function validUsername(u) {
  return typeof u === 'string' && /^[A-Za-z0-9_]{3,30}$/.test(u);
}
function validPassword(p) {
  return typeof p === 'string' && p.length >= 8 && p.length <= 128;
}

// -------------------------
// Routes
// -------------------------
// Seed route (hashes password via pre-save hook)
app.get('/seed', async (req, res) => {
  try {
    await User.deleteMany({});
    await User.create({ username: 'admin', password: 'admin123' });
    return res.send('Database seeded with admin user (password hashed).');
  } catch (e) {
    console.error('Seed error:', e);
    return res.status(500).send('Seed failed.');
  }
});

// Debug route (temporary) - returns usernames and partial hash info
app.get('/__debug_users', async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, password: 1, _id: 0 }).lean();
    return res.json(users.map(u => ({
      username: u.username,
      hashPreview: typeof u.password === 'string' ? u.password.slice(0, 7) + '...' : null,
      hashLen: typeof u.password === 'string' ? u.password.length : null
    })));
  } catch (e) {
    console.error('Debug users error:', e);
    return res.status(500).send('Debug failed.');
  }
});

// Login route with logging for debugging
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Log what we received (safe: do not log passwords in production)
  console.log('DEBUG /login received:', { usernameType: typeof username, passwordType: typeof password });

  // Type check
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).send('Bad request: username and password must be strings.');
  }

  // Whitelist validation
  if (!validUsername(username) || !validPassword(password)) {
    return res.status(400).send('Bad request: invalid username or password format.');
  }

  const uname = username.trim();
  const user = await User.findOne({ username: uname }).exec();
  console.log('DEBUG login lookup:', { uname, found: !!user });

  if (!user) return res.status(401).send('Login failed.');

  const match = await bcrypt.compare(password, user.password);
  if (match) return res.send('Login successful!');
  else return res.status(401).send('Login failed.');
});

// -------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
