const { Post } = require('../models');

async function pagination(page, limit) {
  const offset = limit * (page - 1);
  const { count, rows } = await Post.findAndCountAll({
    order: [
      ['id', 'DESC'],
      ['createdAt', 'DESC'],
    ],
    limit,
    offset,
  });
  const totalPages = Math.ceil(count / limit);
  let result;
  result = {
    totalPages,
    offset,
    count,
  };

  return result;
}
module.exports = pagination;
