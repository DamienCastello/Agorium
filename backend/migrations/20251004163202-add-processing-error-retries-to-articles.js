'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Articles', 'processingError', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'processingProgress',
    });

    await queryInterface.addColumn('Articles', 'processingRetries', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'processingError',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Articles', 'processingError');
    await queryInterface.removeColumn('Articles', 'processingRetries');
  }
};
