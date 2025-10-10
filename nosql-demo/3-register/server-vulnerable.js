/**
 * server-vulnerable.js - VULNERABLE version for NoSQL injection demo
 */

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const MONGO_URI = 'mongodb://127.0.0.1:27017/';
const DBNAME = 'nosql-register';

let db;
let usersCollection;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DBNAME);
  usersCollection = db.collection('users');
  console.log('Connected to MongoDB');
}

connectDB().catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username exists
    const existingUser = await usersCollection.findOne({ username: username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // VULNERABILITY: Accepts 'role' field directly from user input
    // An attacker can send {"username": "hacker", "password": "test", "role": "admin"}
    const newUser = {
      username: username,
      passwordHash: passwordHash,
      role: req.body.role || 'user',  // Takes role from request body
      createdAt: new Date()
    };

    await usersCollection.insertOne(newUser);
    
    return res.status(201).json({ 
      message: 'User registered successfully',
      username: username,
      role: newUser.role
    });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // VULNERABILITY: No type checking - accepts objects
    // Attacker can send {"username": {"$ne": null}, "password": {"$ne": null}}
    // This bypasses authentication by using MongoDB query operators
    const user = await usersCollection.findOne({ 
      username: username,
      passwordHash: password  // Comparing directly without bcrypt
    });

    if (!user) {
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
    const users = await usersCollection.find({}, {
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