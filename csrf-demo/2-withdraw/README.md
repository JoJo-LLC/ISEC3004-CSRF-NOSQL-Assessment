


# 🛡️ CSRF Attack Demo: 2-withdraw

This project demonstrates a CSRF (Cross-Site Request Forgery) vulnerability in a simple withdraw feature. The attacker can trick the victim into unknowingly transferring money from their account to the attacker’s account by auto-submitting a hidden form.

---

## 🚀 Getting Started

### 📁 1. Navigate to this folder

```bash
cd csrf-demo/2-withdraw
```

---

### 📦 2. Install dependencies (if not already done)

```bash
npm init -y
npm install express body-parser
```

---

### 🖥️ 3. Start the vulnerable server

```bash
node server.js
```

You should see:

```
💸 CSRF Withdraw Demo running at http://localhost:3002
```

---

### 🧪 4. Verify balances

Open this in your browser or with curl:

```
http://localhost:3002/balance
```

Expected output:

```json
{ "victim": 1000, "attacker": 500 }
```

---

### 🗡️ 5. Launch the attack

From the same folder, start a local web server to host the malicious page:

```bash
python3 -m http.server 8001
```

Now visit:

```
http://localhost:8001/attack.html
```

The form will auto-submit a request to transfer $500 from `victim` to `attacker`.

---

### 📊 6. Confirm the exploit

Refresh:

```
http://localhost:3002/balance
```

Expected result:

```json
{ "victim": 500, "attacker": 1000 }
```

---

## ⚠️ Vulnerability

The `/withdraw` endpoint does **not** check:
- Who initiated the request
- Whether the request came from the same site
- Whether the user explicitly consented

As a result, any website (like the attacker's) can submit forged POST requests as long as the victim is authenticated.

---

## 🛠️ Your Task

1. **Exploit**: Demonstrate the CSRF by triggering `attack.html`.
2. **Mitigate**: Implement one or more protections:
   - CSRF tokens
   - SameSite cookie flags
   - Check `Origin` / `Referer` headers
3. **Document**: Explain the attack and patch in your report.

---

## ✅ Mitigation Tips

- Use libraries like `csurf` in Express.
- Set cookies with `SameSite=Strict`.
- Reject requests with invalid `Origin` or `Referer` headers.

---

Good luck, hacker 🕵️‍♀️