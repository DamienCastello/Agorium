'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Article.belongsTo(models.User, {
        foreignKey: 'userId'
      });
      Article.belongsToMany(models.User, { through: 'Like', foreignKey: 'articleId' });
      Article.belongsToMany(models.Tag, {
        through: models.ArticleTag,
        as: 'tags',
        foreignKey: 'articleId',
    });
      Article.hasMany(models.Comment, { foreignKey: 'articleId', onDelete: 'CASCADE' });
    }
  }
  Article.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    preview: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    urlYoutube: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    valid: {
      type: DataTypes.BOOLEAN,
    },
    validatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Article',
  });
  return Article;
};