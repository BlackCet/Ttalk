const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Message = require('../models/Message');
const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { senderId, receiverId, type } = req.body;

    if (!senderId || !receiverId || !type || !req.file) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newMessage = new Message({
      senderId,
      receiverId,
      type,
      message: fileUrl,
      fileUrl,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
