const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.njyz70v.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    const usersCollection = client.db('SportsCampDb').collection('users')
  


// save all user email on db
app.post("/users", async (req, res) => {
  const user = req.body;
  // console.log(user);
  const query = { email: user.email };
  const previousUser = await usersCollection.findOne(query);
  if (previousUser) {
    return res.send({ message: "user already exist" });
  }
  const result = await usersCollection.insertOne(user);
  res.send(result);
});

      // get users
      app.get("/allUsers", async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
      });
  
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Sports training camp Server is running')
})

app.listen(port, () => {
  console.log(`Sports training camp is running on port ${port}`)
})