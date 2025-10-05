const express = require('express');
const session = require('express-session');
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
    secure: false
  }
}));

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

// Defining login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Basic authentication check
  if (username === 'target' && password === 'password123') {
    req.session.username = username;
    // Shows transfer page
    res.send(`
      <html>
        <body>
          <h1>Hello ${username}!</h1>
          <p>Account Balance: ${accounts[username]}</p>
          <h2>Transfer Funds:</h2>
          <form action="/transfer" method="POST"> 
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

// Transfer endpoint
app.post('/transfer', (req, res) => {
  
  // Checks authentication
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
  console.log(`Server running on http://localhost:${PORT}`);
});