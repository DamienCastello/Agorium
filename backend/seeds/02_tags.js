const models = require('../models');
const Tag = models.Tag;

module.exports = async function() {
  try {
    const tags = [
      { name: 'Politique', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Révolution', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Économie', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Système', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Humour', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Santé', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Truc de zinzin', isValid: false, validatedBy: 1, refusalReason: 'Tag non approprié et trop vague.' },
      { name: 'Musique', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'MAO', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Astronomie', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Documentaire', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Technologie', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Éducation', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Culture', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Empathie', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Conscience', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Histoire', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Éveil', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Philosophie', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Symbolisme', isValid: true, validatedBy: 1, refusalReason: '' },
      { name: 'Spiritualité', isValid: true, validatedBy: 1, refusalReason: '' }
    ];

    // Create all tags sequentially
    for (const tagData of tags) {
      const tag = await Tag.create(tagData);
      console.log(`Created tag: ${tag.name}`);
    }

  } catch (error) {
    console.error('Error while seeding tags:', error);
  }
};
