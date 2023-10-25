const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.em5b5wh.mongodb.net/?retryWrites=true&w=majority`;

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
        // client.connect();

        const toysCollection = client.db("ToyHeaven").collection("toys");


        // add toys from Add a toy route
        app.post('/toys', async (req, res) => {
            const toys = req.body;
            const result = await toysCollection.insertOne(toys);
            res.send(result);
        });


        // display toys to all toys route
        app.get('/alltoys', async (req, res) => {
            const query = {};
            const cursor = toysCollection.find(query)
            const toys = await cursor.limit(20).toArray()
            res.send(toys)
        })


        // display single toy details
        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const singleToy = await toysCollection.findOne(query);
            res.send(singleToy);
        })


        // userEmail query and sorting by price
        app.get('/toys', async (req, res) => {
            const sortBy = req.query;
            const userEmail = req.query;
            let query = {};
            if (userEmail) {
                query = { userEmail: req.query.userEmail }
            }

            let sortOption = {}; // Default sorting option

            if (sortBy.sortBy === 'asc') {
                sortOption = { price: 1 }; // Sort in ascending order

            } else if (sortBy.sortBy === 'desc') {
                sortOption = { price: -1 }; // Sort in descending order

            }
            const toys = await toysCollection.find(query).sort(sortOption).toArray();
            res.send(toys);
            console.error('Error fetching toys:', error);
            res.status(500).send('Internal Server Error');
        });


        // delete user product
        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            console.log("sussessfully deleted", result, "query", query, "id", id);
            res.send(result);
        })

        // update user pro product
        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    price: body.price,
                    quantity: body.quantity,
                    description: body.description,
                },
            };
            const result = await toysCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // display toys data by subcategory
        app.get("/allToysSubCategory/:subcategory", async (req, res) => {
            const subCategory = await toysCollection
                .find({
                    subcategory: req.params.subcategory,
                })
                .toArray();
            res.send(subCategory);
        });


        // search field implement
        app.get("/getToyNameByText/:text", async (req, res) => {
            const text = req.params.text;
            const result = await toysCollection
                .find({
                    $or: [
                        { toyName: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('ToyHeaven is running');
})

app.listen(port, () => console.log(`ToyHeaven running on ${port}`))