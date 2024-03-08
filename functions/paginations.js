const HttpException = require('../middleware/HttpException');

async function pagination(page, limit, model, orderingColumn, orderingDirection, excludeAttributes) {
  const column = orderingColumn || 'createdAt';
  const direction = orderingDirection || 'DESC';
  let excludedAttributes = excludeAttributes || ['updatedAt', 'deletedAt'];

  if (!page || !limit) {
    throw new HttpException(400, 'page 와 limit 값을 모두 입력해주세요.');
    return;
  }

  if (!Number.isInteger(page) || page <= 0) {
    throw new HttpException(400, '유효한 page 값을 숫자를 입력해주세요.');
    return;
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new HttpException(400, '유효한 limit 값을 숫자를 입력해주세요.');
    return;
  }

  const offset = limit * (page - 1);
  const count = await model.count();

  const totalPages = Math.ceil(count / limit);
  if (page < 1 || page > totalPages) {
    throw new HttpException(400, `page 범위는 1부터 ${totalPages} 입니다.`);
    return;
  }

  let nextPage;
  if (page + 1 < totalPages) {
    nextPage = page + 1;
  }
  if (page + 1 > totalPages) {
    nextPage = null;
  }

  let previousPage;
  if (page - 1 > 0) {
    previousPage = page - 1;
  }
  if (page - 1 === 0) {
    previousPage = null;
  }

  const items = await model.findAll({
    order: [[column, direction]],
    attributes: { exclude: excludedAttributes },
    limit,
    offset,
  });

  const result = {
    items,
    metadata: {
      totalPages,
      limit,
      offset,
      count,
      previousPage,
      page,
      nextPage,
    },
  };
  return result;
}
module.exports = pagination;
