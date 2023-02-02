const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  ObjectID,
} = require("mongodb");

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
    const teamCollection = client.db("ScheduPlannr").collection("team");

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
    app.get("/user", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = userCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });
    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectID(id) };
      const user = req.body;
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          name: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
          birthDate: user.birthDate,
          contactNumber: user.contactNumber,
          currentAddress: user.currentAddress,
          permanentAddress: user.permanentAddress,
          gender: user.gender,
          profession: user.profession,
          about: user.about,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, option);
      console.log(result);
      res.send(result);
    });

    // admin 
    app.get('/user/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'admin' })
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
      const cursor = await notesCollection
        .find(query)
        .sort({ $natural: -1 })
        .toArray();
      res.send(cursor);
    });

    app.get("/notes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await notesCollection.findOne(query);
      res.send(cursor);
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
      const result = await teamCollection.insertOne(user);
      res.send(result);
    });
    app.get("/team", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await teamCollection.find(query).toArray();
      res.send(result);
    });

    //my Schedule
    app.get("/mySchedule", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const mySchedule = await createSchedule.find(query).toArray();
      res.send(mySchedule);
    });

    // payment
    app.post("/create-payment-intent", async (req, res)=>{
      const price = req.body?.cost;
      const amount = Number(price*100);
      if(amount){
        const paymentIntent = await stripe.paymentIntents.create({
          currency: 'usd',
          amount: amount,
          "payment_method_types": [
            'card'
          ]
        });
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      }
    })
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
