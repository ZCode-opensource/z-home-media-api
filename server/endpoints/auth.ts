import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcrypt';
import {getDb} from '../db/mongo.js';

/* eslint new-cap: ["error", { "capIsNewExceptions": ["Router"] }] */
const auth = express.Router();
// const saltRounds = Number(process.env.SALT_ROUNDS);

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface SessionData {
    userId: string;
    user: string;
    profile: number;
  }
}

auth.post('/', function(req, res) {
  const {user, password} = req.body;

  if (
    user !== undefined &&
    user.length > 0 &&
    password !== undefined &&
    password.length > 0
  ) {
    const db = getDb();

    db.collection('users')
        .findOne({username: user})
        .then((dbResult: any) => {
          if (dbResult !== null) {
            bcrypt.compare(
                password,
                dbResult.password,
                function(_err, authResult) {
                  if (authResult) {
                    req.session.userId = dbResult._id;
                    req.session.user = dbResult.username;
                    req.session.profile = dbResult.profile;
                    res.json(
                        {
                          user: dbResult.username,
                          profile: dbResult.profile,
                        },
                    );
                    return;
                  }

                  res.status(400).send('Invalid credentials');
                },
            );

            return;
          }

          res.status(400).send('Invalid credentials');
        });

    return;
  }

  res.status(400).send('Invalid credentials');
});

auth.get('/logout', function(req, res) {
  req.session.destroy(() => {
    res.sendStatus(200);
  });
});

auth.get('/info', function(req, res) {
  if (req.session.userId === undefined) {
    res.status(400).send('Invalid credentials');
    return;
  }

  res.json({user: req.session.user, profile: req.session.profile});
});

export default auth;
