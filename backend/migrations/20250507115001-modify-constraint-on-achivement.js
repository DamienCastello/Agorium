'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('UserAchievements', 'UserAchievements_ibfk_2');
    await queryInterface.addConstraint('UserAchievements', {
      fields: ['achievementId'],
      type: 'foreign key',
      name: 'UserAchievements_ibfk_2',
      references: {
        table: 'Achievements',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },
};
