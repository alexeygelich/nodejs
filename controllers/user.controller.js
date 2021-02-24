const { promises: fsPromises } = require("fs");

const path = require("path");
const dotenv = require("dotenv");
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const multer = require("multer");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const jwt = require("jsonwebtoken");
const Avatar = require("avatar-builder");
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");

const User = require("../models/User");

dotenv.config();

const PORT = process.env.PORT || 8080;
const domain = `http://localhost:${PORT}/`;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "tmp/");
  },
  filename: function (req, file, cb) {
    const { ext } = path.parse(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

async function generateAvatar(req, res, next) {
  const name = Date.now();
  try {
    const avatar = await Avatar.builder(
      Avatar.Image.margin(
        Avatar.Image.roundedRectMask(
          Avatar.Image.compose(
            Avatar.Image.randomFillStyle(),
            Avatar.Image.shadow(Avatar.Image.margin(Avatar.Image.cat(), 8), {
              blur: 5,
              offsetX: 2.5,
              offsetY: -2.5,
              color: "rgba(0,0,0,0.75)",
            })
          ),
          32
        ),
        8
      ),
      128,
      128,
      { cache: Avatar.Cache.compose(Avatar.Cache.lru(), Avatar.Cache.folder("./tmp")) }
    );

    avatar.create(name);
    req.avatarPath = `tmp/${name}.png`;
    next();
  } catch (error) {
    console.log("error create avatar", error);
  }
}

async function createUser(req, res) {
  const avatarURL = req.avatarURL;
  const { body } = req;

  try {
    const hashedPassword = await bcryptjs.hash(body.password, 14);
    const verificationToken = uuidv4();

    const user = await User.create({
      ...body,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    });
    const { email, subscription } = user;

    sendVerificationEmail(email, verificationToken);

    res.status(201).json({ email, subscription, avatarURL });
  } catch (error) {
    res.status(400).send(error);
  }
}

async function verifyUser(req, res) {
  const {
    params: { verificationToken },
  } = req;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    return res.status(404).json("User not found");
  }

  user.verificationToken = undefined;

  try {
    await user.save();
    res.status(200).send();
  } catch (error) {
    console.log("error", error);
  }
}

async function sendVerificationEmail(email, token) {
  const msg = {
    to: email, // Change to your recipient
    from: "alexeygelich@gmail.com", // Change to your verified sender
    subject: "Please verify your account",
    html: `Welcom to our application. To verify your account click by <a href="${domain}auth/verify/${token}">Link</a>`,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.log("error", error);
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
    return res.status(401).send("Subscription is Wrong");
  }
  try {
    await User.updateOne({ email }, { subscription });
    res.status(200).json({ email, subscription });
  } catch (error) {
    res.status(401).json(error);
  }
}

async function updateAvatarUser(req, res) {
  const { email, avatarURL: oldAvatarUrl } = req.user;
  const { avatarURL } = req;
  try {
    await User.updateOne({ email }, { avatarURL });
    res.status(200).json({ avatarURL });
  } catch (error) {
    return res.status(401).json(error);
  }
  const imgForDelete = "public/" + oldAvatarUrl.replace(domain, "");
  deleteFile(imgForDelete);
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

async function minifyImage(req, res, next) {
  let path = null;
  if (req.file) {
    path = req.file.path;
  } else {
    path = req.avatarPath;
  }
  const files = await imagemin([path], {
    destination: "public/images",
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
    progressive: true,
    arithmetic: true,
  });
  req.avatarURL = domain + path.replace("tmp", "images");
  await deleteFile(path);
  next();
}

async function deleteFile(path) {
  try {
    await fsPromises.unlink(path);
  } catch (error) {
    console.log("error", error);
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
  updateAvatarUser,
  upload,
  minifyImage,
  generateAvatar,
  verifyUser,
};
