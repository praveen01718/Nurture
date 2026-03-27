module.exports = (sequelize, DataTypes) => {
  const Parent = sequelize.define('Parent', {
    firstName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    lastName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    profileImage: { 
      type: DataTypes.STRING,
      allowNull: true 
    },
    childrenCount: { 
      type: DataTypes.STRING,
      allowNull: true 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    phoneNumber: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    relation: { 
      type: DataTypes.STRING,
      allowNull: true
    },
    address1: { type: DataTypes.STRING },
    address2: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    zipCode: { type: DataTypes.STRING },
  }, {
    tableName: 'Parents',
    timestamps: true
  });

  Parent.associate = (models) => {
    Parent.hasMany(models.Child, {
      foreignKey: 'parentId',
      as: 'children',
      onDelete: 'CASCADE', 
      hooks: true
    });
  };

  return Parent;
};