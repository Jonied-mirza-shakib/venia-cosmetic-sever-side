const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
app.use(express.json())
app.use(cors())





const uri = `mongodb+srv://${process.env.ACCESS_USER_NAME}:${process.env.ACCESS_PASSWORD}@cluster0.oo1mtbb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next()
    });
}

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('cosmetic').collection('products');
        const blogCollection = client.db('cosmetic').collection('blog');
        const commentsCollection = client.db('cosmetic').collection('comments');
        const orderCollection = client.db('cosmetic').collection('order');
        const usersCollection = client.db('cosmetic').collection('users');

        app.post('/products', async (req, res) => {
            const query = req.body;
            const result = await productCollection.insertOne(query);
            res.send(result)
        })

        app.get('/user', async(req,res)=>{
            const user=await usersCollection.find().toArray();
            res.send(user)
        })
        app.get('/admin/:email', async(req,res)=>{
            const email=req.params.email;
            const user =await usersCollection.findOne({email:email});
            const isAdmin=user.role==='admin';
            res.send({admin: isAdmin})
        })

        app.put('/user/admin/:email',verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester=req.decoded.email;
            const requesterAccount= await usersCollection.findOne({email: requester});
            if(requesterAccount.role==='admin'){
                const filter = { email: email };
                const updateDoc = {
                    $set: {role:'admin'},
                };
                const result = await usersCollection.updateOne(filter, updateDoc);
                res.send(result)
            }else{
                res.status(403).send({message:'Forbidden access'})
            }
          
        })
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            var token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ result, token })
        })
        app.get('/products',verifyJWT, async (req, res) => {
            const query = {};
            const result = await productCollection.find(query).toArray();
            res.send(result)
        })
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.findOne(query)
            res.send(result)
        })
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updateProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateProduct.name,
                    price: updateProduct.price,
                    img: updateProduct.img
                },
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result)
        })

        app.post('/blog', async (req, res) => {
            const query = req.body;
            const result = await blogCollection.insertOne(query);
            res.send(result)
        })
        app.get('/blog', async (req, res) => {
            const query = {};
            const result = await blogCollection.find(query).toArray();
            res.send(result)
        })
        app.get('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogCollection.findOne(query);
            res.send(result)
        })
        app.put('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const updateBlog = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateBlog.name,
                    price: updateBlog.price,
                    img: updateBlog.img
                },
            };
            const result = await blogCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.delete('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogCollection.deleteOne(query);
            res.send(result)
        })

        app.get('/comments', async (req, res) => {
            const query = {};
            const result = await commentsCollection.find(query).toArray();
            res.send(result)
        })
        app.post('/comments', async (req, res) => {
            const query = req.body;
            const result = await commentsCollection.insertOne(query);
            res.send(result)
        })
        app.get('/order', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const result = await orderCollection.find(query).toArray();
                return res.send(result)
            } else {
                return res.status(403).send({ message: 'Forbidden access' });
            }

        })
        app.post('/order', async (req, res) => {
            const query = req.body;
            const result = await orderCollection.insertOne(query);
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