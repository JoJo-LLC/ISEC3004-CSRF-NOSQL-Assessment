// server_secure.js
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

const mongoUri =
	"mongodb://student:student123@127.0.0.1:27017/nosql-search?authSource=nosql-search";

// Serve static files from ./public
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10kb" })); // prevent big payload attacks
app.use(helmet()); // basic security headers

// Whitelist fields allowed in search
const ALLOWED_FIELDS = ["title", "genre", "year"];

function sanitizeQuery(input) {
	const query = {};
	for (const key of Object.keys(input)) {
		if (ALLOWED_FIELDS.includes(key)) {
			const value = input[key];
			// only allow primitive values (no objects like {$ne: ...})
			if (typeof value === "string" || typeof value === "number") {
				// safe substring search for strings
				if (typeof value === "string") {
					query[key] = { $regex: new RegExp(value, "i") };
				} else {
					query[key] = value;
				}
			}
		}
	}
	return query;
}

MongoClient.connect(mongoUri)
	.then((client) => {
		console.log("✅ Connected to MongoDB");
		const db = client.db("nosql-search");
		const movies = db.collection("movies");

		// Secured search endpoint
		app.post("/search", async (req, res) => {
			try {
				const query = sanitizeQuery(req.body);
				const results = await movies.find(query).limit(20).toArray(); // cap results
				res.json(results);
			} catch (err) {
				console.error("Search error:", err);
				res.status(500).send("Error searching");
			}
		});

		app.listen(port, () => {
			console.log(`🚀 Secure server running at http://localhost:${port}`);
		});
	})
	.catch((err) => {
		console.error("❌ MongoDB connection error:", err);
	});
