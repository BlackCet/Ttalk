
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|mp4|mov|avi/;
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.test(ext));
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
