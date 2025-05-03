'use strict';
const {
  Model
} = require('sequelize');

const path = require('path');
const fs = require('fs');

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
        onDelete: 'CASCADE',
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

  User.addHook('beforeDestroy', async (user, options) => {
    try {
      const { Article } = sequelize.models;
      const articles = await Article.findAll({ where: { userId: user.id } });
  
      for (const article of articles) {
        const { preview, video, thumbnail } = article;
        const filesToDelete = [preview, video, thumbnail].filter(Boolean);
  
        for (const file of filesToDelete) {
  
          // Construit le chemin absolu correct
          const oldFullAvatarPath = process.env.NODE_ENV === 'development'
              ? path.resolve(file)
              : path.join('/app/public', file);
  
          if (fs.existsSync(oldFullAvatarPath)) {
            fs.unlinkSync(oldFullAvatarPath);
            console.log(`✅ Fichier supprimé : ${oldFullAvatarPath}`);
          } else {
            console.warn(`⚠️ Fichier introuvable (non supprimé) : ${oldFullAvatarPath}`);
          }
        }
      }
  
      console.log('🧹 Tous les fichiers des articles ont été nettoyés avant suppression de l’utilisateur.');
    } catch (err) {
      console.error('❌ Erreur lors de la suppression des fichiers de l’utilisateur :', err);
      throw err;
    }
  });

  return User;
};
