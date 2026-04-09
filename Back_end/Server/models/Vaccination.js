const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vaccination = sequelize.define('Vaccination', {
    child_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    vaccination_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age_label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dose_label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vaccination_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    tableName: 'Vaccinations',
    timestamps: true
  });

  Vaccination.associate = (models) => {
    Vaccination.belongsTo(models.ChildrenProfile, {
      foreignKey: 'child_id',
      as: 'child'
    });
  };

  return Vaccination;
};
