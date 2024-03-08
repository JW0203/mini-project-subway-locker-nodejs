const HttpException = require('./HttpException');

function authorityConfirmation(requiredAuthorityArray) {
  return function (req, res, next) {
    const { user } = req;
    if (!user.authority) {
      throw new HttpException(500, '로그인 된 유저의 권한이 설정되어 있지 않습니다.');
      return;
    }
    if (!requiredAuthorityArray.includes(user.authority)) {
      throw new HttpException(403, '접근 권한이 없습니다.');
      return;
    }
    req.user;
    next();
  };
}

module.exports = authorityConfirmation;
