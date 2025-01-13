'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserAchievement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserAchievement.init({
    userId: DataTypes.INTEGER,
    achievementId: DataTypes.INTEGER,
    dateEarned: DataTypes.DATE,
    progress: DataTypes.DECIMAL
  }, {
    sequelize,
    timestamps: true,
    modelName: 'UserAchievement',
  });
  return UserAchievement;
};