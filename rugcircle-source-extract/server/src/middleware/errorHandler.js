export function errorHandler(err, _req, res) {
  console.error(err)
  const status = err.statusCode || 500
  res.status(status).json({
    ok: false,
    message: status >= 500 ? 'Internal server error' : err.message,
  })
}

