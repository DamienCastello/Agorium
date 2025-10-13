const sequelize = require('../models').sequelize;

async function runSeeds() {
  try {
    console.log('🔄 Connect to database...');
    await sequelize.authenticate();
    console.log('✅ Connection successful !');

    //console.log('🌱 Seeding users...');
    //await require('./01_users')();

    console.log('🌱 Seeding tags...');
    await require('./02_tags')();

    /*
    console.log('🌱 Seeding articles...');
    await require('./03_articles')();

    console.log('🌱 Seeding comments...');
    await require('./04_comments')();
    */

    console.log('🌱 Seeding achievements...');
    await require('./05_achievements.js')();

    console.log('✅ All seeds have been executed successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Error while seeding :', err);
    process.exit(1);
  }
}

runSeeds();