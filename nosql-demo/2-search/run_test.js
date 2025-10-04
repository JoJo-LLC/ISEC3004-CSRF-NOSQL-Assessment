// run_tests.js
const fs = require("fs");
const axios = require("axios");

const FILE = process.argv[2] || "testCommands.txt";
const URL = process.argv[3] || "http://localhost:3000/search";

(async () => {
	if (!fs.existsSync(FILE)) {
		console.error("❌ Payload file not found:", FILE);
		process.exit(1);
	}

	const lines = fs
		.readFileSync(FILE, "utf8")
		.split(/\r?\n/)
		.filter((l) => l.trim() && !l.startsWith("#"));

	let i = 0;
	for (const line of lines) {
		i++;
		console.log(`\n=== Test #${i} ===`);
		console.log(`Payload: ${line}`);
		try {
			const res = await axios.post(URL, JSON.parse(line));
			console.log("✅ Response:", res.data);
		} catch (err) {
			if (err.response) {
				console.log(
					`❌ HTTP ${err.response.status}:`,
					JSON.stringify(err.response.data, null, 2)
				);
			} else {
				console.log("❌ Error:", err.message);
			}
		}
		await new Promise((r) => setTimeout(r, 500));
	}

	console.log(`\nDone. Ran ${i} tests.`);
})();
