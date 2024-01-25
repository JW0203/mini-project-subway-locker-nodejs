const { User } = require('../models');
const specialCharacters = /[\{\}\[\]\/?,;:|\)*~`!^\-+<>\#$%&\\\=\(\'\"]/g; // @. removed
const emptySpace = /\s/g;
const startEnglishNumber = /^[0-9,a-zA-Z]/;
const emailDomainPattern = /^([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,5}$/;
const PASSWORD_LENGTH_MIN = 8;
const PASSWORD_LENGTH_MAX = 15;

function emailValidation(email) {
  const emailDomain = email.split('@')[1];

  if (email.match(specialCharacters)) {
    return { validation: false, statusCode: 400, message: '입력하신 이메일에 특수문자가 있습니다.' };
  }

  if (email.match(emptySpace)) {
    return { validation: false, statusCode: 400, message: '입력하신 이메일에 공백이 있습니다.' };
  }

  if (!email.match(startEnglishNumber)) {
    return { validation: false, statusCode: 400, message: '이메일의 시작은 숫자나 영어로 되어야 합니다.' };
  }

  if (!emailDomain.match(emailDomainPattern)) {
    return { validation: false, statusCode: 400, message: '입력한 이메일의 도메인 부분을 다시 확인 해주세요.' };
  }
  return { validation: true };
}

function passwordValidation(password) {
  if (password.length < PASSWORD_LENGTH_MIN || password.length > PASSWORD_LENGTH_MAX) {
    return { validation: false, statusCode: 400, message: '비밀번호는 8자리이상 15이하여야 합니다.' };
  }

  if (password.match(emptySpace)) {
    return { validation: false, statusCode: 400, message: '비밀번호에 공백이 있습니다.' };
  }
  return { validation: true };
}
async function signUpEmailPasswordValidation(email, password) {
  const emailDuplicationCheck = await User.findOne({ where: { email } });
  if (emailDuplicationCheck) {
    return { validation: false, statusCode: 400, message: '입력하신 이메일은 이미 사용 중입니다.' };
  }

  const emailResult = emailValidation(email);
  if (emailResult.validation === false) {
    return emailResult;
  }
  const passwordResult = passwordValidation(password);
  if (passwordResult.validation === false) {
    return passwordResult;
  }

  return { validation: true };
}

module.exports = {
  signUpEmailPasswordValidation,
  emailValidation,
  passwordValidation,
};
