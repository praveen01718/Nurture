const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MedicalMeasurement = sequelize.define('MedicalMeasurement', {
    weight: {
      type: DataTypes.FLOAT
    },
    length: {
      type: DataTypes.FLOAT
    },
    bmi: {
      type: DataTypes.FLOAT
    },
    head_circumference: {
      type: DataTypes.FLOAT
    },
    measurement_date: {
      type: DataTypes.DATEONLY
    },
    age_type: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'MedicalMeasurements',
    timestamps: true
  });

  MedicalMeasurement.associate = (models) => {
    MedicalMeasurement.belongsTo(models.ChildrenProfile, {
      foreignKey: 'child_id',
      as: 'child'
    });
  };

  return MedicalMeasurement;
};