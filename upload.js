const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
require('dotenv').config();
const storage = new GridFsStorage({
  url: process.env.DB_CONNECTION_STRING,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if(match.indexOf(file.mimetype)=== -1){
      const filename = `${Date.now()}_${file.originalname}`;
      return filename;
    }
    return {
      bucketName: 'uploads',
      filename: `${Date.now()}_${file.originalname}`,
    };
  },
});
module.exports = multer({ storage });