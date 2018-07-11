import HttpErrors from 'http-errors';
import jswt from 'jsonwebtoken';
import { promisify } from 'util';
import Account from '../../model/account';

const jswtVerify = promisify(jswt.verify);

export default (request, response, next) => {
  if (!request.headers.authorization) return next(new HttpErrors(400, 'BEARER AUTH MIDDLEWARE: no headers auth my duderino'));
  console.log(request.headers.authorization, 'AUTHORIZATION MY HOMIES'); // eslint-disable-line

  const token = request.headers.authorization.split('Bearer ')[1];
  if (!token) return next(new HttpErrors(400, 'BEARER AUTH MIDDLEWARE: no token received madame'));

  return jswtVerify(token, process.env.SECRET_KEY)
    .catch((err) => {
      return Promise.reject(new HttpErrors(400, `BEARER AUTH - JSONWEBTOKEN ERROR ${JSON.stringify(err)}`));
    })
    .then((decryptedToken) => {
      console.log(decryptedToken, 'THIS IS THE TOKEN AFTER DECRYPT BEST BELIEVE'); // eslint-disable-line
      return Account.findOne({ tokenSeed: decryptedToken.tokenSeed });      
    })
    .then((account) => {
      console.log('here', account); // eslint-disable-line
      if (!account) return next(new HttpErrors(400, 'BEARER AUTH- NO ACCOUNT HAS BEEN FOUND MATE'));
      request.account = account;
      return next();
    })
    .catch(next);
};
