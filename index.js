const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
dotenv.config();

const URL = process.env.DB;
const SECRET_KEY =
  "CKSNBMSLZFHGXdgwufgvbhawmaeo4378rtgxyuhjzbdxfxckquebivjqexiv";

// Midleware
app.use(
  cors({
    origin: "https://steady-syrniki-a3bad6.netlify.app",
    // origin: "http://localhost:5173",
  })
);
app.use(express.json());

let users = [];

let authenticate = (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(401).json({ message: "Unauthorized" });
  } else {
    jwt.verify(req.headers.authorization, SECRET_KEY, (error, data) => {
      if (error) {
        res.status(401).json({ message: "Unauthorized" });
      }
      req.userId = data.id
      next();
    });
  }
};

app.get("/users", authenticate, async (req, res) => {
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

app.post("/user",authenticate, async (req, res) => {
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
app.get("/user/:id",authenticate, async (req, res) => {
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
app.put("/user/:id",authenticate, async (req, res) => {
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

app.delete("/user/:id",authenticate, async (req, res) => {
  // 1.Connect to Database Server
  const connection = await MongoClient.connect(URL);

  // 2.Select the database
  const db = connection.db("b61wdtamil");

  // 3.Select the collection
  const collection = db.collection("students");

  // 4.Delete the User
  await collection.findOneAndDelete({ _id: new ObjectId(req.params.id) });

  await connection.close();

  res.json({ message: "Deleted Successfully" });
});

app.post("/register", async (req, res) => {
  try {
    // 1.Connect to Database Server
    const connection = await MongoClient.connect(URL);

    // 2.Select the database
    const db = connection.db("b61wdtamil");

    // 3.Select the collection
    const collection = db.collection("teachers");

    // Hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);

    req.body.pass = req.body.password;
    req.body.password = hash;

    // 4.Delete the User
    await collection.insertOne(req.body);

    await connection.close();

    res.json({ message: "Teacher Registered Successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    // 1.Connect to Database Server
    const connection = await MongoClient.connect(URL);

    // 2.Select the database
    const db = connection.db("b61wdtamil");

    // 3.Select the collection
    const collection = db.collection("teachers");

    /**
     * Find the User by Email id
     * If user not found throw error
     *
     * If user found?
     * check the attemt. If the attempt is less than 3 then proceed
     * hash the given password
     * compare the given hash with db hash
     * If hash is not same
     * increment the attempt and
     * throw error
     *
     * If hash is same?
     * Generate token
     */

    const user = await collection.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "Incorrect Username/Password",
      });
    }

    if (user.attempt && user.attempt == 3) {
      return res.status(401).json({
        message: "attempt execedded",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!passwordCorrect) {
      await collection.findOneAndUpdate(
        { email: req.body.email },
        {
          $inc: {
            attempt: 1,
          },
        }
      );
      return res.status(401).json({
        message: "Incorrect Username/Password",
      });
    }
    await connection.close();
    // Generate Token
    const token = jwt.sign({ id: user._id }, SECRET_KEY);

    return res.json({ message: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.listen(3000, () => {
  console.log("Webserver is running in port 3000");
});

// abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*(){}_+~,./\`=-
