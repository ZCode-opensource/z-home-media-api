import fs from 'fs';
import app from './app.js';
import env from './utils/env.js';
import * as mongodb from './db/mongo.js';
import logger from './utils/logger.js';

await mongodb.connect();

fs.stat(env.STORAGE, (err, stats) => {
  if (err) {
    logger.error('storage not found, server not running.');
    process.exitCode = 1;
    process.exit();
  }

  if (!stats.isDirectory()) {
    logger.error('storage is not a directory, server not running.');
    process.exitCode = 1;
    process.exit();
  }

  app.listen(env.PORT, function() {
    logger.info(`Server is running on port ${env.PORT}`);
  });
});
