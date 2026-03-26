module.exports = (sequelize, DataTypes) => {
  const Child = sequelize.define('Child', {
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { 
        model: 'Parents', 
        key: 'id' 
      },
      onDelete: 'CASCADE', 
      onUpdate: 'CASCADE'
    },
    childName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    dob: { 
      type: DataTypes.DATEONLY, 
      allowNull: false 
    },
    premature: { 
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'no'
    },
    expectedDeliveryDate: { 
      type: DataTypes.DATEONLY,
      allowNull: true 
    },
    weeksPremature: { 
      type: DataTypes.INTEGER,
      allowNull: true 
    },
    gender: { 
      type: DataTypes.STRING,
      allowNull: true 
    },
    bloodGroup: { 
      type: DataTypes.STRING,
      allowNull: true 
    },
    notes: { 
      type: DataTypes.TEXT,
      allowNull: true 
    },
  }, {
    tableName: 'Children', 
    timestamps: true
  });

  Child.associate = (models) => {
    Child.belongsTo(models.Parent, {
      foreignKey: 'parentId',
      as: 'parent',
      onDelete: 'CASCADE'
    });
  };

  return Child;
};