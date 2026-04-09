const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChildrenProfile = sequelize.define('ChildrenProfile', {
    childName: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY, allowNull: false },
    gender: { type: DataTypes.STRING, allowNull: false },
    bloodGroup: { type: DataTypes.STRING, allowNull: false },
    isPremature: { type: DataTypes.STRING, defaultValue: 'no' },
    expectedDate: { type: DataTypes.DATEONLY },
    weeksPremature: { type: DataTypes.INTEGER },
    profileImage: { type: DataTypes.STRING, allowNull: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    childrenCount: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    relation: { type: DataTypes.STRING, allowNull: false },
    address1: { type: DataTypes.STRING },
    address2: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    zip: { type: DataTypes.STRING },
    note: { type: DataTypes.TEXT }
  }, {
    tableName: 'ChildrenProfiles',
    timestamps: true
  });

  ChildrenProfile.associate = (models) => {
    ChildrenProfile.hasMany(models.MedicalMeasurement, {
      foreignKey: 'child_id',
      as: 'measurements'
    });

    ChildrenProfile.hasMany(models.Vaccination, {
      foreignKey: 'child_id',
      as: 'vaccinations'
    });
  };

  return ChildrenProfile;
};
