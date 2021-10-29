const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//set up database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4mqcd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    //create new database
    const database = client.db("Take-me-tour");
    //create collections in database
    const packageCollection = database.collection("Packages");
    const userPackageCollection = database.collection("user-packages");

    //get all data from database (api)
    app.get("/packages", async (req, res) => {
      const result = await packageCollection.find({}).toArray();
      res.send(result);
    });
    //get one data using this data id
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await packageCollection.findOne(query);
      res.send(result);
    });
    //get all data from user package
    app.get("/user/package", async (req, res) => {
      const result = await userPackageCollection.find({}).toArray();
      res.send(result);
    });
    //get all data from one user
    app.post("/user/package", async (req, res) => {
      const userEmail = req.query.email;
      const query = { userEmail: { $in: [userEmail] } };
      const result = await userPackageCollection.find(query).toArray();
      res.send(result);
    });
    //post one data
    app.post("/packages", async (req, res) => {
      const data = req.body;
      const result = await packageCollection.insertOne(data);
      res.json(result);
    });
    //post one order from user
    app.post("/user/package/book", async (req, res) => {
      const data = req.body;
      const result = await userPackageCollection.insertOne(data);
      res.json(result);
    });
    //update api using id
    app.put("/user/package/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedPackages = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          bookingDate: updatedPackages.bookingDate,
          eventTitle: updatedPackages.eventTitle,
          phoneNumber: updatedPackages.phoneNumber,
          status: updatedPackages.status,
          userEmail: updatedPackages.userEmail,
          userName: updatedPackages.userName,
          img: updatedPackages.img,
        },
      };
      const result = await userPackageCollection.updateOne(
        query,
        updateDoc,
        options
      );

      res.json(result);
    });
    //delete one data by id
    app.delete("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await packageCollection.deleteOne(query);
      res.json(result);
    });
    //delete one from user register package collection
    app.delete("/user/package/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userPackageCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    //await client.close()
  }
}
run().catch(console.dir);

//root path to check all ok
app.get("/", (req, res) => {
  res.send("Back-End Ok");
});

app.listen(port, () => {
  console.log("Server running at port ", port);
});
