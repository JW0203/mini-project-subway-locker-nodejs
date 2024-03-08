const asyncHandler = (body) => {
  return async (req, res, next) => {
    try {
      await body(req, res);
    } catch (err) {
      next(err);
    }
  };
};

module.exports = asyncHandler;
