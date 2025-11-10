const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const cors = require('cors')
require('dotenv').config()
// middleware
app.use(cors())
app.use(express.json())


app.get('/',(req,res)=>{
    res.send('Hello World! from Express Server assignment')
})

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fqjmyg3.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("homehero");
    const servicesCollection = db.collection("services");
    // Send a ping to confirm a successful connection

    // All services get
    app.get('/services', async(req,res)=>{
        const result = await servicesCollection.find().toArray();
        res.send(result);
    })
     
    // Latest 6 services get
    app.get('/latest-services', async(req,res)=>{
        const result = await servicesCollection.find().limit(6).toArray();
        res.send(result);
    })
    






    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})