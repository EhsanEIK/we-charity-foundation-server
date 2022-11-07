const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fbieij7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const activitiesCollection = client.db('weCharityDB').collection('activities');
        const myActivitiesCollection = client.db('weCharityDB').collection('myActivities');

        // JWT
        app.post('/jwt', (req, res) => {
            const user = req.body.currentUser;
        })

        // activity [GET all]
        app.get('/activities', async (req, res) => {
            const query = {};
            const activities = await activitiesCollection.find(query).toArray();
            res.send(activities);
        })

        // activity [GET one]
        app.get('/activities/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const activity = await activitiesCollection.findOne(query);
            res.send(activity);
        })

        // activity [POST]
        app.post('/activities', async (req, res) => {
            const activity = req.body;
            const result = await activitiesCollection.insertOne(activity);
            res.send(result);
        })

        // my activity cart [GET]
        app.get('/myActivities', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = { email: req.query.email };
            }
            const myActivites = await myActivitiesCollection.find(query).toArray();
            res.send(myActivites);
        })

        // my activity cart [POST]
        app.post('/myActivities', async (req, res) => {
            const myActiviity = req.body;
            const result = await myActivitiesCollection.insertOne(myActiviity);
            res.send(result);
        })

        // my activity cart [DELETE]
        app.delete('/myActivities/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await myActivitiesCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally { }
}
run().catch(error => console.error(error));

app.get('/', (req, res) => {
    res.send("We-The Charity Server is running");
})

app.listen(port, () => {
    console.log("Server is running on port:", port);
})