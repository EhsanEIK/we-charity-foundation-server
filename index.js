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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fbieij7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const activitiesCollection = client.db('weCharityDB').collection('activities');
        const myActivitiesCollection = client.db('weCharityDB').collection('myActivities');

        // JWT
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ token });
        })

        // activity [GET all]
        app.get('/activities', async (req, res) => {
            const query = {};
            const activities = await activitiesCollection.find(query).toArray();
            res.send(activities);
        })

        // activity [GET one]
        app.get('/activities/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const activity = await activitiesCollection.findOne(query);
            res.send(activity);
        })

        // activity [POST]
        app.post('/activities', verifyJWT, async (req, res) => {
            const activity = req.body;
            const result = await activitiesCollection.insertOne(activity);
            res.send(result);
        })

        // my activity cart [GET]
        app.get('/myActivities', verifyJWT, async (req, res) => {
            if (req.decoded.currentUser !== req.query.email) {
                return res.status(403).send({ message: 'unauthorized access' });
            }
            let query = {};
            if (req.query.email) {
                query = { email: req.query.email };
            }
            const myActivites = await myActivitiesCollection.find(query).toArray();
            res.send(myActivites);
        })

        // my activity cart [POST]
        app.post('/myActivities', verifyJWT, async (req, res) => {
            const myActiviity = req.body;
            const result = await myActivitiesCollection.insertOne(myActiviity);
            res.send(result);
        })

        // my activity cart [DELETE]
        app.delete('/myActivities/:id', verifyJWT, async (req, res) => {
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