import request from 'supertest';
import { app } from '../../app';
describe('GET /', () => {
  it('200 코드를 반환한다', async () => {
    await request(app).get('/').expect(200);
  });
});
