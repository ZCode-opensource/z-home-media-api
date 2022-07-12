import express from 'express';
import fs from 'fs';
import { getDb } from '../db/mongo';

const videos = express.Router();

videos.get('/', function (_req, res) {
  const db = getDb();

  db.collection('videos')
    .find({})
    .toArray(function (err: any, result: any) {
      if (err) {
        res.status(400).send('Error fetching listings!');
      } else {
        res.json({items: result});
      }
    });
});

videos.get('/thumb/:videoId', function (req, res) {
  const videoId = req.params.videoId;
  let filename = videoId;

  var img = fs.readFileSync('store/videos/thumbs/' + filename);
  res.writeHead(200, { 'Content-Type': 'image/png' });
  res.end(img, 'binary');
});

export default videos;
