const express = require("express");
const router = express.Router();
const bodyParser = express.urlencoded({ extended: true });
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const {
  RECAPTCHA_SECRET,
  RECAPTCHA_SITE_KEY,
  JWT_SECRET,
} = require("../config");

router.post("/login", bodyParser, (req, res) => {
  const { email, password, token } = req.body;

  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${token}`;
  fetch(url, { method: "POST" })
    .then((res) => res.json())
    .then((token_response) => {
      // check if the response is success and also the score should be
      // above some threshold, e.g 0.7
      if (!token_response.success || token_response.score < 0.7) {
        // if not show an error message
        return res.render("index", {
          error: { captcha: "Sorry, you are not human" },
          SITE_KEY: RECAPTCHA_SITE_KEY,
          show: "login",
          ...req.body,
        });
      }

      if (!email.trim()) {
        return res.render("index", {
          error: { email: "Please enter an email address" },
          SITE_KEY: RECAPTCHA_SITE_KEY,
          show: "login",
          ...req.body,
        });
      }

      if (!password.trim()) {
        return res.render("index", {
          error: { password: "Please enter a password" },
          SITE_KEY: RECAPTCHA_SITE_KEY,
          show: "login",
          ...req.body,
        });
      }

      // get the database connection
      const knex = req.app.get("db");

      // get a count of the number of times
      // this email is in the database
      return knex
        .select("*")
        .where("email", email)
        .from("users")
        .first()
        .then((user) => {
          if (!user) {
            return res.render("index", {
              error: { email: "Incorrect email or password" },
              SITE_KEY: RECAPTCHA_SITE_KEY,
              show: "login",
              ...req.body,
            });
          }
          // compare passwords now
          return bcrypt
            .compare(password, user.password)
            .then((compareMatch) => {
              if (!compareMatch) {
                return res.render("index", {
                  error: { email: "Incorrect email or password" },
                  SITE_KEY: RECAPTCHA_SITE_KEY,
                  show: "login",
                  ...req.body,
                });
              }
              const subject = email;
              const payload = { id: user.id };
              return jwt.sign(payload, JWT_SECRET, {
                subject,
                algorithm: "HS256",
              });
            })
            .then((authToken) => {
              // ADDING THE COOKIE SETTING CODE HERE
              res.cookie("token", authToken, {
                expires: new Date(Date.now() + 900000),
              });
              return res.render("login_success");
            });
        });
    });
});

module.exports = router;
