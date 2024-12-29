// 02_tags.js
const models = require('../models');
const Tag = models.Tag;

Tag.create({ name: 'Politique', isValid: true, validatedBy: 1 });
Tag.create({ name: 'Révolution', isValid: true, validatedBy: 1 });
Tag.create({ name: 'Économie', isValid: true, validatedBy: 1 });
Tag.create({ name: 'Système', isValid: true, validatedBy: 1 });
Tag.create({ name: 'Humour', isValid: true, validatedBy: 1 });
Tag.create({ name: 'Santé', isValid: false });
