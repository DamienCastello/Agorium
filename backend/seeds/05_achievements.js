module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.bulkInsert('Achievements', [
        //Used
      {
        id: 1,
        name: 'First article published',
        description: 'Welcome to the authors ! You have published your first article.',
        points: 10,
        isReusable: false,
        threshold: 1.00,
        iconCategory: 'article',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  
      {
        id: 2,
        name: '5 articles published',
        description: 'Author in the making ! You have published 5 articles.',
        points: 20,
        isReusable: false,
        threshold: 5.00,
        iconCategory: 'article',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  
      {
        id: 3,
        name: 'Prolific author',
        description: 'You have published 20 more articles !',
        points: 50,
        isReusable: true,
        threshold: 20.00,
        iconCategory: 'article',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  
      //Not used
      // TODO: Need implementation back & front
      {
        id: 4,
        name: 'Featured Article',
        description: 'Your article has been highlighted by the moderators !',
        points: 30,
        isReusable: true,
        threshold: null,
        iconCategory: 'star',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  
      //Used
      {
        id: 5,
        name: 'first comment',
        description: 'You have written your first comment !',
        points: 10,
        isReusable: false,
        threshold: 1.00,
        iconCategory: 'comment',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  
      {
        id: 6,
        name: 'Active commentator',
        description: 'You have written 10 more comments !',
        points: 15,
        isReusable: true,
        threshold: 10.00,
        iconCategory: 'comment',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  
      //To implement
      {
        id: 7,
        name: 'First comment liked',
        description: 'One of yours comments have been liked for the first time !',
        points: 10,
        isReusable: false,
        threshold: 1.00,
        iconCategory: 'like',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  
      //To implement
      {
        id: 8,
        name: 'Popular comments',
        description: 'Your comments have been liked 10 times !',
        points: 20,
        isReusable: false,
        threshold: 10.00,
        iconCategory: 'like',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  
      //To implement
      {
        id: 9,
        name: 'Very popular comments',
        description: 'Your comments have been liked 20 times !',
        points: 30,
        isReusable: false,
        threshold: 20.00,
        iconCategory: 'like',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  
      //To implement
      {
        id: 10,
        name: 'Super star of comments',
        description: 'Your comments have been liked 50 times !',
        points: 50,
        isReusable: true,
        threshold: 50.00,
        iconCategory: 'star',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  
      //Used
      {
        id: 11,
        name: 'First like',
        description: 'You liked an article for the first time.',
        points: 10,
        isReusable: false,
        threshold: 1.00,
        iconCategory: 'like',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      ]);
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.bulkDelete('Achievements', null, {});
    },
  };
  