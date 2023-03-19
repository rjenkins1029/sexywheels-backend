const client = require('./client');
const { rebuildDB } = require('./seedData');

rebuildDB()
  // .then(testDB)
  .catch(console.error)
  .finally(() => client.end());