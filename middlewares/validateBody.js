const {HttpError} = require('../helpers')

const validateBody = (schema) => {
  return (req, res, next) => {

    const {error} = schema.validate(req.body, { abortEarly: false })

    if (typeof error !== 'undefined') {
      next(HttpError(400, error.message))
    }
    next();
  }
}

module.exports = validateBody