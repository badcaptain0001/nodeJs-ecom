const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./model/user');
require('dotenv').config();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Helo this is backend for practice only');
});
app.get('/users', (req, res) => {
  res.send([{
    name: 'John',
    age: 30
  }, {
    name: 'Mike',
    age: 23
  }, {
    name: 'Mary',
    age: 25
  }]);
});
// connect to the database
mongoose.connect(process.env.DB_CONNECTION_STRING,
  (req, res) => {
    console.log('connected to the database');
  }
)
app.post('/contact', async (req, res) => {
  try {
    const myUser = new User(req.body);
    await myUser.save();
    res.send("request is processed");
  }
  catch (err) {
    res.send(err);
  }
});

app.listen(process.env.PORT, () => {
  console.log('Server started on port' + process.env.PORT);
}
);