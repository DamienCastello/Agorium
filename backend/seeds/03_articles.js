const models = require('../models');
const { Article, Like, Tag } = models;

(async () => {
  try {
    const article1 = await Article.create({
      title: 'Coup d’Etat OU élections : Comment RENVERSER les élites ? - Juan Branco',
      description: 'Enfin des mots sur les maux du système !',
      urlYoutube: 'https://www.youtube.com/watch?v=aHXTnmysFfw',
      preview: null,
      userId: 1,
      isValid: true,
      validator: 1,
    });

    await Like.bulkCreate([
      { userId: 1, articleId: article1.id },
      { userId: 2, articleId: article1.id },
    ]);

    const tagsForArticle1 = await Tag.findAll({ where: { name: ['Politique', 'Révolution'] } });
    await article1.addTags(tagsForArticle1);

    const article2 = await Article.create({
      title: 'Pourquoi ne sommes nous pas en démocratie ?',
      description: 'Notre cause commune: Instituer nous-mêmes la puissance politique qui nous manque.',
      urlYoutube: 'https://www.youtube.com/watch?v=pNhjfgD0_m8',
      preview: null,
      userId: 1,
      isValid: false,
      validator: null,
    });

    await Like.create({ userId: 1, articleId: article2.id });

    const tagsForArticle2 = await Tag.findAll({ where: { name: ['Système', 'Économie'] } });
    await article2.addTags(tagsForArticle2);
  } catch (error) {
    console.error(error);
  }
})();
