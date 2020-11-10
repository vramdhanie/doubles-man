const express = require("express");
const router = express.Router();
const bodyParser = express.urlencoded({ extended: true });
const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");

const { RECAPTCHA_SECRET, RECAPTCHA_SITE_KEY } = require("../config");

router.post("/register", bodyParser, function (req, res) {
  const { email, password, repeat_password, name, token } = req.body;

  // recaptcha validation
  // this is a call to Google's server
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${token}`;
  fetch(url, { method: "POST" })
    .then((res) => res.json())
    .then((token_response) => {
      // check if the response is success and also the score should be
      // above some threshold, e.g 0.7
      if (!token_response.success || token_response.score < 0.7) {
        // if not show an error message
        res.render("index", {
          error: { captcha: "Sorry, you are not human" },
          SITE_KEY: RECAPTCHA_SITE_KEY,
          show: "register",
          ...req.body,
        });
      }

      if (!email.trim()) {
        return res.render("index", {
          error: { email: "Please enter an email address" },
          SITE_KEY: RECAPTCHA_SITE_KEY,
          show: "register",
          ...req.body,
        });
      }

      if (!password.trim()) {
        return res.render("index", {
          error: { password: "Please enter a password" },
          SITE_KEY: RECAPTCHA_SITE_KEY,
          show: "register",
          ...req.body,
        });
      }

      if (!repeat_password.trim()) {
        return res.render("index", {
          error: { repeat_password: "Please re-enter the password" },
          SITE_KEY: RECAPTCHA_SITE_KEY,
          show: "register",
          ...req.body,
        });
      }

      if (password !== repeat_password) {
        return res.render("index", {
          error: { repeat_password: "Passwords do not match" },
          SITE_KEY: RECAPTCHA_SITE_KEY,
          show: "register",
          ...req.body,
        });
      }

      if (!name.trim()) {
        return res.render("index", {
          error: { name: "Please enter a name" },
          SITE_KEY: RECAPTCHA_SITE_KEY,
          show: "register",
          ...req.body,
        });
      }

      // get the database connection
      const knex = req.app.get("db");

      // get a count of the number of times
      // this email is in the database
      return knex
        .count("email")
        .where("email", email)
        .from("users")
        .then((result) => {
          // if the email appears more than 0 times then it is a duplicate
          if (+result[0].count !== 0) {
            return res.render("index", {
              error: { email: "That email address is already in use" },
              SITE_KEY: RECAPTCHA_SITE_KEY,
              show: "register",
              ...req.body,
            });
          }
          // otherwise insert new user into the database

          // encrypt the password
          return bcrypt.hash(password, 12).then((hashPassword) => {
            return knex
              .returning("id")
              .insert({ email, password: hashPassword, full_name: name })
              .into("users")
              .then((id) => {
                return res.render("register_success", {
                  id: id,
                  name: name,
                });
              });
          });
        });
    });
});

module.exports = router;
