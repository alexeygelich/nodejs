const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const contactRoutes = require("./routes/contact.routes");

dotenv.config();

const PORT = process.env.PORT || 8080;

class Server {
  constructor() {
    this.server = null;
  }

  start() {
    this.server = express();
    this.initMiddlewares();
    this.connectToDb();
    this.initRoutes();
    this.listen();
  }

  async connectToDb() {
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

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(
      cors({
        origin: "*",
      })
    );
  }

  initRoutes() {
    this.server.use("/contacts", contactRoutes);
  }

  listen() {
    this.server.listen(PORT, () => {
      console.log("Server is listening on port: ", PORT);
    });
  }
}

const server = new Server();

server.start();
