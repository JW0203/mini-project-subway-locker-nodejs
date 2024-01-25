const HttpException = require('./HttpException');
const UserAuthority = require('../models/enums/UserAuthority');
function authorityConfirmation(authority) {
  return function (req, res, next) {
    const user = req.user;

    if (!user.authority) {
      throw new HttpException(400, '로그인 된 유저의 권한이 설정되어 있지 않습니다.');
      return;
    }
    if (authority === 'both') {
      if (!(user.authority === UserAuthority.USER || user.authority === UserAuthority.ADMIN)) {
        throw new HttpException(401, '접근 권한이 없습니다.');
        return;
      }
    } else {
      if (user.authority !== authority) {
        throw new HttpException(401, '접근 권한이 없습니다.');
        return;
      }
    }
    req.user;
    next();
  };
}

module.exports = authorityConfirmation;
