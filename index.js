const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Sports training camp Server is running')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.njyz70v.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db('SportsCampDb').collection('users')
    const classesCollection = client.db('SportsCampDb').collection('classes')
    const selectedClassCollection = client.db('SportsCampDb').collection('selectedClasses')
  


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
  


// instructor api



// make instructor
app.patch("/instructor/:id",async(req,res)=>{
  const id = req.params.id;
  const filter={_id: new ObjectId(id)};
  const updatedoc={
    $set:{
      role:"instructor",
    }
  };
  const result = await usersCollection.updateOne(filter,updatedoc);
  res.send(result)
})

// get  instractor role
app.get('/users/instractor/:email',async(req,res)=>{
  const email =req.params.email;
  const query={email:email}
  const user = await usersCollection.findOne(query);
  const result={instructor:user?.role === 'instructor'};
  res.send(result);
})

// get all instractor
app.get('/instructors',async(req,res)=>{
  const query = {role:'instructor'}
  const result = await usersCollection.find(query).toArray()
  res.send(result)

})

// Add class in db
app.post('/class',  async (req, res) => {
  const newClass = req.body;
 
  const result = await classesCollection.insertOne(newClass)
  res.send(result);
})

// get class for each instructor
app.get('/clases/:email',async(req,res)=>{
  const email = req.params.email;
  const query = {instructorEmail:email}
  const result = await classesCollection.find(query).toArray();
  res.send(result);
})

// update class
app.patch('/updateClass/:id',async(req,res)=>{
  const id = req.params.id;
  const updateClass=req.body;
  console.log(updateClass);
 
  const filter = { _id: new ObjectId(id) };
  const option = { upsert: true };
  
  const updateDoc = {
    $set: {
      
      price: updateClass.price,
      seats: updateClass.seats,
    },
  };
  const result = await classesCollection.updateOne(filter,updateDoc,option);
  // console.log(result);
  res.send(result);
})

// get single class using params
app.get("/class/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await classesCollection.findOne(query);
  // console.log(result);
  res.send(result);
});


// admin api's

// make admin
app.patch("/admin/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: "admin",
    },
  };
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);
});

// get admin role
app.get('/admin/:email',async (req, res) => {
  const email = req.params.email;
  const query = { email: email }
  const user = await usersCollection.findOne(query);
  const result = { admin: user?.role === 'admin' }
  res.send(result);
})

// approve class
app.patch('/approvedClass/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      status: 'approved'
    },
  };
  const result = await classesCollection.updateOne(filter, updateDoc);
  res.send(result);

})

// denied classs
app.patch('/deniedClass/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      status: 'denied'
    },
  };
  const result = await classesCollection.updateOne(filter, updateDoc);
  res.send(result);

})



// get all classes

app.get("/allClasses", async (req, res) => {
  const result = await classesCollection.find().toArray();
  res.send(result);
});




// students api's

// get approve classes
app.get('/allApprovedClasses',async(req,res)=>{
  const query = {status:'approved'}
  const result = await classesCollection.find(query).toArray()
  res.send(result)
})



app.post('/selectedClass', async (req, res) => {
  const id = req.body.id;
  // console.log(req.body);
  const selectBy = req.body.selectBy;
  // console.log(selectBy);

  const filter = { _id: new ObjectId(id) };
  const selectededClass = await classesCollection.findOne(filter);
  const newSelectededClass = {...selectededClass, status: "pending", selectBy}
  delete newSelectededClass._id;
  const result = await selectedClassCollection.insertOne(newSelectededClass)
  res.send(result);
})
app.get('/mySelectedClass/:email',async(req,res)=>{
  const email = req.params.email;
  console.log(email);
  const query = { selectBy: email, status: "pending" };
  const result = await selectedClassCollection.find(query).toArray();
  console.log(result);
  res.send(result);
})

// delete select class

app.delete("/selectClass/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await selectedClassCollection.deleteOne(query);
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


app.listen(port, () => {
  console.log(`Sports training camp is running on port ${port}`)
})