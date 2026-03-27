const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const parentController = require('../controllers/parentController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', parentController.getParents);

router.get('/:id', parentController.getParentById);

router.post('/upload-temp', upload.single('profileImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.status(200).json({ filePath: req.file.path });
});

router.post('/add', parentController.addParentWithChildren);

router.put('/:id', parentController.updateParent);

router.delete('/:id', parentController.deleteParent);

module.exports = router;