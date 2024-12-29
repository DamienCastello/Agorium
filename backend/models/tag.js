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
    name: DataTypes.STRING,
    isValid: {
      type: DataTypes.BOOLEAN,
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