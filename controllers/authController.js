const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { HttpError, ctrlWrapper } = require('../helpers');
const { User } = require('../models/userModel');
const { SECRET_KEY } = process.env

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email})

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hashPassword });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  })
}

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  const passwordCompare = await bcrypt.compare(password, user.password)
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid")
  }

  const payload = {
    id: user._id,
  }

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });
  const { subscription } = user;
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: { email, subscription },
  })
}

const getCurrent = (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
}

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({ message: "Logout successfully" });
}

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;

  const updatedUser = await User.findByIdAndUpdate(_id, { subscription });
  if (updatedUser === null) {
    throw HttpError(404, "Not found");
  }
  res.send({message: `Subscription updated successfully to ${subscription}`});
}

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
}