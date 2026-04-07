module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MedicalMeasurements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      child_profile_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ChildrenProfiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      weight: {
        type: Sequelize.FLOAT
      },
      length: {
        type: Sequelize.FLOAT
      },
      bmi: {
        type: Sequelize.FLOAT
      },
      headCircumference: {
        type: Sequelize.FLOAT
      },
      measurementDate: {
        type: Sequelize.DATEONLY
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('MedicalMeasurements');
  }
};