const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: String,
  password: String,
  avatarURL: String,
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  token: String,
  verificationToken: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
