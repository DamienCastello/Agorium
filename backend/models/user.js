'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Article, {
        foreignKey: 'userId'
      });
      User.belongsToMany(models.Article, { through: 'Like', foreignKey: 'userId' });
      User.belongsToMany(models.Achievement, { 
        through: models.UserAchievement, 
        as: 'achievements',
        foreignKey: 'userId' 
      });
      User.hasMany(models.Comment, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'comments' });
    }
  }
  User.init({
    pseudo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },    
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    avatar: DataTypes.STRING,
    points: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};