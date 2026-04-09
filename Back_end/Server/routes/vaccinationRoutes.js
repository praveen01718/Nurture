const express = require('express');
const router = express.Router();
const {
  addVaccination,
  getVaccinationsByChild
} = require('../controllers/vaccinationController');

router.post('/add', addVaccination);
router.get('/child/:childId', getVaccinationsByChild);

module.exports = router;
