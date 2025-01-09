// 02_tags.js
const models = require('../models');
const Tag = models.Tag;

Tag.create({ name: 'Politique', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Révolution', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Économie', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Système', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Humour', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Santé', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Truc de zinzin', isValid: false, validatedBy: 1, refusalReason: 'Tag non approprié et trop vague.' });
Tag.create({ name: 'Musique', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'MAO', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Astronomie', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Documentaire', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Technologie', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Éducation', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Culture', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Empathie', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Conscience', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Histoire', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Éveil', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Philosophie', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Symbolisme', isValid: true, validatedBy: 1, refusalReason: '' });
Tag.create({ name: 'Spiritualité', isValid: true, validatedBy: 1, refusalReason: '' });