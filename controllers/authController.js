const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const crypto = require("node:crypto");

const { HttpError, ctrlWrapper, sendEmail } = require("../helpers");
const { User } = require("../models/userModel");
const { SECRET_KEY } = process.env;
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  // ВИНЕСТИ ПОСИЛАННЯ В ENV

  const verificationToken = crypto.randomUUID();

  await sendEmail({
    to: email,
    from: "sorokolietov@gmail.com",
    subject: "Welcome to Contacts App",
    html: `To confirm your registration please click on the <a href="http://localhost:3000/api/users/verify/${verificationToken}">link</a>`,
    text: `To confirm your registration please click on the link http://localhost:3000/api/users/verify/${verificationToken}`,
  });

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  if (user.verify === false) {
    throw HttpError(401, "Your account is not verified");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  const { subscription } = user;
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: { email, subscription },
  });
};

const getCurrent = (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({ message: "Logout successfully" });
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;

  const updatedUser = await User.findByIdAndUpdate(_id, { subscription });
  if (updatedUser === null) {
    throw HttpError(404, "Not found");
  }
  res.send({ message: `Subscription updated successfully to ${subscription}` });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;

  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);

  const pic = await Jimp.read(tempUpload);
  await pic.scaleToFit(250, 250).writeAsync(tempUpload); // save

  await fs.rename(tempUpload, resultUpload);

  const avatarURL = path.join("avatars", filename);

  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (user === null) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user.id, {
    verify: true,
    verificationToken: null,
  });

  res.send({ message: "Verification successful" });
};

const repeatVerify = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user === null) {
    throw HttpError(404, "Not found");
  }

  if (user.verify === true) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verificationToken = user.verificationToken;

  await sendEmail({
    to: email,
    from: "sorokolietov@gmail.com",
    subject: "Welcome to Contacts App",
    html: `To confirm your registration please click on the <a href="http://localhost:3000/api/users/verify/${verificationToken}">link</a>`,
    text: `To confirm your registration please click on the link http://localhost:3000/api/users/verify/${verificationToken}`,
  });

  res.send({ message: "Verification email sent" });
}

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
  verify: ctrlWrapper(verify),
  repeatVerify: ctrlWrapper(repeatVerify),
};
