

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/nosql-login')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Seed a default admin user
app.get('/seed', async (req, res) => {
  await User.deleteMany({});
  await User.create({ username: 'admin', password: 'admin123' });
  res.send('Database seeded with admin user.');
});

// Vulnerable login route (NoSQL Injection possible here)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // No validation or sanitation — raw query passed to MongoDB
  const user = await User.findOne({ username: username, password: password });

  if (user) {
    res.send('Login successful!');
  } else {
    res.status(401).send('Login failed.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
