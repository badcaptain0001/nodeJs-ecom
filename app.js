const express = require('express');
const app = express();
const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
const User = require('./model/user');
const bodyParser = require('body-parser');
require('dotenv').config();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// this is home page
app.get('/', (req, res) => {
  res.send('Helo this is backend for practice only');
});
// connect to the database
mongoose.connect(process.env.DB_CONNECTION_STRING,
  (req, res) => {
    console.log('connected to the database');
  }
)
// this is to get all the users
app.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.send(err);
    } else {
      res.json(users);
    }
  })
}
);
// this is post request to create a new user
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      res.status(400).send('username already exists please try another one');
    } 
    else {
      const user = new User({
        username: req.body.username,
        password: hashedPassword
      });
      await user.save();
      res.status(201)
      res.send('user created successfully');
    }
  }
  catch (err) {
    res.status(500).send("Error while creating user");
  }
});
// create a login api
app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username
    });
    if (!user) {
      res.status(404).send('User not found');
    }
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      res.status(401).send('Invalid Password');
    }
    res.status(200)
    res.send("Login Successful");
  }
  catch (err) {
    res.status(500).send("Error while creating user");
  }
});
app.listen(process.env.PORT, () => {
  console.log('Server started on port' + process.env.PORT);
}
);