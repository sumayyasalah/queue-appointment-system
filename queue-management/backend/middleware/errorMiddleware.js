const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (err.name === 'ValidationError' || err.name === 'CastError') statusCode = 400;
  if (err.code === 11000) statusCode = 409;
  res.status(statusCode).json({
    message: err.code === 11000 ? 'A record with this value already exists' : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
