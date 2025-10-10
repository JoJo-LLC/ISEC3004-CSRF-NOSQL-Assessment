// check.js
const { MongoClient } = require("mongodb");
const uri =
	"mongodb://student:student123@127.0.0.1:27017/nosql-search?authSource=nosql-search";
(async () => {
	const c = new MongoClient(uri);
	try {
		await c.connect();
		const col = c.db("nosql-search").collection("movies");
		console.log("count:", await col.countDocuments());
		console.log(await col.find().toArray());
	} catch (e) {
		console.error(e);
	} finally {
		await c.close();
	}
})();
