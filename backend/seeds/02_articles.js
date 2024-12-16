const models = require('../models');
const Article = models.Article;

const { faker } = require('@faker-js/faker');

for(let i = 0; i < 1; i++){
    Article.create({
        title: 'Mais que faut il donc pour prospérer ?',
        description: 'THRIVE I est un documentaire atypique qui lève le voile sur ce qui se passe RÉELLEMENT dans le monde, en remontant la piste de l’argent et en dévoilant la consolidation du pouvoir à l’échelle mondiale dans presque chaque aspect de nos vies. Traitant à la fois de découvertes scientifiques et d’avancées en matière de conscience et d’activisme, THRIVE propose de vraies solutions et nous arme de stratégies audacieuses et inédites pour reconquérir nos vies et notre avenir.',
        urlYoutube: 'https://www.youtube.com/watch?v=QIU0BUyZ0-A',
        image: null,
        userId: 1,
        valid: true,
        validator: 1
    })
    Article.create({
        title: 'Pourquoi ne sommes nous pas en démocratie ?',
        description: 'Notre cause commune: Instituer nous-mêmes la puissance politique qui nous manque.',
        urlYoutube: 'https://www.youtube.com/watch?v=pNhjfgD0_m8',
        image: null,
        userId: 1,
        valid: false,
        validator: null
    })
    .then((resource) => { console.log(resource); })
    .catch((error) => { console.log(error); })
}