const { startServer } = require('./server');

startServer().catch(() => process.exit(1));
