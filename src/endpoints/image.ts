import express from 'express';
import fs from 'fs';

/* eslint new-cap: ["error", { "capIsNewExceptions": ["Router"] }] */
const image = express.Router();

image.get('/image/:imageId', function(req, res) {
  const imageId = parseInt(req.params.imageId);
  const filename = imageId + '.jpg';

  const img = fs.readFileSync('store/images/files/' + filename);
  res.writeHead(200, {'Content-Type': 'image/jpg'});
  res.end(img, 'binary');
});

export default image;
