const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ChildrenProfile, MedicalMeasurement } = require('../models');
const { getChildById } = require('../controllers/childController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/add', upload.single('profileImage'), async (req, res) => {
    try {
        const payload = {
            ...req.body,
            profileImage: req.file ? req.file.filename : null
        };

        const fieldsToNull = [
            'expectedDate', 'weeksPremature', 'childrenCount', 
            'address1', 'address2', 'city', 'state', 'zip', 'note'
        ];

        fieldsToNull.forEach(field => {
            if (payload[field] === '') payload[field] = null;
        });

        if (payload.weeksPremature !== null) {
            payload.weeksPremature = parseInt(payload.weeksPremature, 10);
        }

        const newChild = await ChildrenProfile.create(payload);
        res.status(201).json(newChild);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/list', async (req, res) => {
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', getChildById);

router.post('/measurements/add', async (req, res) => {
    try {
        const { 
            child_id, weight, length, head_circumference, 
            bmi, measurement_date, age_type 
        } = req.body;

        const newEntry = await MedicalMeasurement.create({
            child_id,
            weight: parseFloat(weight),
            length: parseFloat(length),
            head_circumference: parseFloat(head_circumference) || 0,
            bmi: parseFloat(bmi),
            measurement_date,
            age_type
        });

        res.status(201).json(newEntry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
