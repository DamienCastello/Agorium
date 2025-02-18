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
                res.status(500).json({ message: req.t('achievement.error_fetch_all') });
            });
    },

    show: function (req, res, next) {
        Achievement.findByPk(req.params.id)
            .then((achievement) => {
                if (!achievement) {
                    return res.status(404).json({ message: req.t('achievement.not_found') });
                }
                res.status(200).json({ achievement });
            })
            .catch((error) => {
                console.error('Error fetching achievement:', error.message);
                res.status(500).json({ message: req.t('achievement.error_fetch') });
            });
    },

    create: function (req, res, next) {
        if (!req.body.name) {
            return res.status(400).json({ message: req.t('achievement.name_required') });
        }
        if (!req.body.description) {
            return res.status(400).json({ message: req.t('achievement.description_required') });
        }
        if (!req.body.points) {
            return res.status(400).json({ message: req.t('achievement.points_required') });
        }
        if (!req.body.isReusable) {
            return res.status(400).json({ message: req.t('achievement.isReusable_required') });
        }
        if (!req.body.isEventBased) {
            return res.status(400).json({ message: req.t('achievement.isEventBased_required') });
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
                res.status(500).json({ message: req.t('achievement.error_create') });
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
                    res.status(500).json({message: req.t('achievement.error_update') });
                 })
             })
            .catch((error) => { 
                console.log('error: ', error.message);
                res.status(500).json({message: req.t('error') });
             })
    },
    delete: function (req, res, next) {
        Achievement.findByPk(req.params.id)
            .then((achievement) => { achievement.destroy() })
            .catch((error) => { 
                console.log('error: ', error.message);
                res.status(500).json({message: req.t('error') });
             })
    },
};
