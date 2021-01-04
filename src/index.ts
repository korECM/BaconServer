import { app, appContainer } from './app';
import DB from './DB';
import { createServer } from 'http';
import "reflect-metadata";

(async () => {
  if (process.env.NODE_ENV !== 'test') {
    await DB.connect();

    createServer(app).listen(app.get('port'), () => {
      console.log(`서버 Port : ${app.get('port')}에서 시작`);
    });
  }
})();

export { app, appContainer };