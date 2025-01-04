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
      refusalReasons: null,
      validatedBy: 1,
      refusalReasons: JSON.stringify({
        title: {
          value: '',
          isValid: true,
          validatedBy: 1,
        },
        description: {
          value: '',
          isValid: true,
          validatedBy: 1,
        },
        urlYoutube: {
          value: '',
          isValid: true,
          validatedBy: 1,
        },
        preview: {
          value: '',
          isValid: true,
          validatedBy: 1,
        },
      }),
      overallReasonForRefusal: ''
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
      userId: null,
      isValid: null,
      refusalReasons: null,
      validatedBy: null,
      refusalReasons: JSON.stringify({
        title: {
          value: '',
          isValid: null,
          validatedBy: null,
        },
        description: {
          value: '',
          isValid: null,
          validatedBy: null,
        },
        urlYoutube: {
          value: '',
          isValid: null,
          validatedBy: null,
        },
        preview: {
          value: '',
          isValid: null,
          validatedBy: null,
        },
      }),
      overallReasonForRefusal: ''
    });

    const tagsForArticle2 = await Tag.findAll({ where: { name: ['Système', 'Économie'] } });
    await article2.addTags(tagsForArticle2);

    const article3 = await Article.create({
      title: 'Du bon son à l\'ancieeene !',
      description: 'Le synthwave qui fait plaisir ! <3',
      urlYoutube: 'https://www.youtube.com/watch?v=Dg4sBFBtLRE',
      preview: null,
      userId: 2,
      isValid: false,
      validatedBy: 1,
      refusalReasons: JSON.stringify({
        title: {
          value: "",
          isValid: null,
          validatedBy: null,
        },
        description: {
          value: "",
          isValid: null,
          validatedBy: null,
        },
        urlYoutube: {
          value: "",
          isValid: null,
          validatedBy: null,
        },
        preview: {
          value: "",
          isValid: null,
          validatedBy: null,
        },
      }),
      overallReasonForRefusal: 'Votre contenu est soigné et pertinent sur le plan artistique, et le tag musical est valide dans certains contextes liés à notre ligne éditoriale. Cependant, le sujet général de l\'article s\'éloigne trop de notre objectif principal, qui est de traiter des thèmes directement liés à l\'actualité, la politique, ou les questions sociétales et culturelles engageant l\'éveil citoyen. Bien que la musique puisse parfois servir de vecteur à ces réflexions, la vidéo proposée ne semble pas apporter de connexion claire avec ces enjeux. Par conséquent, cet article ne sera pas visible par les autres utilisateurs. Nous vous encourageons néanmoins à explorer des sujets qui s\'inscrivent plus directement dans cette perspective pour vos futures contributions.'
    });

    const tagsForArticle3 = await Tag.findAll({ where: { name: ['Musique', 'Truc de zinzin'] } });
    await article3.addTags(tagsForArticle3);

  } catch (error) {
    console.error(error);
  }
})();
