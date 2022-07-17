import 'dotenv/config';
import express, {Request, Response} from 'express';
import fs from 'fs';
import {ObjectId} from 'mongodb';
import {getDb} from '../db/mongo.js';

/* eslint new-cap: ["error", { "capIsNewExceptions": ["Router"] }] */
const videos = express.Router();

videos.get('/', function(req: Request, res: Response) {
  let page = 1;
  const rpp = 12;
  const db = getDb();

  if (req.query.page !== undefined) {
    page = parseInt(req.query.page as string);
  }

  const skip = (page - 1) * rpp;

  db.collection('videos')
      .aggregate([
        {
          $facet: {
            items: [
              {$match: {status: 2}},
              {$sort: {ts: -1}},
              {$skip: skip},
              {$limit: rpp},
            ],
            total: [{$count: 'count'}],
          },
        },
      ])
      .toArray(function(err: any, result: any) {
        if (err) {
          res.status(400).send('Error fetching listings!');
        } else {
          res.json(result);
        }
      });
});

videos.get('/thumb/:videoId', function(req: Request, res: Response) {
  const videoId = req.params.videoId;
  const db = getDb();

  db.collection('videos')
      .findOne({_id: new ObjectId(videoId)})
      .then((result: any) => {
        const img = fs.readFileSync(
            `${process.env.STORAGE}/videos${result.path}/thumbs/${videoId}`,
        );
        res.writeHead(200, {'Content-Type': 'image/png'});
        res.end(img, 'binary');
      });
});

export default videos;
