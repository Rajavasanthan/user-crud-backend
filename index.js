const express = require("express");
const cors = require("cors");
const app = express();

// Midleware
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

let users = [];

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/user", (req, res) => {
  id = users.length + 1;
  users.push({ ...req.body, id });

  res.json({ message: "User created successfully" });
});

// /user/3
app.get("/user/:id", (req, res) => {
  let user = users.find((obj) => obj.id == req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.json({ message: "User Not Found" });
  }
});

// ID, Data
app.put("/user/:id", (req, res) => {
  // Find the user by ID
  let index = users.findIndex((obj) => obj.id == req.params.id);

  if (!users[index]) {
    res.json({ message: "User not found" });
  } else {
    // Change the data
    users[index] = { ...req.body, id: parseInt(req.params.id) };

    // Return
    res.json({ message: "User Updated Succesfully" });
  }
});

app.delete("/user/:id", (req, res) => {
  // Find the index
  let index = users.findIndex((obj) => obj.id == req.params.id);
  // Delete the index
  users.splice(index, 1);

  res.json({ message: "User Deleted" });
});

app.listen(3000, () => {
  console.log("Webserver is running in port 3000");
});
