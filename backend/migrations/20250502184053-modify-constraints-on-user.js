'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Articles
    await queryInterface.removeConstraint('Articles', 'Articles_ibfk_1');
    await queryInterface.addConstraint('Articles', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Articles_ibfk_1',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

    // Comments
    await queryInterface.removeConstraint('Comments', 'Comments_ibfk_1');
    await queryInterface.addConstraint('Comments', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Comments_ibfk_1',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

    // UserAchievements
    await queryInterface.removeConstraint('UserAchievements', 'UserAchievements_ibfk_1');
    await queryInterface.addConstraint('UserAchievements', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'UserAchievements_ibfk_1',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Articles
    await queryInterface.removeConstraint('Articles', 'Articles_ibfk_1');
    await queryInterface.addConstraint('Articles', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Articles_ibfk_1',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'RESTRICT'
    });

    // Comments
    await queryInterface.removeConstraint('Comments', 'Comments_ibfk_1');
    await queryInterface.addConstraint('Comments', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Comments_ibfk_1',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'RESTRICT'
    });

    // UserAchievements
    await queryInterface.removeConstraint('UserAchievements', 'UserAchievements_ibfk_1');
    await queryInterface.addConstraint('UserAchievements', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'UserAchievements_ibfk_1',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'RESTRICT'
    });
  }
};
