const jwt = require('jsonwebtoken');
const HttpException = require('./HttpException');

const authenticateToken = (req, res, next) => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new HttpException(400, 'JWT 토큰을 입력해 주세요.');
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
    next();
  });
};

module.exports = authenticateToken;
