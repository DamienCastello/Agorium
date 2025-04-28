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
      Article.belongsTo(models.User, {
        foreignKey: 'userId'
      });

      Article.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: 'articleId',
        otherKey: 'userId',
        as: 'user',
      });

      Article.hasMany(models.Like, {
        foreignKey: 'articleId',
        as: 'likes',
        allowNull: true
      });

      Article.belongsToMany(models.Tag, {
        through: models.ArticleTag,
        as: 'tags',
        foreignKey: 'articleId',
      });

      Article.hasMany(models.Comment, { foreignKey: 'articleId', onDelete: 'CASCADE', as: 'comments' });
      Article.hasMany(models.Report, {
        foreignKey: 'articleId', onDelete: 'CASCADE', as: 'reports',
        allowNull: true
      });
    }
  }

  Article.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    preview: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    video: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    urlYoutube: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refusalReasons: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    overallReasonForRefusal: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isValid: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    validatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Article',
    timestamps: true
  });

  return Article;
};
