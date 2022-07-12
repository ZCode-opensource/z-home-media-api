import express from 'express';
import { getDb } from '../db/mongo';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const auth = express.Router();
// const saltRounds = Number(process.env.SALT_ROUNDS);

declare module 'express-session' {
  interface SessionData {
    userId: string;
    user: string;
  }
}

auth.post('/', function (req, res) {
  const { user, password, remember } = req.body;

  if (
    user !== undefined &&
    user.length > 0 &&
    password !== undefined &&
    password.length > 0
  ) {
    const db = getDb();

    db.collection('users')
      .findOne({ username: user })
      .then((dbResult: any) => {
        if (dbResult !== null) {
          bcrypt.compare(
            password,
            dbResult.password,
            function (_err, authResult) {
              if (authResult) {
                req.session.userId = dbResult._id;
                req.session.user = dbResult.username;
                res.json({ user: dbResult.username });
                return;
              }

              res.status(400).send('Invalid credentials');
            }
          );

          return;
        }

        res.status(400).send('Invalid credentials');
      });

    return;
  }

  res.status(400).send('Invalid credentials');
});

auth.get('/logout', function (req, res) {
  req.session.destroy(() => {
    res.sendStatus(200);
  });
});

auth.get('/info', function (req, res) {
  if (req.session.userId === undefined) {
    res.status(400).send('Invalid credentials');
    return;
  }

  res.json({user: req.session.user});
});

export default auth;
