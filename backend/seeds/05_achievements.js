const models = require('../models');
const { Achievement, User } = models;

(async () => {
  try {
    //Used
    const achievement1 = await Achievement.create({
      id: 1,
      name: 'First article published',
      description: 'Welcome to the authors ! You have published your first article.',
      points: 10,
      isReusable: false,
      threshold: 1.00,
      iconCategory: 'article'
    });

    const achievement1ForUsers = await User.findAll({ where: { id: [1, 2] } });
    await achievement1.addUsers(achievement1ForUsers);

    //Used
    const achievement2 = await Achievement.create({
      id: 2,
      name: '5 articles published',
      description: 'Author in the making ! You have published 5 articles.',
      points: 20,
      isReusable: false,
      threshold: 5.00,
      iconCategory: 'article'
    });

    const achievement2ForUsers = await User.findAll({ where: { id: [2] } });
    await achievement2.addUsers(achievement2ForUsers);

    //Used
    const achievement3 = await Achievement.create({
      id: 3,
      name: 'Prolific author',
      description: 'You have published 20 more articles !',
      points: 50,
      isReusable: true,
      threshold: 20.00,
      iconCategory: 'article'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement4 = await Achievement.create({
      id: 4,
      name: 'Featured Article',
      description: 'Your article has been highlighted by the moderators !',
      points: 30,
      isReusable: true,
      threshold: null,
      iconCategory: 'star'
    });

    //Used
    const achievement5 = await Achievement.create({
      id: 5,
      name: 'first comment',
      description: 'You have written your first comment !',
      points: 10,
      isReusable: false,
      threshold: 1.00,
      iconCategory: 'comment'
    });

    const achievement5ForUsers = await User.findAll({ where: { id: [1, 2, 3, 4] } });
    await achievement5.addUsers(achievement5ForUsers);


    // Example of add achievements to user(s) with progress value
    // for (const user of achievementForUser) {
    //     await UserAchievement.create({
    //       userId: user.id,
    //       achievementId: achievement.id,
    //       progress: 0.5,
    //       dateEarned: new Date()
    //     });
    //   }

    //Used
    const achievement6 = await Achievement.create({
      id: 6,
      name: 'Active commentator',
      description: 'You have written 10 more comments !',
      points: 15,
      isReusable: true,
      threshold: 10.00,
      iconCategory: 'comment'
    });

    //Used
    const achievement7 = await Achievement.create({
      id: 7,
      name: 'First comment liked',
      description: 'One of yours comments have been liked for the first time !',
      points: 10,
      isReusable: false,
      threshold: 1.00,
      iconCategory: 'like'
    });

    //Used
    const achievement8 = await Achievement.create({
      id: 8,
      name: 'Popular comments',
      description: 'Your comments have been liked 10 times !',
      points: 20,
      isReusable: false,
      threshold: 10.00,
      iconCategory: 'like'
    });

    //Used
    const achievement9 = await Achievement.create({
      id: 9,
      name: 'Very popular comments',
      description: 'Your comments have been liked 20 times !',
      points: 30,
      isReusable: false,
      threshold: 20.00,
      iconCategory: 'like'
    });

    //Used
    const achievement10 = await Achievement.create({
      id: 10,
      name: 'Super star of comments',
      description: 'Your comments have been liked 50 times !',
      points: 50,
      isReusable: true,
      threshold: 50.00,
      iconCategory: 'star'
    });

    //Used
    const achievement11 = await Achievement.create({
      id: 11,
      name: 'First like',
      description: 'You liked an article for the first time.',
      points: 10,
      isReusable: false,
      threshold: 1.00,
      iconCategory: 'like'
    });

    /*

    //Not used
    const achievement9 = await Achievement.create({
      id: 9,
      name: 'Member for 1 month',
      description: 'Thank you for being with us for 1 month !',
      points: 10,
      isReusable: false,
      threshold: 1.00,
      isEventBased: true,
      iconCategory: 'calendar'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement10 = await Achievement.create({
      id: 10,
      name: 'Active member',
      description: 'Vous vous êtes connecté(e) 10 jours d\'affilée.',
      points: 20,
      isReusable: false,
      threshold: 10.00,
      isEventBased: false,
      iconCategory: 'calendar'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement11 = await Achievement.create({
      id: 11,
      name: 'Committed creator',
      description: 'You have replied to 10 comments on your articles.',
      points: 25,
      isReusable: true,
      threshold: 10.00,
      isEventBased: false,
      iconCategory: 'comment'
    });

    //Not used
    const achievement12 = await Achievement.create({
      id: 12,
      name: 'Very popular article',
      description: 'Your article received 100 likes !',
      points: 50,
      isReusable: true,
      threshold: 100.00,
      isEventBased: false,
      iconCategory: 'like'
    });

    //Not used
    const achievement13 = await Achievement.create({
      id: 13,
      name: 'Popular comment',
      description: 'One of your comments got 20 likes.',
      points: 20,
      isReusable: true,
      threshold: 20.00,
      isEventBased: false,
      iconCategory: 'like'
    });

    //Not used
    const achievement14 = await Achievement.create({
      id: 14,
      name: 'Approval up',
      description: '10 articles are approved by moderators.',
      points: 30,
      isReusable: false,
      threshold: 10.00,
      isEventBased: false,
      iconCategory: 'article'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement15 = await Achievement.create({
      id: 15,
      name: 'First valid report',
      description: 'Your first valid report helped identify problematic content.',
      points: 10,
      isReusable: true,
      threshold: 1.00,
      isEventBased: true,
      iconCategory: 'flag'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement16 = await Achievement.create({
      id: 16,
      name: 'Budding moderator',
      description: 'You have made 10 valid reports.',
      points: 30,
      isReusable: true,
      threshold: 10.00,
      isEventBased: false,
      iconCategory: 'flag'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement17 = await Achievement.create({
      id: 17,
      name: 'Birthday badge',
      description: 'Happy Birthday ! You have been with us for 1 year.',
      points: 50,
      isReusable: false,
      threshold: 1.00,
      isEventBased: true,
      iconCategory: 'calendar'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement18 = await Achievement.create({
      id: 18,
      name: 'Article in view',
      description: 'Your article generated 50 views in 24 hours.',
      points: 40,
      isReusable: true,
      threshold: 50.00,
      isEventBased: true,
      iconCategory: 'eye'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement19 = await Achievement.create({
      id: 19,
      name: 'Explorer',
      description: 'You have read 50 different articles.',
      points: 25,
      isReusable: true,
      threshold: 50.00,
      isEventBased: false,
      iconCategory: 'flag'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement20 = await Achievement.create({
      id: 20,
      name: 'Loyal member',
      description: 'You have visited the platform for 7 consecutive days.',
      points: 10,
      isReusable: true,
      threshold: 7.00,
      isEventBased: false,
      iconCategory: 'celendar'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement21 = await Achievement.create({
      id: 21,
      name: 'Regular connection',
      description: 'You logged in 30 days in the year.',
      points: 25,
      isReusable: false,
      threshold: 30.00,
      isEventBased: false,
      iconCategory: 'celendar'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement22 = await Achievement.create({
      id: 22,
      name: 'Registered for 5 years',
      description: 'Thank you for these 5 years with us !',
      points: 100,
      isReusable: false,
      threshold: 5.00,
      isEventBased: true,
      iconCategory: 'star'
    });

    //Not used
    // TODO: Need implementation back & front
    const achievement23 = await Achievement.create({
      id: 23,
      name: 'Insomniac',
      description: 'You were active between 2am and 5am.',
      points: 5,
      isReusable: true,
      threshold: null, //write zzz in badge
      isEventBased: true,
      iconCategory: 'celendar'
    });

    */

    
  } catch (error) {
    console.error(error);
  }
})();
