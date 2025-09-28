

const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const port = 3000;

app.use(express.json());

const mongoUri = "mongodb://student:student123@127.0.0.1:27017/nosql-search?authSource=nosql-search";

MongoClient.connect(mongoUri)
  .then(client => {
    console.log("✅ Connected to MongoDB");

    const db = client.db("nosql-search");
    const movies = db.collection("movies");

    // Vulnerable search endpoint
    app.post("/search", async (req, res) => {
      const query = req.body;
      try {
        const results = await movies.find(query).toArray();
        res.json(results);
      } catch (err) {
        res.status(500).send("Error searching");
      }
    });

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });