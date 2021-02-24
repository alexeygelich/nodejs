const { Router } = require("express");
const {
  createUser,
  validateEmailPassUser,
  validateUniqueEmail,
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
} = require("../controllers/user.controller");

const router = Router();
router.post("/auth/register", validateEmailPassUser, validateUniqueEmail, generateAvatar, minifyImage, createUser);
router.post("/auth/login", validateEmailPassUser, loginUser);

router.get("/auth/verify/:verificationToken", verifyUser);

router.get("/users/current", authorize, getUser);
router.post("/auth/logout", authorize, logoutUser);
router.patch("/users", authorize, updateSubUser);
router.patch("/users/avatars", authorize, upload.single("avatar"), minifyImage, updateAvatarUser);

module.exports = router;
