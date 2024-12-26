// 02_tags.js
const models = require('../models');
const Tag = models.Tag;

Tag.create({ name: 'Politique' });
Tag.create({ name: 'Économie' });
Tag.create({ name: 'Système' });
Tag.create({ name: 'Humour' });
