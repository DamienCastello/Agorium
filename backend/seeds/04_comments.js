const models = require('../models');
const Comment = models.Comment;

Comment.create({
    content: "C'est un article vraiment intéressant, j'approuve!",
    articleId: 1,
    userId: 2,
});

Comment.create({
    content: "Je suis d'accord, la démocratie a besoin d'un renouveau!",
    articleId: 2,
    userId: 3,
});

Comment.create({
    content: "On en a gros !",
    articleId: 1,
    userId: 1,
});