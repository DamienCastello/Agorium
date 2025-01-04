'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tag.belongsToMany(models.Article, {
        through: models.ArticleTag,
        as: 'articles',
        foreignKey: 'tagId',
    });
    }
  }
  Tag.init({
    name: {
      type: DataTypes.STRING,
      unique: true
    },
    isValid: {
      type: DataTypes.BOOLEAN,
    },
    refusalReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    validatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Tag',
  });
  return Tag;
};