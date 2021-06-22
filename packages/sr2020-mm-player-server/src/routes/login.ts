import { Router } from 'express';
import * as jwt from "jsonwebtoken";
import { getUserTokenData, getCharacterModelData } from '../api';
import { JWT_SECRET } from '../constants';

import { 
  validateAuthRequest, 
  validateTokenData, 
  validateTokenRequestBody 
} from '../types';

const router = Router();

router.get('/api/isLoggedIn', (req, res, next) => {
  // console.log('req.cookies', req.cookies);
  const { mm_token } = req.cookies;
  console.log('isLoggedIn', mm_token);
  if (mm_token === undefined) {
    res.status(401).end();
  } else {
    res.status(200).end();
  }
});

router.post('/api/login', async (req, res) => {
  console.log('/api/login', req.body);

  const authRequest = req.body;
  if (!validateAuthRequest(authRequest)) {
    res.status(400).send(`auth request verification failed ${JSON.stringify(authRequest)} ${JSON.stringify(validateAuthRequest.errors)}`);
    return;
  }

  const res2 = await getUserTokenData(authRequest.username, authRequest.password);
  if (res2.status === 200) {
    const data = await res2.json();
    if (!validateTokenRequestBody(data)) {
      res.status(500).send(`User token data not valid ${JSON.stringify(validateTokenRequestBody.errors)}`);
      return;
    }

    const { api_key } = data;

    // console.log('test call', res2.status, data);
  
    try {
      const parsedToken = jwt.verify(api_key, JWT_SECRET);
      console.log('parsedToken', parsedToken);
      if (!validateTokenData(parsedToken)) {
        res.status(500).send(`parsedToken verification failed ${JSON.stringify(parsedToken)} ${JSON.stringify(validateTokenData.errors)}`);
        return;
      }

      // const data = await getCharacterModelData(authRequest.username);
      // console.log(data);

      res.cookie('mm_token', api_key, { httpOnly: true });
      const { body } = req;
      console.log(body);
      res.json(parsedToken);
    } catch (err) {
      res.status(500).send(`User token verification failed ${JSON.stringify(err)}`);
      return;
    }
  } else {
    const text = await res2.text();
    res.status(res2.status).send(`User unathorized: ${text}`);
  }
});

router.post('/api/logout', (req, res) => {
  console.log('/api/logout');
  // req.logOut();
  res.status(200).clearCookie('mm_token', {
    // path: '/',
    // secure: false,
    httpOnly: true,
    // domain: 'place.your.domain.name.here.com',
    // sameSite: true,
  });
  res.end();
  // req.session.destroy(function (err) {
  //   res.redirect('/');
  // });
});

export const loginRouter = router;



