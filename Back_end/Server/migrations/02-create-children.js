module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Children', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      parentId: {
        type: Sequelize.INTEGER,
        references: { model: 'Parents', key: 'id' },
        onDelete: 'CASCADE'
      },
      childName: { type: Sequelize.STRING, allowNull: false },
      dob: { type: Sequelize.DATEONLY, allowNull: false },
      premature: { type: Sequelize.STRING },
      expectedDeliveryDate: { type: Sequelize.DATEONLY },
      weeksPremature: { type: Sequelize.INTEGER },
      gender: { type: Sequelize.STRING },
      bloodGroup: { type: Sequelize.STRING },
      notes: { type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('Children'); }
};