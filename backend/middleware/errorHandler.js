export function notFound(req, res, next) {
  res.status(404)
  next(new Error(`Route not found - ${req.originalUrl}`))
}

export function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
  let message = err.message

  // SQLite unique constraint violation -> friendlier message + 400 instead of 500
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    statusCode = 400
    message = 'A record with that value already exists'
  }

  // SQLite foreign-key violation -> e.g. trying to delete a user who
  // already has reports/alerts linked to them
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || err.code === 'SQLITE_CONSTRAINT_TRIGGER') {
    statusCode = 400
    message = "This can't be deleted because other records still reference it. Try deactivating it instead."
  }

  // SQLite CHECK constraint violation (e.g. bad status/role/priority value)
  if (err.code === 'SQLITE_CONSTRAINT_CHECK') {
    statusCode = 400
    message = 'Invalid value for one of the fields'
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}
