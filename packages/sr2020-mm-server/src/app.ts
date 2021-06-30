// const createError = require('http-errors');
import Express from 'express';
import ExpressWs from 'express-ws';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import morganLogger from 'morgan';
import shortid from 'shortid';
import cors from 'cors';
import * as core from 'express-serve-static-core';
import * as jwt from "jsonwebtoken";
import { existsSync } from 'fs';

import { 
  AuthorizedRequest, 
  genericServerConstants, 
  makeGameModel, 
  winstonLogger,
  createLogger
} from 'sr2020-mm-server-event-engine';
import { WebSocketInitClientConfig } from 'sr2020-mm-event-engine';

import { indexRouter } from './routes/index';
import { fileListRouter } from './routes/fileList';
import { fileRouter } from './routes/file';
import { pingRouter } from './routes/ping';
import { usersRouter } from './routes/users';
import { postUserPosition } from './routes/postUserPosition';
import { WebSocketWrapper } from './webSocketWrapper';
import { SseDataSender } from "./sseDataSender";
import { loginRouter } from './routes/login';
import { logoutRouter } from './routes/logout';
import { parseUserData } from './routes/parseUserData';

const logger = createLogger('mainServerApp');

logger.info('process.env.NODE_ENV', process.env.NODE_ENV);

const { gameModel, gameServer } = makeGameModel();

export const app: core.Express = Express();
const wsApp = ExpressWs(app);

// https://medium.com/@alexishevia/using-cors-in-express-cac7e29b005b
app.use(cors());

// app.use(cors({
//   origin: 'http://yourapp.com'
// }));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// @ts-ignore
app.use(morganLogger('dev', { stream: winstonLogger.stream }));
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.get('/ping', pingRouter);

app.use(loginRouter);

app.get('/playerDataSse', (req1, res, next) => {
  const req = req1 as AuthorizedRequest;

  const { mm_token } = req.cookies;
  if (mm_token === undefined) {
    logger.info('playerDataSse connection FAILED: Request has no user token');
    res.status(401).send('Request has no user token');
    return;
  }

  try {
    const parsedToken = jwt.verify(mm_token, genericServerConstants().JWT_SECRET);
    logger.info('parsedToken', parsedToken);

    if (parsedToken !== genericServerConstants().playerServerTokenPayload) {
      logger.info('playerDataSse connection FAILED: token parsing');
      res.status(401).send('Error on token parsing');
      return;
    }
  } catch (err) {
    logger.info('playerDataSse connection FAILED: Error on token parsing');
    res.status(401).send('Error on token parsing');
    return;
  }

  logger.info('playerDataSse connection OK');
  new SseDataSender(req, res, next, logger, gameModel);
});

app.use('/api', parseUserData);

app.use(logoutRouter);

app.get('/api/fileList', fileListRouter);
app.get('/api/file/:name', fileRouter);
app.post('/api/postUserPosition/:characterId', postUserPosition);

// app.all('/characterStates', characterStatesRouter);

wsApp.app.ws('/ws', (ws, req, next) => {
  logger.error('old ws path /ws is not working anymore');
});

wsApp.app.ws('/api/ws', (ws, req, next) => {
  ws.on('message', (msgStr) => {
    // logger.info('msg:', msgStr);
    const msg = JSON.parse(msgStr.toString()) as {message?: string};
    if (msg.message && msg.message === 'initClientConfig') {
      const ip = req.connection.remoteAddress;
      const id = shortid.generate();
      const childLogger = winstonLogger.customChild ? 
        winstonLogger.customChild(winstonLogger, { service: `ws_session_${id}` }) :
        winstonLogger;
      childLogger.info(ip, 'initClientConfig', msgStr);
      new WebSocketWrapper(ws, gameModel, msg as WebSocketInitClientConfig, childLogger);
    }
  });
});

app.use(Express.static(path.join(__dirname, './static')));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  // next(createError(404));
  const indexHtml = path.join(__dirname, './static', '/index.html');
  res.sendFile(indexHtml);
});

// error handler
// @ts-ignore
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.json({ error: err });
});

// export const app = app;

// module.exports = app;
