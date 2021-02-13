const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

async function createUser(req, res) {
  const { body } = req;
  try {
    const hashedPassword = await bcryptjs.hash(body.password, 14);
    const user = await User.create({
      ...body,
      password: hashedPassword,
    });
    const { email, subscription } = user;
    res.status(201).json({ email, subscription });
  } catch (error) {
    res.status(400).send(error);
  }
}

async function loginUser(req, res) {
  const {
    body: { email, password },
  } = req;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET
  );

  try {
    await User.updateOne({ email }, { token });
    res.status(200).json({ token, user: { email: user.email, subscription: user.subscription } });
  } catch (error) {
    res.status(401).json(error);
  }
}

async function getUser(req, res) {
  const { email, subscription } = req.user;
  res.status(200).json({ email, subscription });
}

async function logoutUser(req, res) {
  const { email } = req.user;
  try {
    await User.updateOne({ email }, { token: null });
    res.status(204);
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
}

async function updateSubUser(req, res) {
  const { email } = req.user;
  const {
    body: { subscription },
  } = req;

  if (!["free", "pro", "premium"].includes(subscription)) {
    return res.status(400).send("Subscription is Wrong");
  }

  try {
    await User.updateOne({ email }, { subscription });
    res.status(200).json({ email, subscription });
  } catch (error) {
    res.status(400).json(error);
  }
}

async function validateEmailPassUser(req, res, next) {
  const { body } = req;
  const validationRules = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const validationResult = validationRules.validate(body);

  if (validationResult.error) {
    return res.status(400).json({ message: "Error: email and password are required!" });
  }

  next();
}

async function validateUniqueEmail(req, res, next) {
  const {
    body: { email },
  } = req;

  const findEmail = await User.findOne({ email });

  if (findEmail) {
    return res.status(409).json({ message: "Email in use" });
  }

  next();
}

async function authorize(req, res, next) {
  const authorizationHeader = req.get("Authorization");
  if (!authorizationHeader) {
    return res.status(401).json({ message: "Not authorized" });
  }
  const token = authorizationHeader.replace("Bearer ", "");

  try {
    const payload = await jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = payload;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
}

module.exports = {
  validateEmailPassUser,
  validateUniqueEmail,
  createUser,
  loginUser,
  authorize,
  getUser,
  logoutUser,
  updateSubUser,
};
