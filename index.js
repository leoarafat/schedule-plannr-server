const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4p5kw6q.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {

  const usersCollection = client.db("ScheduPlannr").collection("users");
  app.post("/users", async (req, res) => {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.send(result);
  });
app.get('/users', async(req, res)=>{
  const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
})
  try {
    // const usersCollection = client.db("lens-lab").collection("users");
  } finally {
  try {
    const membershipCollection = client.db("ScheduPlannr").collection("membership");
    const notesCollection = client.db("ScheduPlannr").collection("notes");

    app.get('/membership', async (req, res) => {
      const query = {}
      const result = await membershipCollection.find(query).toArray();
      res.send(result)
    })

    // Add notes
    app.post('/notes', async (req, res) => {
      const query = req.body;
      const result = await notesCollection.insertOne(query);
      res.send(result);
    })

    // get notes
    app.get('/notes', async (req, res) => {
      const query = {};
      const cursor = notesCollection.find(query);
      const notes = await cursor.toArray();
      res.send(notes)
    })
  }
  finally {

>>>>>>> 4c8c63c9373cfdffeb6022b9d4a172f3f3
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
