const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017/?readPreference=primary&ssl=false";

const client = new MongoClient(uri);

let dbConnection: any;

export function connectToServer (callback: any) {
  client.connect(function (err: undefined, db: { db: (arg0: string) => any; }) {
    if (err || !db) {
      return callback(err);
    }

    dbConnection = db.db("zHomeMedia");
    console.log("Successfully connected to MongoDB.");

    return callback();
  });
}

export function getDb () {
  return dbConnection;
}
