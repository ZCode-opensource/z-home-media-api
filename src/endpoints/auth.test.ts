import app, {redisClient} from '../app';
import supertest from 'supertest';
import * as mongodb from '../db/mongo.js';
// import logger from '../utils/logger.js';

beforeAll(async () => {
  await mongodb.connect();
});

describe('Test auth without credentials', () => {
  it('should return a 400 status code', async () => {
    const response = await supertest(app)
        .post('/api/auth')
        .expect(400);
    expect((response.error as any).text).toEqual('Invalid credentials');
  });
});

describe('Test auth with bad credentials', () => {
  it('It should return a 400 status code', async () => {
    const response = await supertest(app)
        .post('/api/auth')
        .send({
          user: 'bad user',
          password: 'bad password',
        })
        .expect(400);
    expect((response.error as any).text).toEqual('Invalid credentials');
  });
});

describe('Test auth with good credentials', () => {
  it('should return a 200 page with user info', async () => {
    const response = await supertest(app)
        .post('/api/auth')
        .send({
          user: 'admin',
          password: 'admin',
        })
        .expect(200);
    expect(response.type).toEqual('application/json');
    expect(response.body).toEqual({'profile': '1', 'user': 'admin'});
  });
});

describe('Test logged user info when logged out', () => {
  it('should return a 400 status code', async () => {
    const response = await supertest(app)
        .get('/api/auth/info')
        .expect(400);
    expect((response.error as any).text).toEqual('Invalid user');
  });
});

describe('Test get logged user info', () => {
  it('should return a 200 page with user info', async () => {
    let response = await supertest(app)
        .post('/api/auth')
        .send({
          user: 'admin',
          password: 'admin',
        })
        .expect(200);

    expect(response.headers).toHaveProperty('set-cookie');
    const cookies = response.headers['set-cookie'].pop().split(';')[0];

    response = await supertest(app)
        .get('/api/auth/info')
        .set('Cookie', [cookies])
        .expect(200);
    expect(response.type).toEqual('application/json');
    expect(response.body).toEqual({'profile': '1', 'user': 'admin'});
  });
});

afterAll(async () => {
  await mongodb.disconnect();
  await redisClient.disconnect();
});
