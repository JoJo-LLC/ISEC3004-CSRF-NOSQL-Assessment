

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

// Simulated user accounts
let accounts = {
  'victim': 1000,
  'attacker': 500
};

// Middleware to parse form and JSON input
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CSRF-vulnerable deposit endpoint
app.post('/deposit', (req, res) => {
  const { to, amount } = req.body;
  if (!to || !amount) return res.status(400).send('Invalid input');
  accounts[to] = (accounts[to] || 0) + parseInt(amount);
  res.send(`✅ Deposited $${amount} to ${to}`);
});

// View balances
app.get('/balance', (req, res) => {
  res.json(accounts);
});

app.listen(PORT, () => {
  console.log(`💸 CSRF Deposit Demo running at http://localhost:${PORT}`);
});