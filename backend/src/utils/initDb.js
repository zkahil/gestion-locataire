
const { initTables } = require('../config/database');
initTables().then(() => console.log('Database initialized')).catch(console.error);
