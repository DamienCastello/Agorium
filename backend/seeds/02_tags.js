// 02_tags.js
const models = require('../models');
const Tag = models.Tag;

Tag.create({ name: 'Politique', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Révolution', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Économie', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Système', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Humour', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Santé', isValid: null, validatedBy: null, refusalReason: '' });
Tag.create({ name: 'Truc de zinzin', isValid: false, validatedBy: 1, refusalReason: 'Tag non approprié et trop vague.' });
Tag.create({ name: 'Musique', isValid: true });
