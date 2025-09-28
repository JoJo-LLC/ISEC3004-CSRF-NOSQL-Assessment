

const { MongoClient } = require('mongodb');

const uri = 'mongodb://student:student123@127.0.0.1:27017/nosql-search?authSource=nosql-search';
const client = new MongoClient(uri);

async function seedDB() {
  try {
    await client.connect();
    const db = client.db('nosql-search');
    const collection = db.collection('movies');

    // Drop existing data
    await collection.deleteMany({});

    // Seed new movie data
    await collection.insertMany([
      { title: 'Inception', genre: 'Sci-Fi', year: 2010 },
      { title: 'The Matrix', genre: 'Sci-Fi', year: 1999 },
      { title: 'Titanic', genre: 'Romance', year: 1997 },
      { title: 'The Godfather', genre: 'Crime', year: 1972 },
      { title: 'Parasite', genre: 'Thriller', year: 2019 }
    ]);

    console.log('✅ Database seeded with movie data.');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  } finally {
    await client.close();
  }
}

seedDB();