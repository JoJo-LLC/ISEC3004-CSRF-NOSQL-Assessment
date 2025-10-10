/**
 * server-secure.js - SECURE version with NoSQL injection mitigations
 */

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

const MONGO_URI = 'mongodb://127.0.0.1:27017/';
const DBNAME = 'nosql-register';

let db;
let usersColl;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DBNAME);
  usersColl = db.collection('users');
  console.log('Connected to MongoDB');
}

connectDB().catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Validates that input only contains allowed fields and correct types
function validateInput(data, allowedFields) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }

  const sanitized = {};
  
  for (const field of allowedFields) {
    const value = data[field];
    
    // Only accept strings - reject objects, arrays, etc.
    if (typeof value !== 'string') {
      return null;
    }
    
    if (field === 'username' && (value.length < 3 || value.length > 30)) {
      return null;
    }
    
    if (field === 'password' && (value.length < 6 || value.length > 100)) {
      return null;
    }
    
    sanitized[field] = value.trim();
  }
  
  return Object.keys(sanitized).length === allowedFields.length ? sanitized : null;
}

app.post('/register', async (req, res) => {
  try {
    // MITIGATION 1: Validate input - only accept username and password fields
    const input = validateInput(req.body, ['username', 'password']);
    
    if (!input) {
      return res.status(400).json({ message: 'Invalid input format' });
    }

    const { username, password } = input;

    const existingUser = await usersColl.findOne({ username: username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // MITIGATION 2: Role is hardcoded on server - never trust client input
    const newUser = {
      username: username,
      passwordHash: passwordHash,
      role: 'user',  // Always 'user' - cannot be changed by attacker
      createdAt: new Date()
    };

    await usersColl.insertOne(newUser);
    
    return res.status(201).json({ 
      message: 'User registered successfully',
      username: username
    });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    // MITIGATION 3: Validate input types
    const input = validateInput(req.body, ['username', 'password']);
    
    if (!input) {
      return res.status(400).json({ message: 'Invalid input format' });
    }

    const { username, password } = input;

    // Find user by username only (guaranteed to be a string)
    const user = await usersColl.findOne({ username: username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // MITIGATION 4: Use bcrypt.compare for password verification
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({ 
      message: 'Login successful!',
      user: {
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await usersColl.find({}, {
      projection: { username: 1, role: 1, _id: 0 }
    }).toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});