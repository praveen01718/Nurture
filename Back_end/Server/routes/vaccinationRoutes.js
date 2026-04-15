const express = require('express');
const router = express.Router();
const {
  addVaccination,
  getVaccinationsByChild,
  getVaccinationScheduleData
} = require('../controllers/vaccinationController');

router.post('/add', addVaccination);
router.get('/schedule', getVaccinationScheduleData);
router.get('/child/:childId', getVaccinationsByChild);

module.exports = router;
