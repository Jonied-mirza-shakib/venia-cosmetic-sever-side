const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(express.json())
app.use(cors())





const uri = `mongodb+srv://${process.env.ACCESS_USER_NAME}:${process.env.ACCESS_PASSWORD}@cluster0.oo1mtbb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('cosmetic').collection('products');
        const blogCollection = client.db('cosmetic').collection('blog');
        const commentsCollection = client.db('cosmetic').collection('comments');

        app.get('/products', async (req, res) => {
            const query = {};
            const result = await productCollection.find(query).toArray();
            res.send(result)
          })
        app.get('/products/:id', async (req, res) => {
            const id=req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productCollection.findOne(query)
            res.send(result)
          })
        app.get('/blog',async(req,res)=>{
            const query={};
            const result=await blogCollection.find(query).toArray();
            res.send(result)
        })
        app.get('/blog/:id',async(req,res)=>{
           const id=req.params.id;
           const query={_id:ObjectId(id)};
           const result=await blogCollection.findOne(query);
           res.send(result)
        })

        app.get('/comments',async(req,res)=>{
            const query={};
            const result=await commentsCollection.find(query).toArray();
            res.send(result)
        })
        app.post('/comments',async(req,res)=>{
            const query=req.body;
            const result= await commentsCollection.insertOne(query);
            res.send(result)
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})