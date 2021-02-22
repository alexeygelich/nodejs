const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const contactRoutes = require("./routes/contact.routes");
const userRouters = require("./routes/user.routes");

dotenv.config();

const PORT = process.env.PORT || 8080;

async function connectToDb() {
  try {
    const data = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connection successful");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

function initMiddlewares() {
  server.use(express.json());
  server.use(
    cors({
      origin: "*",
    })
  );
  server.use("/images", express.static("public/images"));
}

function initRoutes() {
  server.use("/contacts", contactRoutes);
  server.use("/", userRouters);
}

function listen() {
  server.listen(PORT, () => {
    console.log("Server is listening on port: ", PORT);
  });
}

function start() {
  server = express();
  initMiddlewares();
  connectToDb();
  initRoutes();
  listen();
}

start();