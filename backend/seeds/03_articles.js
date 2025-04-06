const models = require('../models');
const { Article, Like, Tag } = models;

module.exports = async function() {
  try {
    const article1 = await Article.create({
      id: 10,
      title: 'Matrix n\'est pas un film, c\'est une initiation !',
      description: 'Avez-vous tout de même essayé d’en parler ? Si oui, vous vous êtes sans doute confronté à une limite et vous avez réalisé que les mots ne peuvent pas tout dire. Alors implicitement, vous avez compris le sens de « ésotérisme ». Souvent interprété comme une manière de cacher un enseignement réservé à des initiés, l’ésotérisme est davantage un moyen de transmettre des connaissances avec des images, des symboles et des paraboles ce qui ne peut l’être qu’avec des mots. Si vous me suivez jusqu’ici, c’est peut-être parce que vous pensez que le film Matrix introduit des vérités mystérieuses, ce qui en ferait en ce sens, une œuvre ésotérique. Et peut-être que votre désir de connaître ses vérités pourrait être intimement lié à la raison pour laquelle vous cherchez irrémédiablement à apporter du sens à votre vie. Ce que le film ne vous a pas clairement dit, il vous l’a sans doute montré, imagé ou supposé… Mais l’avez-vous seulement remarqué ? Bon visionnage !',
      urlYoutube: 'https://www.youtube.com/watch?v=APUqSLm3uZI&t=4s',
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
        videoContent: {
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
      overallReasonForRefusal: '',
      createdAt: new Date('2025-01-01')
    });

    await Like.bulkCreate([
      { userId: 2, articleId: article1.id },
      { userId: 3, articleId: article1.id },
    ]);

    const tagsForArticle1 = await Tag.findAll({ where: { name: ['Éveil', 'Conscience', 'Philosophie', 'Symbolisme', 'Spiritualité'] } });
    await article1.addTags(tagsForArticle1);

    const article2 = await Article.create({
      id: 9,
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
        videoContent: {
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
      overallReasonForRefusal: '',
      createdAt: new Date('2024-12-24')
    });

    await Like.bulkCreate([
      { userId: 3, articleId: article2.id },
      { userId: 2, articleId: article2.id },
    ]);

    const tagsForArticle2 = await Tag.findAll({ where: { name: ['Politique', 'Révolution'] } });
    await article2.addTags(tagsForArticle2);

    const article3 = await Article.create({
      id: 8,
      title: 'Outer Wilds - Main Title Theme - FL Studio Cover',
      description: 'Super tuto pour recréer cette splandide musique sur FLStudio',
      urlYoutube: 'https://www.youtube.com/watch?v=UL8rWRNGzHY',
      preview: null,
      userId: 2,
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
        videoContent: {
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
      overallReasonForRefusal: '',
      createdAt: new Date('2024-12-23')
    });

    await Like.bulkCreate([
      { userId: 1, articleId: article3.id },
      { userId: 3, articleId: article3.id },
    ]);

    const tagsForArticle3 = await Tag.findAll({ where: { name: ['Musique', 'MAO'] } });
    await article3.addTags(tagsForArticle3);

    const article4 = await Article.create({
      id: 7,
      title: 'Le Secret de l\'Intelligence Émotionnelle',
      description: 'Cette conférence soulève des questions provocantes sur notre capacité innée à sympathiser versus les forces qui peuvent nous empêcher de nous connecter les uns avec les autres. Que ce soit dans nos interactions quotidiennes ou dans notre façon de consommer, le célèbre psychiatre Daniel Goleman nous défie de regarder au-delà de la surface. Comment pourrions-nous faire des choix plus conscients et davantage considérer les autres dans notre vie quotidienne ?',
      urlYoutube: 'https://www.youtube.com/watch?v=Bomjedb1OB4',
      preview: null,
      userId: 2,
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
        videoContent: {
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
      overallReasonForRefusal: '',
      createdAt: new Date('2024-09-17')
    });

    await Like.bulkCreate([
      { userId: 1, articleId: article4.id },
      { userId: 3, articleId: article4.id },
    ]);

    const tagsForArticle4 = await Tag.findAll({ where: { name: ['Empathie', 'Conscience'] } });
    await article4.addTags(tagsForArticle4);
    
    const article5 = await Article.create({
      id: 6,
      title: 'L\'agent double qui a changé le cours de la Seconde Guerre mondiale - HDG',
      description: 'Découvrez l\'historie de Juan Pujol Garcià, l\'agent double qui a changé le cours de la Seconde Guerre mondiale !',
      urlYoutube: 'https://www.youtube.com/watch?v=TGPYqrXIL4Q',
      preview: null,
      userId: 2,
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
        videoContent: {
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
      overallReasonForRefusal: '',
      createdAt: new Date('2024-06-28')
    });

    await Like.bulkCreate([
      { userId: 1, articleId: article5.id },
      { userId: 3, articleId: article5.id },
    ]);

    const tagsForArticle5 = await Tag.findAll({ where: { name: ['Histoire', 'Documentaire'] } });
    await article5.addTags(tagsForArticle5);

    const article6 = await Article.create({
      id: 5,
      title: 'Parler plusieurs langues va changer ta vie',
      description: 'Vous n\'arrivez pas à vous décider à apprendre une langue ? Ca ne sera bientôt plus le cas.',
      urlYoutube: 'https://www.youtube.com/watch?v=i0LzHQPW-K4',
      preview: null,
      userId: 2,
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
        videoContent: {
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
      overallReasonForRefusal: '',
      createdAt: new Date('2023-10-17')
    });

    await Like.bulkCreate([
      { userId: 1, articleId: article6.id },
      { userId: 3, articleId: article6.id },
    ]);

    const tagsForArticle6 = await Tag.findAll({ where: { name: ['Éducation', 'Culture'] } });
    await article6.addTags(tagsForArticle6);

    const article7 = await Article.create({
      id: 4,
      title: 'Course à l\'IA, vers le meilleur des mondes ? | ARTE',
      description: 'État des lieux des avancées en matière d’intelligence artificielle en Europe, à l’aube d’une nouvelle ère aux bouleversements encore inconnus.',
      urlYoutube: 'https://www.youtube.com/watch?v=_kcnrG6Yxfo',
      preview: null,
      userId: 2,
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
        videoContent: {
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
      overallReasonForRefusal: '',
      createdAt: new Date('2023-08-13')
    });

    await Like.bulkCreate([
      { userId: 1, articleId: article7.id },
      { userId: 3, articleId: article7.id },
    ]);

    const tagsForArticle7 = await Tag.findAll({ where: { name: ['Technologie', 'Documentaire'] } });
    await article7.addTags(tagsForArticle7);

    const article8 = await Article.create({
      id: 3,
      title: 'Un Voyage FASCINANT vers les Merveilles de l\'Univers du télescope James Webb',
      description: 'Le télescope spatial James Webb, en 2024, continue d\'émerveiller les scientifiques et le grand public avec ses découvertes révolutionnaires. Conçu pour explorer l\'univers dans des détails jamais atteints auparavant, Webb est à la pointe de l\'exploration spatiale. Installé à une distance de plus de 1,5 million de kilomètres de la Terre, il observe les confins de l’univers en infrarouge, révélant des mystères anciens et des phénomènes invisibles pour les autres télescopes.',
      urlYoutube: 'https://www.youtube.com/watch?v=mCJuR7YKnz0',
      preview: null,
      userId: 2,
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
        videoContent: {
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
      overallReasonForRefusal: '',
      createdAt: new Date('2023-06-06')
    });

    await Like.bulkCreate([
      { userId: 1, articleId: article8.id },
      { userId: 3, articleId: article8.id },
    ]);

    const tagsForArticle8 = await Tag.findAll({ where: { name: ['Astronomie', 'Documentaire'] } });
    await article8.addTags(tagsForArticle8);

    const article9 = await Article.create({
      id: 2,
      title: 'Pourquoi ne sommes nous pas en démocratie ?',
      description: 'Notre cause commune: Instituer nous-mêmes la puissance politique qui nous manque.',
      urlYoutube: 'https://www.youtube.com/watch?v=pNhjfgD0_m8',
      preview: null,
      userId: 2,
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
        videoContent: {
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
      overallReasonForRefusal: '',
      createdAt: new Date('2025-01-02')
    });

    const tagsForArticle9 = await Tag.findAll({ where: { name: ['Système', 'Économie'] } });
    await article9.addTags(tagsForArticle9);

    const article10 = await Article.create({
      id: 1,
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
        videoContent: {
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
      overallReasonForRefusal: 'Vous n\'avez fournis pas la preuve que vous êtes détenteur des droits d\'auteur.',
      createdAt: new Date('2025-01-03')
    });

    const tagsForArticle10 = await Tag.findAll({ where: { name: ['Musique', 'Truc de zinzin'] } });
    await article10.addTags(tagsForArticle10);


  } catch (error) {
    console.error(error);
  }
};
