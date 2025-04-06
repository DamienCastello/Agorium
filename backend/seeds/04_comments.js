const models = require('../models');
const Comment = models.Comment;

module.exports = async function() {
  try {
    const comments = [
      {
        content: "J'avais déjà entendu dire que Matrix avait des significations cachées, mais je ne m'attendais pas à une telle profondeur. Ce genre d'analyse donne envie de revoir le film avec un regard complètement différent ! Merci pour cette perspective.",
        articleId: 10,
        userId: 2,
      },
      {
        content: "Je trouve fascinant de considérer que des films populaires comme Matrix peuvent transmettre des vérités universelles à travers des symboles. C'est une belle manière de toucher un large public sans les brusquer.",
        articleId: 10,
        userId: 3,
      },
      {
        content: "Pensez-vous que les réalisateurs avaient réellement l’intention de transmettre un message ésotérique, ou est-ce nous, spectateurs, qui projetons ce type d’interprétation sur le film ? En tout cas, ça pousse à réfléchir...",
        articleId: 10,
        userId: 4,
      },
      {
        content: "C'est une excellente question ! Je pense que l'intention des réalisateurs importe moins que ce que chacun retire du film. L’ésotérisme, c’est justement laisser à l’interprétation personnelle une place importante. Ce qui compte, c’est ce que vous en faites pour nourrir votre propre quête de sens.",
        articleId: 10,
        userId: 1,
      },
      {
        content: "C'est un article vraiment intéressant, j'approuve!",
        articleId: 9,
        userId: 2,
      },
      {
        content: "Je suis d'accord, la démocratie a besoin d'un renouveau!",
        articleId: 9,
        userId: 3,
      },
      {
        content: "Super !! J'adore cette musique ! Merci <3",
        articleId: 8,
        userId: 2,
      },
      {
        content: "Hâte de la reproduire ! Thanks !",
        articleId: 8,
        userId: 1,
      }
    ];

    // Create all comments sequentially
    for (const commentData of comments) {
      const comment = await Comment.create(commentData);
      console.log(`Created comment: ${comment.content.slice(0, 30)}...`);
    }

  } catch (error) {
    console.error('Error while seeding comments:', error);
  }
};
