const { MedicalMeasurement, ChildrenProfile } = require('../models');

exports.addMeasurement = async (req, res) => {
  try {
    const {
      child_id,
      weight,
      length,
      head_circumference,
      bmi,
      measurement_date,
      age_type
    } = req.body;

    if (!child_id || !weight || !length || !measurement_date) {
      return res.status(400).json({ 
        message: "Missing required fields: child_id, weight, length, and date are mandatory." 
      });
    }

    const child = await ChildrenProfile.findByPk(child_id);
    if (!child) {
      return res.status(404).json({ message: "Child record not found." });
    }

    // Find the latest measurement for this child
    const latestMeasurement = await MedicalMeasurement.findOne({
      where: { child_id },
      order: [['measurement_date', 'DESC']]
    });

    let measurement;
    if (latestMeasurement) {
      // Update the existing latest measurement
      measurement = await latestMeasurement.update({
        weight: parseFloat(weight),
        length: parseFloat(length),
        head_circumference: parseFloat(head_circumference) || 0,
        bmi: parseFloat(bmi),
        measurement_date,
        age_type
      });
    } else {
      measurement = await MedicalMeasurement.create({
        child_id,
        weight: parseFloat(weight),
        length: parseFloat(length),
        head_circumference: parseFloat(head_circumference) || 0,
        bmi: parseFloat(bmi),
        measurement_date,
        age_type
      });
    }

    res.status(201).json({
      message: "Measurement recorded successfully",
      data: measurement
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error saving measurement", 
      error: error.message 
    });
  }
};

exports.getMeasurementsByChild = async (req, res) => {
  try {
    const { childId } = req.params;

    const measurements = await MedicalMeasurement.findAll({
      where: { child_id: childId },
      order: [['measurement_date', 'DESC']]
    });

    res.status(200).json(measurements);
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving measurements", 
      error: error.message 
    });
  }
};