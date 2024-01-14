const jwt = require('jsonwebtoken');
const HttpException = require('./HttpException');

const authenticateToken = (req, res, next) => {
  const autherHeader = req.headers.authorization;
  const token = autherHeader && autherHeader.split(' ')[1];

  if (!token) {
    throw new HttpException(400, 'Header에 JWT 토큰을 넣어야 합니다.');
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err.message);
      if (err.message === 'jwt expired') {
        throw new HttpException(400, '토큰 기한이 만료되었습니다.');
        return;
      }
      throw new HttpException(400, '잘못된 토큰입니다.');
      return;
    }
    req.user = user;
    req.token = token;
    next();
  });
};

module.exports = authenticateToken;
