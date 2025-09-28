

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3002;

// Fake user accounts
let accounts = {
  'victim': 1000,
  'attacker': 500
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Withdraw endpoint — vulnerable to CSRF
app.post('/withdraw', (req, res) => {
  const { from, to, amount } = req.body;
  if (!from || !to || !amount) return res.status(400).send('Invalid input');
  if (!accounts[from] || accounts[from] < amount) return res.status(400).send('Insufficient funds');

  accounts[from] -= parseInt(amount);
  accounts[to] = (accounts[to] || 0) + parseInt(amount);

  res.send(`✅ Transferred $${amount} from ${from} to ${to}`);
});

// View balances
app.get('/balance', (req, res) => {
  res.json(accounts);
});

app.listen(PORT, () => {
  console.log(`💸 CSRF Withdraw Demo running at http://localhost:${PORT}`);
});