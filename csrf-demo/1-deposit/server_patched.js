const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Middleware to check origin header
function checkOrigin(req, res, next) {
  const origin = req.headers.origin;
  console.log("🔍 Origin header received:", origin);
  if (origin !== 'http://localhost:8001') {
    return res.status(403).send('🚫 CSRF attempt blocked: invalid origin');
  }
  next();
}

const app = express();
app.use(cors({
  origin: 'http://localhost:8001',
  credentials: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware to simulate session
app.use((req, res, next) => {
  // Simulate cookie-based session
  res.cookie('session', 'victim-session-cookie', {
    httpOnly: true,
    sameSite: 'Strict' // Prevent cross-site usage of this cookie
  });
  if (!req.cookies.csrfToken) {
    const token = Math.random().toString(36).substring(2);
    res.cookie('csrfToken', token);
  }
  next();
});

function doubleSubmitCheck(req, res, next) {
  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers['x-csrf-token'];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).send('🚫 CSRF blocked: Double Submit check failed.');
  }
  next();
}

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.cookies.csrfToken });
});

const accounts = {
  victim: 1000,
  attacker: 2500
};

app.get('/balance', checkOrigin, (req, res) => {
  res.json(accounts);
});

app.post('/deposit', checkOrigin, doubleSubmitCheck, (req, res) => {
  const { to, amount } = req.body;
  const amt = parseInt(amount);

  if (!to || !amt || amt <= 0) {
    return res.status(400).send('Invalid input');
  }

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


app.post('/addFunds', (req, res) => {
  const { to, amount } = req.body;
  const amt = parseInt(amount);

  if (!to || !amt || amt <= 0) {
    return res.status(400).send('Invalid input');
  }

  accounts[to] = (accounts[to] || 0) + amt;
  res.send(`✅ Added $${amt} to ${to}'s account`);
});

// Temporary route to clear session cookie (for demo reset)
app.get('/reset-cookie', (req, res) => {
  res.clearCookie('session');
  res.send('🍪 Session cookie cleared. You now have no session.');
});

app.listen(3001, () => {
  console.log('🛡️ Double Submit Cookie Server running at http://localhost:3001');
});