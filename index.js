const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { query } = require('express');
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qc9ei.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('sneak_Hub');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');

        //    GET Products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })

        // POST products
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the post api', product);

            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });

        //UPDATE status
        app.put('/updateOrder', async (req, res) => {
            const id = req.body.id;
            const query = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    'status': 'Approved'
                }
            };
            const result = await ordersCollection.updateOne(query, updatedDoc, options);
            res.send(result)
        });

        // DELETE from ALL Orders
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('deleting order with id ', id)
            res.send(result);
        })

        // GET All Orders
        app.get('/allorders', async (req, res) => {
            const email = req.query;
            const cursor = ordersCollection.find({});
            const allOrders = await cursor.toArray();
            res.send(allOrders);
        })
        // GET My Orders
        app.get('/myorders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // POST orders 
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log(order);
            res.json(result)
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello SneakHub!')
})

app.listen(port, () => {
    console.log(` listening at :${port}`)
})