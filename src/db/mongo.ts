import {MongoClient} from 'mongodb';
import env from '..//utils/env.js';
import logger from '../utils/logger.js';

const uri = `mongodb://${env.MONGO_USER}:${env.MONGO_PASSWORD}@${env.MONGO_HOST}:${env.MONGO_PORT}/`;

const client = new MongoClient(uri);

let database: any;

/**
 * Connects to mongodb server
 */
async function connect() {
  logger.debug(`Connecting to mongodb with: ${uri}`);

  try {
    const connection = await client.connect();
    database = connection.db('zHomeMedia');
    logger.info('Successfully connected to mongodb');
  } catch (e) {
    logger.error(`Couldn't connect to database ${e}`);
    process.exitCode = 1;
    process.exit();
  }
}

/**
 * @returns {any} Database connection object
 */
function getDb(): any {
  return database;
}

/**
 * Disconnects from mongodb server
 */
async function disconnect() {
  await client.close();
}

export {connect, disconnect, getDb};
