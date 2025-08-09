function notFound(_req, res, _next) {
  res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Route not found' } })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler(err, _req, res, _next) {
  const status = err.status || 500
  const code = err.code || (status === 400 ? 'BAD_REQUEST' : status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR')
  const message = err.message || 'Unexpected error'
  const details = err.details
  res.status(status).json({ ok: false, error: { code, message, ...(details ? { details } : {}) } })
}

module.exports = { notFound, handler }
