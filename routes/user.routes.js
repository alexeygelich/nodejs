const { Router } = require("express");
const {
  createUser,
  validateEmailPassUser,
  validateUniqueEmail,
  loginUser,
  authorize,
  getUser,
  logoutUser,
  updateSubUser
} = require("../controllers/user.controller");

const router = Router();

router.post("/auth/register", validateEmailPassUser, validateUniqueEmail, createUser);
router.post("/auth/login", validateEmailPassUser, loginUser);
router.get("/users/current", authorize, getUser);
router.post("/auth/logout", authorize, logoutUser);
router.patch("/users", authorize, updateSubUser);

module.exports = router;
