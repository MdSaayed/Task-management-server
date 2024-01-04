const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// midlewares
app.use(cors({
    origin: ['https://whimsical-pothos-194c11.netlify.app', 'http://localhost:5173'],
    credentials: true
}));


app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dejlh8b.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        const taskCollection = client.db("taskManagement").collection('tasks');

        app.post('/tasks', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);

        })

        //  tasks
        app.get('/tasks', async (req, res) => {
            const result = await taskCollection.find().toArray();
            res.send(result);
        })
        const { ObjectId } = require('mongodb');
        app.get('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const task = await taskCollection.findOne(filter);
            res.send(task);
        });



        // for drag and drop update
        app.patch("/updatedragstatus", async (req, res) => {
            const { id, status, order } = req.body;
            console.log(id, status);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: status,
                    order: order
                }
            }
            const result = await taskCollection.updateOne(filter, updateDoc);
            res.send(result)
        });


        // // update task 
        app.put('/taskUpdate/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            console.log(data);
            const options = { upsert: true };
            const filter = { _id: new ObjectId(id) };
            const update = {
                $set: {
                    title: data.title,
                    description: data.description,
                    deadline: data.deadline,
                    priority: data.priority,
                    status: data.status
                }
            };
            const result = await taskCollection.updateOne(filter, update, options);
            res.send(result);
        });

        // delete tasks
        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
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


app.get('/', (req, res) => {
    res.send('Server is running now');
});

app.listen(port, () => {
    console.log(`My server is running now on port, ${port}`);
});
