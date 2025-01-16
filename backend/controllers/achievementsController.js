const models = require('../models');
const Achievement = models.Achievement;

module.exports = {
    index: function (req, res, next) {
        Achievement.findAll()
            .then((achievements) => {
                res.status(200).json({ achievements });
            })
            .catch((error) => {
                console.error('Error fetching achievements:', error.message);
                res.status(500).json({ message: 'An error occurred while fetching achievements.' });
            });
    },

    show: function (req, res, next) {
        Achievement.findByPk(req.params.id)
            .then((achievement) => {
                if (!achievement) {
                    return res.status(404).json({ message: 'Achievement not found.' });
                }
                res.status(200).json({ achievement });
            })
            .catch((error) => {
                console.error('Error fetching achievement:', error.message);
                res.status(500).json({ message: 'An error occurred while fetching the achievement.' });
            });
    },

    create: function (req, res, next) {
        if (!req.body.name) {
            return res.status(400).json({ message: 'The "name" field is required.' });
        }
        if (!req.body.description) {
            return res.status(400).json({ message: 'The "description" field is required.' });
        }
        if (!req.body.points) {
            return res.status(400).json({ message: 'The "points" field is required.' });
        }
        if (!req.body.isReusable) {
            return res.status(400).json({ message: 'The "isReusable" field is required.' });
        }
        if (!req.body.isEventBased) {
            return res.status(400).json({ message: 'The "isEventBased" field is required.' });
        }

        Achievement.create({
            name: req.body.name,
            description: req.body.description,
            points: req.body.points,
            threshold: req.body.threshold,
            isReusable: req.body.isReusable,
        })
            .then((achievement) => {
                res.status(201).json({ achievement });
            })
            .catch((error) => {
                console.error('Error creating achievement: ', error.message);
                res.status(500).json({ message: 'An error occurred while creating the achievement.' });
            });
    },

    update: function (req, res, next) {
        Achievement.findByPk(req.params.id)
            .then((achivement) => { achivement.update({
                name: req.params.name,
                description: req.params.description,
                points: req.params.points,
                threshold: req.params.threshold,
                isReusable: req.params.isReusable,
            })
                .then((updatedAchievement) => { res.json({ updatedAchievement }); })
                .catch((error) => { 
                    console.log('error: ', error.message);
                    res.status(500).json({message: 'Error while updating achivement.'});
                 })
             })
            .catch((error) => { 
                console.log('error: ', error.message);
                res.status(500).json({message: 'Internal server error.'});
             })
    },
    delete: function (req, res, next) {
        Achievement.findByPk(req.params.id)
            .then((achievement) => { achievement.destroy() })
            .catch((error) => { 
                console.log('error: ', error.message);
                res.status(500).json({message: 'Internal server error.'});
             })
    },
};
