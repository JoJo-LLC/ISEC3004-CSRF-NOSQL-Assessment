/**
 * server.js - Register module
 * Usage:
 *   cd ~/Documents/CYBERsec/ISEC3004-Assessment/nosql-demo/3-register
 *   npm install express body-parser mongodb bcryptjs helmet express-mongo-sanitize express-rate-limit
 *   node server.js
 */

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const { sanitizeFields, hasForbiddenKeys } = require('./user');

const app = express();
const PORT = 3000;

// Middlewares
app.use(bodyParser.json());
app.use(helmet());
app.use(mongoSanitize());
app.use(rateLimit({ windowMs: 60 * 1000, max: 20 }));

// Mongo connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@127.0.0.1:27017/?authSource=admin';
const DBNAME = process.env.DBNAME || 'nosql-register';

let db;
let usersColl;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DBNAME);
  usersColl = db.collection('users');

  // Ensure username uniqueness
  await usersColl.createIndex({ username: 1 }, { unique: true });
  console.log('✅ Connected to MongoDB');
}

connectDB().catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Safe register endpoint
app.post('/register', async (req, res) => {
  try {
    if (hasForbiddenKeys(req.body)) return res.status(400).send('Forbidden keys detected');

    const data = sanitizeFields(req.body, ['username', 'password']);
    if (!data) return res.status(400).send('Invalid input');

    // Hash password
    const hash = await bcrypt.hash(data.password, 10);

    const userDoc = {
      username: data.username,
      passwordHash: hash,
      role: 'user',
      createdAt: new Date()
    };

    await usersColl.insertOne(userDoc);
    return res.status(201).send({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).send({ message: 'Username already exists' });
    console.error(err);
    return res.status(500).send({ message: 'Server error' });
  }
});

// Optional vulnerable register endpoint
if (process.env.ALLOW_VULN === 'true') {
  app.post('/register-vuln', async (req, res) => {
    try {
      // purposely unsafe - for demo only
      await usersColl.insertOne({ username: req.body.username, password: req.body.password });
      res.status(201).send({ message: 'Vulnerable register added (demo only)' });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Server error' });
    }
  });
}

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    if (hasForbiddenKeys(req.body)) return res.status(400).send('Forbidden keys detected');

    const data = sanitizeFields(req.body, ['username', 'password']);
    if (!data) return res.status(400).send('Invalid input');

    const user = await usersColl.findOne({ username: data.username });
    if (!user) return res.status(401).send({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(data.password, user.passwordHash);
    if (!match) return res.status(401).send({ message: 'Invalid credentials' });

    return res.status(200).send({ message: 'Login successful!' });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});