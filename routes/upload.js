const upload = require("../upload");
const express = require("express");
const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
    if (req.file === undefined) return res.send("you must select a file.");
    const imgUrl = 'file uploaded successfully in db';
    return res.send(imgUrl);
});

module.exports = router;