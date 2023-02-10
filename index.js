const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const io = new Server({
  cors: true,
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;
const portIo = process.env.PORT || 5001;
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

// JWT Token
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (er, decoded) {
    if (er) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    // membership collection
    const membershipCollection = client
      .db("ScheduPlannr")
      .collection("membership");
    const notesCollection = client.db("ScheduPlannr").collection("notes");

    const blogsCollection = client.db("ScheduPlannr").collection("blogs");

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

    // JWT Token
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      console.log("user", user);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1d",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
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
    app.get("/user/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });
    app.patch("/user/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const filter = {email: email };
      const user = req.body;
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          // name: user.displayName,
          name: user.name,
          lastName: user.lastName,
          // email: user.email,
          image: user.image,
          birthDate: user.birthDate,
          contactNumber: user.contactNumber,
          currentAddress: user.currentAddress,
          permanentAddress: user.permanentAddress,
          gender: user.gender,
          profession: user.profession,
          about: user.about,
          role: "",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });
    app.put("/user/admin/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    
    app.get("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // admin
    app.get("/user/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
    // Delete users
    app.delete("/user/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // Membership
    app.get("/membership", verifyJWT, async (req, res) => {
      const query = {};
      const result = await membershipCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/membership/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      console.log(query);
      const membership = await membershipCollection.findOne(query);
      console.log(membership);
      res.send(membership);
    });

    // Add notes
    app.post("/notes", verifyJWT, async (req, res) => {
      const query = req.body;
      const result = await notesCollection.insertOne(query);
      res.send(result);
    });

    // get notes
    app.get("/notes", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = await notesCollection
        .find(query)
        .sort({ $natural: -1 })
        .toArray();
      res.send(cursor);
    });

    app.get("/notes/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await notesCollection.findOne(query);
      res.send(cursor);
    });

    // delete note
    app.delete("/notes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await notesCollection.deleteOne(query);
      res.send(result);
    });

    // get 15mins time slots AM
    app.get("/fifteenMinsAM", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = await fifteenMinsAmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 15mins time slots PM
    app.get("/fifteenMinsPM", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = await fifteenMinsPmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 30mins time slots AM
    app.get("/thirtyMinsAM", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = await thirtyMinsAmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 30mins time slots PM
    app.get("/thirtyMinsPM", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = await thirtyMinsPmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 60mins time slots AM
    app.get("/sixtyMinsAM", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = await sixtyMinsAMCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 60mins time slots PM
    app.get("/sixtyMinsPM", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = await sixtyMinsPmCollection.find(query).toArray();
      res.send(cursor);
    });

    //create schedule
    app.post("/createSchedule", verifyJWT, async (req, res) => {
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

    // update schedule
    app.put("/createSchedule/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
      };
      const schedule = req.body;
      const option = { upsert: true };
      const updateSchedule = {
        $set: {
          name: schedule.name,
          email: schedule.email,
          description: schedule.description,
          link: schedule.link,
          location: schedule.location,
          title: schedule.title,
          organization: schedule.organization,
          phone: schedule.phone,
        },
      };
      const result = await createSchedule.updateOne(
        filter,
        updateSchedule,
        option
      );
      res.send(result);
    });

    // delete schedule
    app.delete("/createSchedule/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await createSchedule.deleteOne(query);
      res.send(result);
    });

    // yeasin arafat
    app.post("/team", verifyJWT, async (req, res) => {
      const user = req.body;
      const result = await teamCollection.insertOne(user);
      res.send(result);
    });

    app.get("/team", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await teamCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/team/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await teamCollection.deleteOne(query);
      res.send(result);
    });

    //my Schedule
    app.get("/mySchedule", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const mySchedule = await createSchedule.find(query).toArray();
      res.send(mySchedule);
    });

    // get Schedule
    app.get("/createSchedule/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: ObjectId(id),
      };
      const mySchedule = await createSchedule.findOne(query);
      res.send(mySchedule);
    });

    // payment
    app.post("/create-payment-intent", verifyJWT, async (req, res) => {
      const price = req.body?.cost;
      const amount = Number(price * 100);
      if (amount) {
        const paymentIntent = await stripe.paymentIntents.create({
          currency: "usd",
          amount: amount,
          payment_method_types: ["card"],
        });
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      }
    });
    // add blog
    app.post("/blogs", async (req, res) => {
      const query = req.body;
      const result = await blogsCollection.insertOne(query);
      res.send(result);
    });
    app.get("/blogs", async (req, res) => {
      const query = {};
      const result = await blogsCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await blogsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/blogPost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await blogsCollection.findOne(query);
      res.send(cursor);
    });
    //socket
    const emailToSocketMapping = new Map();
    const socketToEmailMapping = new Map();

    io.on("connection", (socket) => {
      // console.log('new connection')
      socket.on("join-room", (data) => {
        const { roomId, emailId } = data;
        console.log("user", emailId, "Joined room with", roomId);
        emailToSocketMapping.set(emailId, socket.id);
        socketToEmailMapping.set(socket.id, emailId);
        socket.join(roomId);
        socket.emit("joined-room", { roomId });
        socket.broadcast.to(roomId).emit("user-joined", { emailId });
      });
      socket.on("call-user", (data) => {
        const { emailId, offer } = data;
        const fromEmail = socketToEmailMapping.get(socket.id);
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId)?.emit("incoming-call", { from: fromEmail, offer });
      });
      socket.on("call-accepted", (data) => {
        const { emailId, ans } = data;
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit("call-accepted", { ans });
      });
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
io.listen(portIo, ()=> {})