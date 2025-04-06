'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Achievement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Achievement.belongsToMany(models.User, {
        through: models.UserAchievement,
        as: 'users',
        foreignKey: 'achievementId',
      });
    }
  }
  Achievement.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isReusable: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    threshold: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iconCategory: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Achievement'
  });
  return Achievement;
};