const { Vaccination, ChildrenProfile } = require('../models');

exports.addVaccination = async (req, res) => {
  try {
    const childId = Number(req.body.child_id);
    const vaccinationName = req.body.vaccination_name?.trim();
    const vaccinationType = req.body.vaccination_type?.trim() || '';
    const ageLabel = req.body.age_label?.trim();
    const doseLabel = req.body.dose_label?.trim();
    const vaccinationDate = req.body.vaccination_date;

    if (!Number.isInteger(childId) || childId <= 0 || !vaccinationName || !ageLabel || !doseLabel || !vaccinationDate) {
      return res.status(400).json({
        message: 'Missing required fields: child_id, vaccination_name, age_label, dose_label, and vaccination_date are mandatory.'
      });
    }

    const parsedVaccinationDate = new Date(vaccinationDate);
    if (Number.isNaN(parsedVaccinationDate.getTime())) {
      return res.status(400).json({ message: 'Vaccination date must be a valid date.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsedVaccinationDate.setHours(0, 0, 0, 0);

    if (parsedVaccinationDate > today) {
      return res.status(400).json({ message: 'Vaccination date cannot be in the future.' });
    }

    const child = await ChildrenProfile.findByPk(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child record not found.' });
    }

    const existingVaccination = await Vaccination.findOne({
      where: {
        child_id: childId,
        vaccination_name: vaccinationName,
        vaccination_type: vaccinationType,
        dose_label: doseLabel
      }
    });

    const legacyVaccination = existingVaccination
      ? null
      : await Vaccination.findOne({
          where: {
            child_id: childId,
            vaccination_name: vaccinationName,
            dose_label: doseLabel
          }
        });

    if (existingVaccination || legacyVaccination) {
      return res.status(409).json({
        message: 'Vaccine already injected'
      });
    }

    const vaccination = await Vaccination.create({
      child_id: childId,
      vaccination_name: vaccinationName,
      vaccination_type: vaccinationType,
      age_label: ageLabel,
      dose_label: doseLabel,
      vaccination_date: vaccinationDate
    });

    res.status(201).json({
      message: 'Vaccination added successfully',
      data: vaccination
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error saving vaccination',
      error: error.message
    });
  }
};

exports.getVaccinationsByChild = async (req, res) => {
  try {
    const childId = Number(req.params.childId);

    if (!Number.isInteger(childId) || childId <= 0) {
      return res.status(400).json({ message: 'Child id must be a valid number.' });
    }

    const child = await ChildrenProfile.findByPk(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child record not found.' });
    }

    const vaccinations = await Vaccination.findAll({
      where: { child_id: childId },
      order: [
        ['vaccination_date', 'DESC'],
        ['vaccination_name', 'ASC'],
        ['createdAt', 'DESC']
      ]
    });

    res.status(200).json(vaccinations);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving vaccinations',
      error: error.message
    });
  }
};
