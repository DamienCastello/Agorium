const models = require('../models');
const Report = models.Report;

module.exports = {
    create: function (req, res, next) {
        const { reason, details, articleId } = req.body;
        const userId = req.user.id;
    
        Report.create({
            reason,
            details,
            articleId,
            userId
        })
        .then((report) => {
            res.status(201).json(report);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error.' });
        })
    },
    update: function (req, res, next) {
        const { reason, details, articleId } = req.body;
        const userId = req.user.id;

        Report.findByPk(req.body.id)
            .then((report) => { 
                report.update({
                    reason: reason,
                    details: details,
                    articleId: articleId,
                    userId: userId
                })
                .then((updatedReport) => { res.json({ updatedReport }); })
                .catch((error) => { 
                    console.error('error: ', error.message);
                    res.status(500).json({ message: 'Unable to update report.' });
                })
             })
            .catch((error) => { 
                console.error('error: ', error.message);
                res.status(500).json({ message: 'Internal server error.' });
             })


    },    
    delete: function(req, res, next) {
        Report.findByPk(req.body.id)
            .then((report) => { 
                report.destroy()
                res.status(200).json(`Report ${report.id} deleted.`); 
            })
            .catch((error) => { 
                console.error('error: ', error.message);
                res.status(500).json({ message: 'Internal server error.' });
             })
    }
}