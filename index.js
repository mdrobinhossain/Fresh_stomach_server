const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const upload = require('express-fileupload')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = 5000;
const adminEmail = 'johnydeb@gmail.com'

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('products'))
app.use(upload())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://mdrobinhossain12:mdrobinhossain12@cluster0.mgbyb.mongodb.net/freshvalley?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 30000 , keepAlive: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const productCollection = client.db('freshvalley').collection("products");
  const customerCollection = client.db('freshvalley').collection("customers");
  console.log('working ...')

  //UPLOADING PRODUCT WITH PHOTO
  app.post('/addproduct',(req, res)=> {
    const file = req.files.file;
    const random = Math.random()*1000000;
    const round = Math.round(random);
    const path = `${round.toString()}${file.name}`
    file.mv(`${__dirname}/products/${path}`)
    productCollection.insertOne({...req.body,photoURL:path},(err, result) => {
      if(err) console.log(err);
      else res.send(result);
    })
  })

  app.post('/deleteproduct',(req,res)=>{
    console.log(req.body);
    productCollection.deleteOne(req.body,(error,result)=>{
      if(error) console.log(error);
      res.send(result)
    })
  })
  //LOADING PRODUCTS 
  app.get('/loadproducts',(req, res) => {
    productCollection.find({}).toArray((err, result)=> {
      if(err) console.log(err);
      res.send(result);
    })
  })

  // UPLOADING CUSTOMER DETAIL
  app.post('/uploadcustomer',(req, res)=> {
    console.log(req.body)
    customerCollection.insertOne(req.body,(error, result) => {
      if(error) res.send({errorMessage:'Cannot Upload Detail'})
      res.send(result);
    })
  })
//UPDATING CUSTOMER
  app.post('/updatecustomer',(req,res)=>{
    customerCollection.updateOne({_id: ObjectId(req.body._id)},{$set: {accept: true}},(error,result)=>{
      if(error) console.log(error);
      res.send(result)
    })
  })

  //DELETE CUSTOMER
  app.post('/deletecustomer',(req,res)=>{
    customerCollection.deleteOne({_id:ObjectId(req.body._id)},(error,result)=>{
      if(error) console.log(error)
      res.send(result)
    })
  })
  // LOADING CUSTOMER DETAIL WITH CONDITION
  app.get('/loadcustomer',(req,res)=> {
    customerCollection.find({}).toArray((error,result)=>{
      if(error) console.log(error);
      res.send(result) 
    })
  })

  //LOADING CUSTOMER TO ILLUSTRATE IN UI
  app.post('/loadcustomerwithcondition',(req, res) => {
    if(req.body.email===adminEmail){
      customerCollection.find({})
      .toArray((error,result)=>{
        if(error) console.log(error);
        res.send(result)
      })
    }else{
      customerCollection.find({email:req.body.email})
      .toArray((error,result)=>{
        if(error) console.log(error);
        res.send(result)
      })
    }
  })

});


app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`)
})