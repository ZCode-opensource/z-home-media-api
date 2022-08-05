import express from 'express';
import env from '../utils/env.js';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import {spawn} from 'child_process';
import {ObjectId} from 'mongodb';
import {getDb} from '../db/mongo.js';
import logger from '../utils/logger.js';

/* eslint new-cap: ["error", { "capIsNewExceptions": ["Router"] }] */
const video = express.Router();

video.get('/:videoId/info', function(req, res) {
  const db = getDb();

  const videoId = req.params.videoId;

  db.collection('videos')
      .findOne({_id: new ObjectId(videoId)})
      .then((result: any) => {
        res.json(result);
      });
});

video.get('/:videoId', function(req, res) {
  const range = req.headers.range;

  if (range === undefined) {
    res.status(400).send('Requires Range header');
    return;
  }

  const db = getDb();
  const videoId = req.params.videoId;

  db.collection('videos')
      .findOne({_id: new ObjectId(videoId)})
      .then((result: any) => {
        const videoPath =
            `${env.STORAGE}/videos${result.path}/videos/${videoId}`;

        const videoSize = fs.statSync(videoPath).size;
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
        const videoStream = fs.createReadStream(videoPath, {start, end});
        videoStream.pipe(res);
      });
});

video.post('/upload', function(req, res) {
  if (req.files !== undefined) {
    try {
      const video = req.files.myFile as fileUpload.UploadedFile;
      const tempDir = env.STORAGE + '/temp';

      /** Check if temp dir exists, if it doesn't, create one */
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const timestamp = new Date();

      const year = timestamp.getUTCFullYear();
      const month = timestamp.getUTCMonth() + 1;
      const day = timestamp.getUTCDate();

      const relPath = `/${year}/${month}/${day}`;
      const path = `${env.STORAGE}/videos${relPath}`;

      if (!fs.existsSync(path + '/videos')) {
        fs.mkdirSync(path + '/videos', {recursive: true});
      }
      if (!fs.existsSync(path + '/thumbs')) fs.mkdirSync(path + '/thumbs');

      const db = getDb();

      video.mv(tempDir + '/' + video.name).then(() => {
        const args = [
          '-v',
          'quiet',
          '-print_format',
          'json',
          '-show_streams',
          '-select_streams',
          'v:0',
          tempDir + '/' + video.name,
        ];

        const proc = spawn(env.FFPROBE as string, args);
        let output = '';

        proc.stdout.setEncoding('utf8');
        proc.stdout.on('data', function(data) {
          output += data;
        });

        proc.on('close', function() {
          const json = JSON.parse(output);

          if (Object.entries(json).length === 0) {
            res.status(400).send('File not supported.');
            return;
          }

          const fpsArray = json.streams[0].avg_frame_rate.split('/');
          const fps = parseInt(fpsArray[0]) / parseInt(fpsArray[1]);

          db.collection('videos')
              .insertOne({
                name: video.name,
                path: relPath,
                ts: timestamp,
                width: json.streams[0].width,
                height: json.streams[0].height,
                fps: fps.toFixed(2),
                duration: json.streams[0].duration,
                bitrate: json.streams[0].bit_rate,
                status: 1,
              })
              .then((object: any) => {
                const videoId = object.insertedId.toString();

                if (video.size < 5000000) {
                  encodeVideo(tempDir, video.name, videoId, path).then(() => {
                    logger.debug('encoding finished');

                    fs.unlinkSync(tempDir + '/' + video.name);
                    logger.debug('Temp file removed');

                    createThumbnail(videoId, path).then(() => {
                      logger.debug('thumbnail created');

                      db.collection('videos')
                          .updateOne(
                              {_id: new ObjectId(videoId)},
                              {$set: {status: 2}},
                          )
                          .then(() => {
                            logger.debug('Video status changed to 2');

                            res.send({
                              status: true,
                              videoId: videoId,
                              message: 'File was uploaded',
                            });
                          });
                    }).catch((err) => {
                      logger.error(err);
                    });

                    return;
                  }).catch((err) => {
                    logger.debug(err);
                    res.status(500).send(err);
                  });

                  return;
                } else {
                  encodeVideo(tempDir, video.name, videoId, path).then(() => {
                    logger.debug('encoding finished');

                    fs.unlinkSync(tempDir + '/' + video.name);
                    logger.debug('Temp file removed');

                    createThumbnail(videoId, path).then(() => {
                      logger.debug('thumbnail created');

                      db.collection('videos')
                          .updateOne(
                              {_id: new ObjectId(videoId)},
                              {$set: {status: 2}},
                          )
                          .then(() => {
                            logger.debug('Video status changed to 2');
                          });
                    }).catch((err) => {
                      logger.error(err);
                    });
                  }).catch((err) => {
                    logger.error(err);
                  });

                  res.send({
                    status: true,
                    videoId: videoId,
                    message: 'File was uploaded',
                  });
                }
              });
        });
      });

      return;
    } catch (err) {
      res.status(500).send(err);
      return;
    }
  }

  res.status(400).send('No attachments found');
});

/**
 *
 * @param {string} tempDir Temporary directory where file is
 * @param {string} filename Video filename
 * @param {string} videoId Id of video in the database
 * @param {string} path Path where the output file should go
 */
async function encodeVideo(
    tempDir: string,
    filename: string,
    videoId: string,
    path: string,
) {
  logger.debug('encoding video...');
  const args = [
    '-y',
    '-i',
    tempDir + '/' + filename,
    '-codec:a',
    'aac',
    '-b:a',
    '44.1k',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '22',
    '-f',
    'mp4',
    path + '/videos/' + videoId,
  ];

  const proc = spawn(env.FFMPEG as string, args);
  let stderr = '';

  // For some reason ffmpeg outputs always to stderr
  for await (const chunk of proc.stderr) {
    stderr += chunk;
  }

  const promise = new Promise((resolve, reject) => {
    proc.on('error', reject);

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stderr);
      } else {
        reject(stderr);
      }
    });
  });

  return promise;
}

/**
 *
 * @param {string} videoId Id of video in the database
 * @param {string} path path where to store thumbnail
 */
async function createThumbnail(videoId: string, path: string) {
  logger.debug('creating thumbnail');

  const args = [
    '-y',
    '-i',
    path + '/videos/' + videoId,
    '-vf',
    'thumbnail,scale=320:180:force_original_aspect_ratio=increase,crop=320:180',
    '-frames:v',
    '1',
    '-f',
    'image2',
    '-c',
    'png',
    path + '/thumbs/' + videoId,
  ];

  const proc = spawn(env.FFMPEG as string, args);
  let stderr = '';

  for await (const chunk of proc.stderr) {
    stderr += chunk;
  }

  const promise = new Promise((resolve, reject) => {
    proc.on('error', reject);

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stderr);
      } else {
        reject(stderr);
      }
    });
  });

  return promise;
}

export default video;
