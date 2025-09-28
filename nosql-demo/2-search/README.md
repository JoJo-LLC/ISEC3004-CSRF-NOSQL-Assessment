

# 🛡️ NoSQL Injection Demo: 2-search

This project demonstrates a vulnerable **search** feature using MongoDB, intended for security testing and education. Your task is to identify the NoSQL injection vulnerability in this setup and implement a secure mitigation.

---

## 🚀 Getting Started

### 📁 1. Navigate to this folder

```bash
cd nosql-demo/2-search
```

---

### 📦 2. Install dependencies (if not already done)

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

- Admin user: `admin / admin123`
- Database user: `student / student123` on the `nosql-search` database

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

If this returns *all* movie data, the app is vulnerable to NoSQL injection.

---

## 🛠️ Your Task

1. **Exploit** this vulnerability.
2. **Demonstrate** the attack with example payloads.
3. **Mitigate** the issue by updating `server.js` securely.
4. **Document** the process in your report.

Good luck, hacker! 🕵️‍♂️