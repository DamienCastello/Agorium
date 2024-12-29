const models = require('../models');
const Tag = models.Tag;

module.exports = {
    index: function (req, res, next) {
        Tag.findAll()
            .then((tags) => {
                res.status(200).json({ tags });
            })
            .catch((error) => {
                console.error('Error fetching tags:', error);
                res.status(500).json({ error: 'An error occurred while fetching tags.' });
            });
    },

    show: function (req, res, next) {
        Tag.findByPk(req.params.id)
            .then((tag) => {
                if (!tag) {
                    return res.status(404).json({ error: 'Tag not found.' });
                }
                res.status(200).json({ tag });
            })
            .catch((error) => {
                console.error('Error fetching tag:', error);
                res.status(500).json({ error: 'An error occurred while fetching the tag.' });
            });
    },

    create: function (req, res, next) {
        if (!req.body.name) {
            return res.status(400).json({ error: 'The "name" field is required.' });
        }

        Tag.create({ name: req.body.name, isValid: false })
            .then((tag) => {
                res.status(201).json({ tag });
            })
            .catch((error) => {
                console.error('Error creating tag:', error);
                res.status(500).json({ error: 'An error occurred while creating the tag.' });
            });
    },

    update: function (req, res, next) {
        const user = req.user; // user signed with JWT

        Tag.findByPk(req.params.id, {
            include: [
                {
                    model: models.Article,
                    as: 'articles',
                    include: [
                        {
                            model: models.User,
                            as: 'user',
                            attributes: ['id', 'name', 'email', 'isAdmin'],
                        }
                    ]
                }
            ]
        })
            .then((tag) => {
                if (!tag) {
                    return res.status(404).json({ error: 'Tag not found.' });
                }

                if (tag.articles.length === 0) {
                    return res.status(403).json({ error: 'Tag cannot be updated as it has no associated articles.' });
                }

                const canUpdate = tag.articles.some((article) => article.user.id === user.id) || user.isAdmin;

                if (!canUpdate) {
                    return res.status(403).json({ error: 'Only the tag creator or an admin can update the tag.' });
                }

                if (!req.body.name) {
                    return res.status(400).json({ error: 'The "name" field is required.' });
                }

                tag.update({ name: req.body.name })
                    .then((updatedTag) => {
                        res.status(200).json({ tag: updatedTag });
                    })
                    .catch((error) => {
                        console.error('Error updating tag:', error);
                        res.status(500).json({ error: 'An error occurred while updating the tag.' });
                    });
            })
            .catch((error) => {
                console.error('Error finding tag:', error);
                res.status(500).json({ error: 'An error occurred while finding the tag.' });
            });
    },

    validate: function (req, res, next) {
        const user = req.user; // user signed with JWT

        if (!user.isAdmin) {
            return res.status(403).json({ error: 'Only an admin can validate a tag.' });
        }

        Tag.findByPk(req.params.id)
            .then((tag) => {
                if (!tag) {
                    return res.status(404).json({ error: 'Tag not found.' });
                }

                tag.update({
                    isValid: true,
                    validatedBy: user.id,
                })
                    .then((validatedTag) => {
                        res.json({ validatedTag });
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).json({ error: 'An error occurred while validating the tag.' });
                    });
            })
            .catch((error) => {
                console.error('Error on finding tag:', error);
                res.status(500).json({ error: 'An error occurred while updating the tag.' });
            });
    },

    delete: function (req, res, next) {
        const user = req.user; // user signed with JWT

        Tag.findByPk(req.params.id, {
            include: [
                {
                    model: models.Article,
                    as: 'articles',
                    include: [
                        {
                            model: models.User,
                            as: 'user',
                            attributes: ['id', 'isAdmin'],
                        }
                    ]
                }
            ]
        })
            .then((tag) => {
                if (!tag) {
                    return res.status(404).json({ error: 'Tag not found.' });
                }

                const canDelete = user.isAdmin || tag.articles.some((article) => article.user.id === user.id);

                if (!canDelete) {
                    return res.status(403).json({ error: 'Only the admin or the tag creator can delete the tag.' });
                }

                return tag.destroy();
            })
            .then(() => {
                res.status(204).send(); // No content
            })
            .catch((error) => {
                console.error('Error deleting tag:', error);
                res.status(500).json({ error: 'An error occurred while deleting the tag.' });
            });
    },
};
