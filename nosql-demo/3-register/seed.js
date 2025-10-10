/**
 * seed.js
 * Seed script for nosql-register demo.
 *
 * Usage:
 *   1) `cd ~/Documents/CYBERsec/ISEC3004-Assessment/nosql-demo/3-register`
 *   2) install dependencies (if not already installed in this folder):
 *        npm install mongodb bcryptjs
 *   3) run:
 *        node seed.js
 *
 * You can set MONGO_URI to override the default connection string:
 *   export MONGO_URI="mongodb://admin:admin123@127.0.0.1:27017/?authSource=admin"
 *
 * Default DB used: nosql-register
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/';
const MONGO_URI = process.env.MONGO_URI || DEFAULT_URI;
const DBNAME = process.env.DBNAME || 'nosql-register';

(async function main() {
  const client = new MongoClient(MONGO_URI, {
    // recommended options
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  });

  try {
    console.log('Connecting to MongoDB using:', MONGO_URI.includes('admin:') ? 'MONGO_URI (hidden)' : MONGO_URI);
    await client.connect();

    const db = client.db(DBNAME);
    const users = db.collection('users');

    // Clear existing seeded users (safe for demo)
    console.log(`Wiping collection "users" in database "${DBNAME}"...`);
    await users.deleteMany({});

    // Create a unique index on username
    console.log('Creating unique index on "username"...');
    await users.createIndex({ username: 1 }, { unique: true });

    // Passwords to seed (plain text here only to be hashed immediately)
    const plainUsers = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'alice', password: 'alicepw', role: 'user' },
      { username: 'bob',   password: 'bobpw',   role: 'user' }
    ];

    // Hash passwords and build docs
    console.log('Hashing passwords and preparing documents...');
    const docs = [];
    for (const u of plainUsers) {
      const hash = await bcrypt.hash(u.password, 10);
      docs.push({
        username: String(u.username),
        passwordHash: hash,
        role: u.role,
        createdAt: new Date()
      });
    }

    // Insert documents
    const res = await users.insertMany(docs);
    console.log(`Database seeded with ${res.insertedCount} users.`);

    // Print a compact summary (usernames and roles only)
    const summary = await users.find({}, { projection: { username: 1, role: 1, _id: 0 } }).toArray();
    console.log('Seeded users:', summary);

    // If you want an app-level admin user (for server auth) you already created a MongoDB admin user via mongosh
    // This script seeds application-level users (documents in 'users' collection).
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();