import express from 'express';
import fs from 'fs';

const image = express.Router();

image.get('/image/:imageId', function (req, res) {
  const imageId = parseInt(req.params.imageId);
  let filename = imageId + '.jpg';

  var img = fs.readFileSync('store/images/files/' + filename);
  res.writeHead(200, { 'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

export default image;