const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4p5kw6q.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // membership collection
    const membershipCollection = client
      .db("ScheduPlannr")
      .collection("membership");
    const notesCollection = client.db("ScheduPlannr").collection("notes");

    // User
    const userCollection = client.db("ScheduPlannr").collection("users");

    //time slots collection
    const fifteenMinsAmCollection = client
      .db("ScheduPlannr")
      .collection("fifteenMinsAM");
    const fifteenMinsPmCollection = client
      .db("ScheduPlannr")
      .collection("fifteenMinsPM");
    const thirtyMinsAmCollection = client
      .db("ScheduPlannr")
      .collection("thirtyMinsAM");
    const thirtyMinsPmCollection = client
      .db("ScheduPlannr")
      .collection("thirtyMinsPM");
    const sixtyMinsAMCollection = client
      .db("ScheduPlannr")
      .collection("sixtyMinsAM");
    const sixtyMinsPmCollection = client
      .db("ScheduPlannr")
      .collection("sixtyMinsPM");
    //Create Schedule
    const createSchedule = client
      .db("ScheduPlannr")
      .collection("createSchedule");

    // Team
    const uniqueCollection = client.db("ScheduPlannr").collection("team");
    // Users
    app.post("/users", async (req, res) => {
      const query = req.body;
      const result = await userCollection.insertOne(query);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    // Membership
    app.get("/membership", async (req, res) => {
      const query = {};
      const result = await membershipCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/membership/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      console.log(query);
      const membership = await membershipCollection.findOne(query);
      console.log(membership);
      res.send(membership);
    });

    // Add notes
    app.post("/notes", async (req, res) => {
      const query = req.body;
      const result = await notesCollection.insertOne(query);
      res.send(result);
    });

    // get notes
    app.get("/notes", async (req, res) => {
      const query = {};
      const cursor = notesCollection.find(query);
      const notes = await cursor.toArray();
      res.send(notes);
    });

    // get 15mins time slots AM
    app.get("/fifteenMinsAM", async (req, res) => {
      const query = {};
      const cursor = await fifteenMinsAmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 15mins time slots PM
    app.get("/fifteenMinsPM", async (req, res) => {
      const query = {};
      const cursor = await fifteenMinsPmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 30mins time slots AM
    app.get("/thirtyMinsAM", async (req, res) => {
      const query = {};
      const cursor = await thirtyMinsAmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 30mins time slots PM
    app.get("/thirtyMinsPM", async (req, res) => {
      const query = {};
      const cursor = await thirtyMinsPmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 60mins time slots AM
    app.get("/sixtyMinsAM", async (req, res) => {
      const query = {};
      const cursor = await sixtyMinsAMCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 60mins time slots PM
    app.get("/sixtyMinsPM", async (req, res) => {
      const query = {};
      const cursor = await sixtyMinsPmCollection.find(query).toArray();
      res.send(cursor);
    });

    //create schedule
    app.post("/createSchedule", async (req, res) => {
      const schedule = req.body;
      const query = {
        email: schedule.email,
        slot: schedule.slot,
        slotPm: schedule.slotPm,
      };
      const alreadyBooked = await createSchedule.find(query).toArray();
      if (alreadyBooked.length) {
        const message = `You have already booked on ${
          schedule.slot || schedule.slotPm
        }`;
        return res.send({ acknowledged: false, message });
      }
      const result = await createSchedule.insertOne(schedule);
      res.send(result);
    });

    // yeasin arafat
    app.post("/team", async (req, res) => {
      const user = req.body;
      const result = await uniqueCollection.insertOne(user);
      res.send(result);
    });
    app.get("/team", async (req, res) => {
      const query = {};
      const result = await uniqueCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
