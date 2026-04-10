const { ChildrenProfile, MedicalMeasurement } = require('../models');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('profileImage');

exports.addChild = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ message: "File upload failed" });

    try {
      const data = { ...req.body };
      if (req.file) {
        data.profileImage = req.file.filename;
      }
      const newChild = await ChildrenProfile.create(data);
      res.status(201).json(newChild);
    } catch (error) {
      res.status(500).json({ message: "Error saving to database", error: error.message });
    }
  });
};

exports.getChildrenList = async (req, res) => {
  try {
    const children = await ChildrenProfile.findAll({
      include: [{
        model: MedicalMeasurement,
        as: 'measurements',
        attributes: ['weight', 'length', 'head_circumference', 'bmi', 'measurement_date'],
        separate: true,
        limit: 1,
        order: [
          ['measurement_date', 'DESC'],
          ['createdAt', 'DESC']
        ]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(children);
  } catch (error) {
    res.status(500).json({ message: "Error fetching children list", error: error.message });
  }
};

exports.getChildById = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await ChildrenProfile.findByPk(id, {
      include: [{
        model: MedicalMeasurement,
        as: 'measurements',
        attributes: ['weight', 'length', 'head_circumference', 'bmi', 'measurement_date'],
        separate: true,
        limit: 1,
        order: [
          ['measurement_date', 'DESC'],
          ['createdAt', 'DESC']
        ]
      }]
    });

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    const latestMeasurement = child.measurements?.[0] || {};
    const responseData = {
      ...child.toJSON(),
      weight: latestMeasurement.weight || null,
      length: latestMeasurement.length || null,
      head_circumference: latestMeasurement.head_circumference || null
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching child details", error: error.message });
  }
};
