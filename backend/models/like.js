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
      Like.belongsTo(models.Article, { foreignKey: 'articleId', onDelete: 'CASCADE' });
    }
  }
  Like.init({
    userId: DataTypes.INTEGER,
    articleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Like',
  });
  return Like;
};