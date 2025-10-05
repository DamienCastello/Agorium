'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Articles', 'processingStatus', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'queued',
    });

    await queryInterface.addColumn('Articles', 'processingProgress', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Articles', 'originalVideo', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Articles', 'originalVideo');
    await queryInterface.removeColumn('Articles', 'processingProgress');
    await queryInterface.removeColumn('Articles', 'processingStatus');
  }
};