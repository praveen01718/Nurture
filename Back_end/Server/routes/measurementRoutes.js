const express = require('express');
const router = express.Router();
const { addMeasurement, getMeasurementsByChild } = require('../controllers/measurementController');

router.post('/add', addMeasurement);
router.get('/:childId', getMeasurementsByChild);

module.exports = router;