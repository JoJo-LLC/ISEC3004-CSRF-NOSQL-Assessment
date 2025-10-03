# 🛡️ NoSQL Injection Demo

This project demonstrates a **vulnerable** and a **secure** MongoDB search implementation using Node.js and Express.  
It is intended for **local demo and education only** — do not deploy either server to production without proper review.

---

## 📂 Project Files

-   `server.js` → **Vulnerable server** (accepts raw queries, unsafe).
-   `server_secure.js` → **Secure server** (sanitized queries, protections applied).
-   `seed.js` → Seeds the database with sample movies.
-   `check.js` → Utility to confirm seeded data.
-   `public/index.html` → Browser UI to test search.

---

## ⚙️ Setup

1. Install dependencies:

```bash
npm install
```

---

### 🗄️ 3. Seed the database

This step adds a few sample movies to the `movies` collection.

```bash
node seed.js
```

You should see:

```
✅ Database seeded with movie data.
```

---

### 🔌 4. Start the MongoDB server

In a new terminal tab/window:

```bash
mongod --dbpath /usr/local/var/mongodb --auth
```

Make sure MongoDB is **already configured** with:

-   Admin user: `admin / admin123`
-   Database user: `student / student123` on the `nosql-search` database

---

### 🖥️ 5. Run the Server

#### A. Vulnerable Server (server.js)

```bash
node server.js
```
#### B. Secure Server (server_secure.js)

```bash
node server_secure.js
```

You should see:

```
✅ Connected to MongoDB
🚀 Server running at http://localhost:3000
``
---

## 🧪 Testing the vulnerability

### ✅ Normal search (example)

```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"title": "The Matrix"}'
```

You should get the matching document if it exists.

---

### ❌ Injection-based search (vulnerable input)

```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"$where": "true"}'
```

If this returns _all_ movie data, the app is vulnerable to NoSQL injection.

---

## 🛠️ Your Task

1. **Exploit** this vulnerability.
2. **Demonstrate** the attack with example payloads.
3. **Mitigate** the issue by updating `server.js` securely.
4. **Document** the process in your report.

Good luck, hacker! 🕵️‍♂️
