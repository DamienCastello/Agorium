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
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    privateLink: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    processingStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'queued',
      validate: {
        isIn: [['queued', 'processing', 'ready', 'failed']],
      },
    },
    processingProgress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    originalVideo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    processingError: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processingRetries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Article',
    timestamps: true
  });

  return Article;
};
