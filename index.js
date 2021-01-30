const express = require("express");
const fetch = require("node-fetch");
const Joi = require("joi");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();

const API_KEY = process.env.OPEN_WEATHER_API_KEY;

app.use(
  cors({
    origin: "*",
  })
);

app.get("/weather", validateWeatherQueryParams, async (req, res) => {
  const {
    query: { lat, lon },
  } = req;

  const result = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);

  const data = await result.json();
  res.json(data);
});

function validateWeatherQueryParams(req, res, next) {
  const validationRules = Joi.object({
    lat: Joi.string().required(),
    lon: Joi.string().required(),
  });

  const validationResult = validationRules.validate(req.query);

  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }

  next();
}

app.listen(PORT, () => {
  console.log("сервер работает на порту: ", PORT);
});
