const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const PORT = 3002;

// Defining accounts
let accounts = {
  'target': 1000,
  'attacker': 500
};

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Defining session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, 
    /* Mitigation 1: Cross Site Attack Mitigation */
    sameSite: 'strict' // Mitigates cross site attacks. May not work in this example due to localhost, but will work in practice
  }
}));

/* Mitigation 2: Synchroniser Token Pattern */

// Generating CSRF token
function genToken() {
  return crypto.randomBytes(16).toString('hex');
}

// Validates CSRF token 
function validateToken(req, res, next) {
  const embeddedToken = req.body.csrfToken; // Retrieving token from body which should be embedded in valid req
  const sessionToken = req.session.csrfToken; // Retrieving session token
  
  if (!embeddedToken || embeddedToken !== sessionToken) { 
    return res.status(403).send('Failed to validate csrf token'); // Triggers failure preventing transaction
  }
  
  next(); 
}

// Shows login page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Login</h1>
        <form action="/login" method="POST">
          <input type="text" name="username" placeholder="Username" required><br><br>
          <input type="password" name="password" placeholder="Password" required><br><br>
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
  `);
});

// Login endpoint
app.post('/login', (req, res) => {

  // Generates token if needed
  if (!req.session.csrfToken) {
    req.session.csrfToken = genToken();
  }

  const { username, password } = req.body;
  
  // Basic authentication check
  if (username === 'target' && password === 'password123') {
    req.session.username = username;
    
    // Shows transfer page with embedded CSRF token as hidden field
    res.send(`
      <html>
        <body>
          <h1>Hello ${username}!</h1>
          <p>Account Balance: $${accounts[username]}</p>
          <h2>Transfer Funds:</h2>
          <form action="/transfer" method="POST">
            <input type="hidden" name="csrfToken" value="${req.session.csrfToken}">
            <input type="text" name="recipient" placeholder="Transfer to" required><br><br>
            <input type="number" name="amount" placeholder="Amount" required><br><br>
            <button type="submit">Transfer</button>
          </form>
          <br>
          <a href="/logout">Logout</a>
        </body>
      </html>
    `);
  } else {
    res.status(401).send('Login failed');
  }
});

// Logout endpoint
app.get('/logout', (req, res) => {
  req.session.destroy(); // Destroys session
  res.redirect('/');
});

// Transfer endpoint - vulnerability mitigated by csrf check
app.post('/transfer', validateToken, (req, res) => {
  // Check authentication
  if (!req.session.username) {
    return res.status(401).send('Not authenticated');
  }
  
  const sender = req.session.username;
  const { recipient, amount } = req.body;
  
  if (!recipient || !amount) {
    return res.status(400).send('Missing variables');
  }
  
  if (accounts[sender] < amount) {
    return res.status(400).send('Not enough funds');
  }
  
  accounts[sender] -= parseInt(amount);
  accounts[recipient] = (accounts[recipient] || 0) + parseInt(amount);
  
  res.send(`Transferred: $${amount} from ${sender} to ${recipient}`); // shows successful transfer details
});

// Shows account balances
app.get('/balance', (req, res) => {
  res.json(accounts);
});

app.listen(PORT, () => {
  console.log(`Secure server running on http://localhost:${PORT}`);
});