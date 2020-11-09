const express = require("express");
const router = express.Router();
const { RECAPTCHA_SITE_KEY } = require("../config");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Doubles Man!",
    SITE_KEY: RECAPTCHA_SITE_KEY,
  });
});

module.exports = router;
