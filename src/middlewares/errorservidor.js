export const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    status: 'error',
    error: err.message || 'Error interno del servidor'
  });
};
