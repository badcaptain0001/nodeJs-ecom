const express = require('express');
const app = express();
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var cors = require('cors');
const User = require('./model/user');
const bodyParser = require('body-parser');
const upload = require("./routes/upload");
require('dotenv').config();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ennable cors
const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(cors(corsOpts));
// this is home page
app.get('/', (req, res) => {
  res.send('Helo this is backend for practice only');
});
// let gfs;
// connect to the database
mongoose.connect(process.env.DB_CONNECTION_STRING,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (req, res) => {
    console.log('connected to the database');
    // print collection 
  }
)
const conn = mongoose.connection;
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
// file upload in node js using multer
app.use("/file", upload);
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log("hekk", gfs.files.find().toArray());
}
);
// this is to get all the files
app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }
    return res.json(files);
  });
});
// this is to get a single file
app.get('/files/:filename', (req, res) => {
  // display image
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  }
  );
});
app.listen(process.env.PORT, () => {
  console.log('Server started on port' + process.env.PORT);
}
);
