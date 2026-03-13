const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");
 
const app = express();
 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static("public"));
 
app.get("/", (req, res) => {
    res.render("login", { error: null, success: null });
});
 
app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});
 
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password
  };

  try {
    const existingUser = await collection.findOne({ name: data.name });
    if (existingUser) {
      return res.render("signup", { error: "User already exists. Please choose a different username." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword;

    await collection.insertMany(data);

    res.render("login", { error: null, success: "Account created successfully! Please log in." });

  } catch (err) {
    console.error(err);
    res.render("signup", { error: "Something went wrong. Please try again."});
  }
});
 
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      return res.render("login", { error: "Username not found.", success: null });
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if (!isPasswordMatch) {
      return res.render("login", { error: "Wrong password. Please try again.", success: null });
    }

    res.render("home", { username: req.body.username });

  } catch (err) {
    console.error(err);
    res.render("login", { error: "Something went wrong. Please try again.", success: null });
}
});
 
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});