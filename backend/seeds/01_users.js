const models = require('../models');
const User = models.User;

const { faker } = require('@faker-js/faker');

User.create({
    name: 'Gamma',
    email: 'gamma@gmail.com',
    password: '$2b$10$XSGruLpgrpym2uuEqfQNw.GfhRVnjPpw4cYxfPVlBZvdXtnL8ZKOG',
    isAdmin: true,
    avatar:  null
})
.then((user) => { console.log(user); })
.catch((error) => { console.log(error); })