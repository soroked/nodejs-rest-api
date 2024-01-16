const { HttpError } = require("../helpers");

const missingFields = (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    throw HttpError(400, "missing fields");
  }
  next();
}

module.exports = {
  missingFields,
}