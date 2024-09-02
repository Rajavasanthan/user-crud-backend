const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const dotenv = require("dotenv")
dotenv.config()


const URL = process.env.DB;

// Midleware
app.use(
  cors({
    origin: "https://steady-syrniki-a3bad6.netlify.app",
  })
);
app.use(express.json());

let users = [];

app.get("/users", async (req, res) => {
  try {
    // 1. Connect the Database Server
    const connection = await MongoClient.connect(URL);

    // 2. Select the Database
    const db = connection.db("b61wdtamil");

    // 3. Select the collection
    const collection = db.collection("students");

    const students = await collection.find({}).toArray();

    // 5. Close the connection
    await connection.close();

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.post("/user", async (req, res) => {
  /**
   * 1. Connect the Database Server
   * 2. Select the Database
   * 3. Select the collection
   * 4. Do the Operation (Insert, Read, Update, Delete)
   * 5. Close the connection
   */
  try {
    // 1. Connect the Database Server
    const connection = await MongoClient.connect(URL);

    // 2. Select the Database
    const db = connection.db("b61wdtamil");

    // 3. Select the collection
    const collection = db.collection("students");

    if (!req.body.name) {
      res.status(400).json({
        message: "Please provide student name",
      });
    } else {
      // 4. Do the Operation (Insert, Read, Update, Delete)
      await collection.insertOne(req.body);

      // 5. Close the connection
      await connection.close();

      res.json({
        message: "Student Created Sucessfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// /user/3
app.get("/user/:id", async (req, res) => {
  // 1.Connect to Database Server
  const connection = await MongoClient.connect(URL);

  // 2.Select the database
  const db = connection.db("b61wdtamil");

  // 3.Select the collection
  const collection = db.collection("students");

  // '1' == 1 -> True
  // '1' === 1 -> False
  // '1' === ObjectId(1) -> False
  // ObjectId(1) === ObjectId(1) -> True

  // 4.Do the operation
  const student = await collection.findOne({
    _id: new ObjectId(req.params.id),
  });

  // 5.Close the connection
  await connection.close();

  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// ID, Data
app.put("/user/:id", async (req, res) => {
  try {
    // 1.Connect to Database Server
    const connection = await MongoClient.connect(URL);

    // 2.Select the database
    const db = connection.db("b61wdtamil");

    // 3.Select the collection
    const collection = db.collection("students");

    // let omitId = Object.keys(req.body);
    // let filter = {};

    // omitId.forEach((obj) => {
    //   if (obj !== "_id") {
    //     filter[obj] = req.body[obj];
    //   }
    // });

    // console.log(filter);

    delete req.body._id;
    // 4. Do the Operation
    const student = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      {
        $set: req.body,
      }
    );

    // 5.Close the connection
    await connection.close();

    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Somrhting went worng",
    });
  }
});

app.delete("/user/:id", async (req, res) => {
  // 1.Connect to Database Server
  const connection = await MongoClient.connect(URL);

  // 2.Select the database
  const db = connection.db("b61wdtamil");

  // 3.Select the collection
  const collection = db.collection("students");

  // 4.Delete the User
  await collection.findOneAndDelete({ _id: new ObjectId(req.params.id) });

  await connection.close();

  res.json({message : "Deleted Successfully"})
});

app.listen(3000, () => {
  console.log("Webserver is running in port 3000");
});
