'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Articles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [3, 50]
        }
      },
      description: {
        type: Sequelize.TEXT('medium'),
        allowNull: false
      },
      preview: {
        type: Sequelize.STRING,
        allowNull: true
      },
      urlYoutube: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          foreignKey: 'id'
        }
      },
      refusalReasons: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      overallReasonForRefusal: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isValid: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      validatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Articles');
  }
};