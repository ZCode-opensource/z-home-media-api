import fs from 'fs';
import app from './app.js';
import env from './utils/env.js';
import {connectToServer} from './db/mongo.js';

fs.stat(env.STORAGE, (err, stats) => {
  if (err) {
    // console.log(err.message);
    console.log('storage not found, server not running.');
    process.exitCode = 1;
    process.exit();
  }

  if (!stats.isDirectory()) {
    console.log('storage is not a directory, server not running.');
    process.exitCode = 1;
    process.exit();
  }

  connectToServer(function(error: any) {
    if (error) {
      console.log('Couldn\'t connect to database, server not running...');
      process.exitCode = 1;
      process.exit();
    }

    app.listen(env.PORT, function() {
      console.log(`[server]: Server is running on port ${env.PORT}`);
    });
  });
});
