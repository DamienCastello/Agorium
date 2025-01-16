'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Associer User ↔ Like ↔ Article
      Like.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'user' });
      Like.belongsTo(models.Article, { foreignKey: 'articleId', onDelete: 'CASCADE', allowNull: true });
      Like.belongsTo(models.Comment, { foreignKey: 'commentId', onDelete: 'CASCADE', allowNull: true });
    }
  }
  Like.init({
    userId: DataTypes.INTEGER,
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Like',
  });
  return Like;
};