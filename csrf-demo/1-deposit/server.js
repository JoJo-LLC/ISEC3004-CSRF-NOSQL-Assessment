

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors({
  origin: 'http://localhost:8001',
  credentials: true
}));
const PORT = 3001;

// Simulated user accounts
let accounts = {
  'victim': 1000,
  'attacker': 500
};

// Middleware to parse form and JSON input
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CSRF-vulnerable deposit endpoint (now simulates transfer from victim)
app.post('/deposit', (req, res) => {
  const { to, amount } = req.body;
  const amt = parseInt(amount);

  if (!to || !amt || amt <= 0) {
    return res.status(400).send('Invalid input');
  }

  // Ensure victim has enough balance unless it's a self-deposit
  if (to !== 'victim' && accounts['victim'] < amt) {
    return res.status(400).send('❌ Victim has insufficient funds');
  }

  if (to !== 'victim') {
    accounts['victim'] -= amt;
    accounts[to] = (accounts[to] || 0) + amt;
    return res.send(`✅ Transferred $${amt} from victim to ${to}`);
  } else {
    accounts['victim'] += amt;
    return res.send(`✅ Victim deposited $${amt} to their own account`);
  }
});


// Add funds directly (for demo resets)
app.post('/addFunds', (req, res) => {
  const { to, amount } = req.body;
  const amt = parseInt(amount);

  if (!to || !amt || amt <= 0) {
    return res.status(400).send('Invalid input');
  }

  if (to === 'victim') {
    accounts['victim'] += amt;
    return res.send(`✅ Added $${amt} to victim's account`);
  }

  accounts[to] = (accounts[to] || 0) + amt;
  res.send(`✅ Added $${amt} to ${to}'s account`);
});

// View balances
app.get('/balance', (req, res) => {
  res.json(accounts);
});

app.listen(PORT, () => {
  console.log(`💸 CSRF Deposit Demo running at http://localhost:${PORT}`);
});