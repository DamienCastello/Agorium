'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comment.hasMany(models.Like, {
        foreignKey: 'commentId',
        as: 'likes',
        allowNull: true
      });

      Comment.belongsTo(models.Article, { foreignKey: 'articleId' });
      Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Comment.hasMany(models.Report, {
        foreignKey: 'commentId', onDelete: 'CASCADE', as: 'reports',
        allowNull: true
      });
    }
  }
  Comment.init({
    content: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    articleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};