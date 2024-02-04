const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env;

const { HttpError } = require("../helpers");
const { User } = require("../models/userModel");

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    next(HttpError(401));
  }

  try {
    const { id } = jwt.verify(token, SECRET_KEY); 

    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      next(HttpError(401));
    }
    if (user.verify === false) {
      throw HttpError(401, "Your account is not verified");
    }
    req.user = user;
    next();
  } catch (err) {
    next(HttpError(401));
  }
}

module.exports = authenticate;