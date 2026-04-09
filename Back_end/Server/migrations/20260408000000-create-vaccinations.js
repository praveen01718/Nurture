'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vaccinations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      child_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ChildrenProfiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vaccination_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      vaccination_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      age_label: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dose_label: {
        type: Sequelize.STRING,
        allowNull: false
      },
      vaccination_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('Vaccinations', {
      fields: ['child_id', 'vaccination_name', 'vaccination_type', 'age_label', 'dose_label'],
      type: 'unique',
      name: 'vaccinations_child_schedule_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Vaccinations', 'vaccinations_child_schedule_unique');
    await queryInterface.dropTable('Vaccinations');
  }
};
