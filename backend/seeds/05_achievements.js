const models = require('../models');
const { Achievement, User } = models;

(async () => {
  try {
    const achievement1 = await Achievement.create({
      id: 1,
      name: 'first comment',
      description: 'You have written your first comment !',
      points: 10,
      isReusable: false,
      threshold: 1.00,
      isEventBased: false,
      iconCategory: 'comment'
    });

    const achievementForUser1 = await User.findAll({ where: { id: [1, 2] } });
    await achievement1.addUsers(achievementForUser1);


    // Example of add achievements to user(s) with progress value
    // for (const user of achievementForUser) {
    //     await UserAchievement.create({
    //       userId: user.id,
    //       achievementId: achievement.id,
    //       progress: 0.5,
    //       dateEarned: new Date()
    //     });
    //   }

    const achievement2 = await Achievement.create({
      id: 2,
      name: 'Active commentator',
      description: 'You have written 10 more comments !',
      points: 15,
      isReusable: true,
      threshold: 10.00,
      isEventBased: false,
      iconCategory: 'comment'
    });
  } catch (error) {
    console.error(error);
  }
})();
