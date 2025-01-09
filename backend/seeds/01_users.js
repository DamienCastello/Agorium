const models = require('../models');
const User = models.User;

User.create({
    id: 1,
    name: 'Gamma',
    email: 'gamma@gmail.com',
    password: '$2b$10$XSGruLpgrpym2uuEqfQNw.GfhRVnjPpw4cYxfPVlBZvdXtnL8ZKOG',
    isAdmin: true,
    avatar:  null
})
.then((user) => { console.log(user); })
.catch((error) => { console.log(error); })

User.create({
    id: 2,
    name: 'Zanmato',
    email: 'zanma@gmail.com',
    password: '$2b$10$XSGruLpgrpym2uuEqfQNw.GfhRVnjPpw4cYxfPVlBZvdXtnL8ZKOG',
    isAdmin: false,
    avatar:  null
})
.then((user) => { console.log(user); })
.catch((error) => { console.log(error); })

User.create({
    id: 3,
    name: 'tsuk',
    email: 'tsuk@gmail.com',
    password: '$2b$10$XSGruLpgrpym2uuEqfQNw.GfhRVnjPpw4cYxfPVlBZvdXtnL8ZKOG',
    isAdmin: false,
    avatar:  null
})
.then((user) => { console.log(user); })
.catch((error) => { console.log(error); })

User.create({
    id: 4,
    name: 'John',
    email: 'john@gmail.com',
    password: '$2b$10$XSGruLpgrpym2uuEqfQNw.GfhRVnjPpw4cYxfPVlBZvdXtnL8ZKOG',
    isAdmin: false,
    avatar:  null
})
.then((user) => { console.log(user); })
.catch((error) => { console.log(error); })