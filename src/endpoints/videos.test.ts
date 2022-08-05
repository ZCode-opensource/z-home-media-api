import app, {redisClient} from '../app';
import supertest from 'supertest';
import * as mongodb from '../db/mongo.js';
import fs from 'fs';

let cookies: string;
let videoId: string;

beforeAll(async () => {
  await mongodb.connect();

  let response = await supertest(app)
      .post('/api/auth')
      .send({
        user: 'admin',
        password: 'admin',
      });

  expect(response.headers).toHaveProperty('set-cookie');
  cookies = response.headers['set-cookie'].pop().split(';')[0];

  response = await supertest(app)
      .post('/api/video/upload')
      .set('Cookie', [cookies])
      .set('content-type', 'multipart/form-data')
      .attach(
          'myFile',
          fs.readFileSync(
              `${__dirname}/../../tests_resources/test_video.mkv`,
          ),
          'test_video.mkv',
      ).expect(200);
  expect(response.type).toEqual('application/json');
  expect(response.body).toEqual(
      {
        'status': true,
        'videoId': expect.any(String),
        'message': 'File was uploaded',
      },
  );

  videoId = response.body.videoId;
});

describe('Test get videos without page', () => {
  it('should return a 200 status with a json response', async () => {
    const response = await supertest(app)
        .get(`/api/videos`)
        .set('Cookie', [cookies])
        .expect(200);
    expect(response.type).toEqual('application/json');
    expect(response.body[0]).toEqual({
      'items': expect.any(Array),
      'total': expect.any(Array),
    });
  });
});

describe('Test get videos with page', () => {
  it('should return a 200 status with a json response', async () => {
    const response = await supertest(app)
        .get(`/api/videos`)
        .set('Cookie', [cookies])
        .query({page: 1})
        .expect(200);
    expect(response.type).toEqual('application/json');
    expect(response.body[0]).toEqual({
      'items': expect.any(Array),
      'total': expect.any(Array),
    });
  });
});

describe('Test get video thumb with invalid id', () => {
  it('should return a 400 status', async () => {
    const response = await supertest(app)
        .get(`/api/videos/thumb/wrong`)
        .set('Cookie', [cookies])
        .expect(400);
    expect((response.error as any).text).toEqual('Invalid video id');
  });
});

describe('Test get video thumb with non existent id', () => {
  it('should return a 404 status', async () => {
    const response = await supertest(app)
        .get(`/api/videos/thumb/aaaaaa77bcf86cd799439011`)
        .set('Cookie', [cookies])
        .expect(404);
    expect((response.error as any).text).toEqual('Video not found');
  });
});

describe('Test get video thumb with existent id', () => {
  it('should return a 404 status', async () => {
    const response = await supertest(app)
        .get(`/api/videos/thumb/${videoId}`)
        .set('Cookie', [cookies])
        .expect(200);
    expect(response.body).toEqual(expect.any(Buffer));
  });
});

afterAll(async () => {
  await mongodb.disconnect();
  await redisClient.disconnect();
});
