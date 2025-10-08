'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Articles', 'hlsPlaylist', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Articles', 'hlsDir', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Articles', 'hlsPlaylist');
    await queryInterface.removeColumn('Articles', 'hlsDir');
  },
};
