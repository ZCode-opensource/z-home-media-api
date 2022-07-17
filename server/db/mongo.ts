import {MongoClient} from 'mongodb';

const uri = 'mongodb://localhost:27017/?readPreference=primary&ssl=false';

const client = new MongoClient(uri);

let dbConnection: any;

/**
 * @param {Function} callback callback function
 * @returns {any} Callback
 */
function connectToServer(callback: Function): any {
  client.connect((err, db) => {
    if (err || !db) {
      return callback(err);
    }

    dbConnection = db.db('zHomeMedia');
    console.log('Successfully connected to MongoDB.');

    return callback();
  });

  return null;
}

/**
 * @returns {any} Database connection object
 */
function getDb(): any {
  return dbConnection;
}

export {connectToServer, getDb};
