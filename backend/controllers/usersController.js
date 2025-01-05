const models = require('../models');
const User = models.User;

module.exports = {
    index: function(req, res, next) {
        User.findAll({include: models.Article})
            .then((users) => { res.json({ users }); })
            .catch((error) => { 
                console.log('error: ', error.message);
                res.status(500).json({message: 'Internal server error.'});
             })
    },
    show: function(req, res, next) {
        User.findByPk(req.params.id, {include: models.Article})
            .then((user) => { res.json({ user }); })
            .catch((error) => { 
                console.log('error: ', error.message);
                res.status(500).json({message: 'Internal server error.'});
             })
    },
    create: function(req, res, next) {
        User.create({
            name: req.params.name,
            password: req.params.password,
            email: req.params.email,
            isAdmin: false,
            avatar: req.params.avatar
        })
            .then((user) => { res.json({ user }); })
            .catch((error) => { 
                console.log('error: ', error.message);
                res.status(500).json({message: 'Internal server error.'});
             })
    },
    update: function(req, res, next) {
        User.findByPk(req.params.id)
            .then((user) => { user.update({
                name: req.params.name,
                password: req.params.password,
                email: req.params.email,
                isAdmin: false,
                avatar: req.params.avatar
            })
                .then((updatedUser) => { res.json({ updatedUser }); })
                .catch((error) => { 
                    console.log('error: ', error.message);
                    res.status(500).json({message: 'Error while updating user.'});
                 })
             })
            .catch((error) => { 
                console.log('error: ', error.message);
                res.status(500).json({message: 'Internal server error.'});
             })
    },
    delete: function(req, res, next) {
        User.findByPk(req.params.id)
            .then((user) => { user.destroy() })
            .catch((error) => { 
                console.log('error: ', error.message);
                res.status(500).json({message: 'Internal server error.'});
             })
    }
}