

# 🛡️ NoSQL Injection & XSS/XSRF Demo: 3-register

This project demonstrates secure and vulnerable versions of a **user registration** and **login** feature using MongoDB. It is intended for security testing and education, with a focus on **NoSQL Injection**, **XSS**, and **XSRF** risks.

---

## 🚀 Getting Started

### 📁 1. Navigate to this folder

```bash
cd nosql-demo/3-register
```

---

### 📦 2. Install dependencies

```bash
npm install
```

---

### 🗄️ 3. Seed the database

This script adds demo users (`admin`, `alice`, and `bob`) to the `nosql-register` database.

```bash
node seed.js
```

Expected output:

```
✅ Database seeded with 3 users.
Seeded users: [ { username: 'admin', role: 'admin' }, { username: 'alice', role: 'user' }, { username: 'bob', role: 'user' } ]
```

---

### 🔌 4. Start the MongoDB server

In a new terminal:

```bash
mongod --dbpath /usr/local/var/mongodb --auth
```

Ensure the following users are configured:

- Admin user: `admin / admin123`
- DB user: `student / student123` (has access to `nosql-register`)

---

### 🖥️ 5. Start the Node.js server

```bash
node server.js
```

You should see:

```
✅ Connected to MongoDB
🚀 Server running at http://localhost:3000
```

---

## 🧪 Testing the Application

### ✅ Register (Safe)

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "newuser", "password": "mypassword"}'
```

Expected:

```
{ "message": "User registered successfully" }
```

---

### ✅ Login (Safe)

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Expected:

```
{ "message": "Login successful!" }
```

---

### ❌ Register (Vulnerable – Optional)

Only enabled if you run the server with `ALLOW_VULN=true`.

```bash
ALLOW_VULN=true node server.js
```

Then:

```bash
curl -X POST http://localhost:3000/register-vuln \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": null}, "password": "hack"}'
```

If this allows bypassing checks or injection, the system is vulnerable to **NoSQL injection**.

---

## ⚠️ Vulnerability Examples

### 🔓 NoSQL Injection (register-vuln only)

Using `$ne`, `$gt`, or similar operators in the JSON payload:

```json
{ "username": { "$ne": null }, "password": "bypass" }
```

### 🔓 XSS (if inputs are rendered without sanitization)

Inject `<script>alert('XSS')</script>` as a username or field value and check where it appears in rendered HTML pages.

### 🔓 XSRF (Cross-Site Request Forgery)

If the server blindly accepts form posts from other origins (no CSRF tokens, CORS controls, or same-site cookie settings), you can try:

```html
<form action="http://localhost:3000/register" method="POST">
  <input type="hidden" name="username" value="attacker">
  <input type="hidden" name="password" value="123">
  <input type="submit">
</form>
```

---

## 🔐 Mitigation Summary

✅ Already applied in `server.js`:

- `express-mongo-sanitize` to remove `$` and `.` keys
- `helmet` to add security headers
- `rate-limit` to prevent brute-force
- Input whitelisting via `sanitizeFields()`
- Password hashing with `bcryptjs`
- Unique username index in MongoDB

🛠️ Not included but recommended:

- CSRF protection middleware (`csurf`)
- Client-side input validation (e.g. form escaping)
- Output escaping when rendering user input to HTML

---

## 🧪 Your Task

1. **Test** the `register` and `login` endpoints.
2. **Exploit** the optional `/register-vuln` endpoint.
3. **Inject** XSS payloads if any web UI is present.
4. **Try** basic CSRF via form injection.
5. **Patch** the system and explain mitigations in your report.

Good luck, hacker! 🕵️‍♀️🕵️‍♂️