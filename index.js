const express = require("express");
const cors = require("cors");
const contactRoutes = require("./routes/contact.routes");

const PORT = process.env.PORT || 8080;

class Server {
  constructor() {
    this.server = null;
  }

  start() {
    this.server = express();
    this.initMiddlewares();
    this.initRoutes();
    this.listen();
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