const models = require('../models');
const User = models.User;

module.exports = async function() {
  try {
    const user1 = await User.create({
      id: 1,
      pseudo: 'Gamma',
      email: 'gamma@gmail.com',
      password: '$2b$10$XSGruLpgrpym2uuEqfQNw.GfhRVnjPpw4cYxfPVlBZvdXtnL8ZKOG',
      isAdmin: true,
      avatar: null,
      points: 20
    });
    console.log(user1);

    /*
    const user2 = await User.create({
      id: 2,
      pseudo: 'Zanmato',
      email: 'zanma@gmail.com',
      password: '$2b$10$XSGruLpgrpym2uuEqfQNw.GfhRVnjPpw4cYxfPVlBZvdXtnL8ZKOG',
      isAdmin: false,
      avatar: null,
      points: 40
    });
    console.log(user2);

    const user3 = await User.create({
      id: 3,
      pseudo: 'tsuk',
      email: 'tsuk@gmail.com',
      password: '$2b$10$XSGruLpgrpym2uuEqfQNw.GfhRVnjPpw4cYxfPVlBZvdXtnL8ZKOG',
      isAdmin: false,
      avatar: null,
      points: 10
    });
    console.log(user3);

    const user4 = await User.create({
      id: 4,
      pseudo: 'John',
      email: 'john@gmail.com',
      password: '$2b$10$XSGruLpgrpym2uuEqfQNw.GfhRVnjPpw4cYxfPVlBZvdXtnL8ZKOG',
      isAdmin: false,
      avatar: null,
      points: 10
    });
    console.log(user4);
    */

  } catch (error) {
    console.error('Error while seeding users:', error);
  }
};
