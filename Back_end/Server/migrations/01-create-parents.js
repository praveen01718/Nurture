module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Parents', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      firstName: { type: Sequelize.STRING, allowNull: false },
      lastName: { type: Sequelize.STRING, allowNull: false },
      childrenCount: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      phoneNumber: { type: Sequelize.STRING, allowNull: false },
      relation: { type: Sequelize.STRING },
      address1: { type: Sequelize.STRING },
      address2: { type: Sequelize.STRING },
      city: { type: Sequelize.STRING },
      state: { type: Sequelize.STRING },
      zipCode: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('Parents'); }
};