function checkRequiredParameters(parameters) {
  const numberParameters = parameters.length;
  let empty = 0;
  for (let i = 0; i < numberParameters; i++) {
    if (!parameters[i]) {
      empty += 1;
    }
  }

  if (empty > 0) {
    return { validation: false, statusCode: 400, message: '값을 모두 입력해 주세요' };
  } else {
    return { validation: true };
  }
}

module.exports = checkRequiredParameters;
