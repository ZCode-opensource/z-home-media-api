import express from 'express';
import fs from 'fs';
import {getDb} from '../db/mongo';

const video = express.Router();

video.get('/:videoId/info', function (req, res) {
  const db = getDb();

  const uuid = req.params.videoId;

  db.collection('videos')
    .findOne({ uuid: uuid })
    .then((result: any) => {
      res.json(result);
    });
});

video.get('/:videoId', function (req, res) {
  let range = req.headers.range;

  if (range === undefined) {
    res.status(400).send('Requires Range header');
    return;
  }

  const videoId = req.params.videoId;
  let filename = videoId;

  const videoPath = 'store/videos/files/' + filename;
  const videoSize = fs.statSync('store/videos/files/' + filename).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

export default video;