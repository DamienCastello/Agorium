'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // tagId → Tags
    await queryInterface.removeConstraint('ArticleTags', 'ArticleTags_ibfk_1');
    await queryInterface.addConstraint('ArticleTags', {
      fields: ['tagId'],
      type: 'foreign key',
      name: 'ArticleTags_ibfk_1',
      references: {
        table: 'Tags',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

    // articleId → Articles
    await queryInterface.removeConstraint('ArticleTags', 'ArticleTags_ibfk_2');
    await queryInterface.addConstraint('ArticleTags', {
      fields: ['articleId'],
      type: 'foreign key',
      name: 'ArticleTags_ibfk_2',
      references: {
        table: 'Articles',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('ArticleTags', 'ArticleTags_ibfk_1');
    await queryInterface.addConstraint('ArticleTags', {
      fields: ['tagId'],
      type: 'foreign key',
      name: 'ArticleTags_ibfk_1',
      references: {
        table: 'Tags',
        field: 'id'
      },
      onDelete: 'RESTRICT'
    });

    await queryInterface.removeConstraint('ArticleTags', 'ArticleTags_ibfk_2');
    await queryInterface.addConstraint('ArticleTags', {
      fields: ['articleId'],
      type: 'foreign key',
      name: 'ArticleTags_ibfk_2',
      references: {
        table: 'Articles',
        field: 'id'
      },
      onDelete: 'RESTRICT'
    });
  }
};
