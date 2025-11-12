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
    const bookingsCollection = db.collection("bookings");
    // Send a ping to confirm a successful connection

    // All services get
    // app.get('/services', async(req,res)=>{
    //     const result = await servicesCollection.find().toArray();
    //     res.send(result);
    // })
         // Get own Services
app.get('/services', async (req, res) => {
  try {
    const email = req.query.email;
    let query = {};

    if (email) {
      query['provider.email'] = { $regex: new RegExp(`^${email}$`, 'i') };
    }

    const result = await servicesCollection.find(query).toArray();
    res.send(result);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).send({ message: 'Server error' });
  }
});

    // Latest 6 services get
    app.get('/latest-services', async(req,res)=>{
        const result = await servicesCollection.find().limit(6).toArray();
        res.send(result);
    })

    // Single service get
    const { ObjectId } = require('mongodb');
    app.get('/services/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        // const query = { _id: id };
        const result = await servicesCollection.findOne(query);
        res.send(result);
    })
    // Bookings post
    app.post('/bookings', async(req,res)=>{
        const booking = req.body;

        // console.log(booking);
        const result = await bookingsCollection.insertOne(booking);
        res.send(result);
    })
    // Bookings get by email and populate service details
    app.get('/bookings', async(req,res)=>{
        const email = req.query.email;

        const pipeline = [
          {
            $match: { customerEmail: email }
          },
            {
              $lookup: {
                from: "services",
                let: { serviceId: { $toObjectId: "$serviceId" } },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$_id", "$$serviceId"] }
                    }
                  }
                ],
                as: "serviceDetails"
              }
            },
            {
              $unwind: "$serviceDetails"
            }
          ];
        const result = await bookingsCollection.aggregate(pipeline).toArray();
        res.send(result);
    })

    // Booking delete 
    app.delete('/bookings/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await bookingsCollection.deleteOne(query);
        res.send(result);
    })

    // Add Services
    app.post('/services',async(req,res)=>{
      const newServices = req.body;
      const result = await servicesCollection.insertOne(newServices);
      res.send(result);
    })


    // Price range route
    app.get('/services', async (req, res) => {
      const minPrice = parseFloat(req.query.minPrice) || 0;
      const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

      const query = {
        price: { $gte: minPrice, $lte: maxPrice } // Range filter
      };

      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });


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