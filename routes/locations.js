const express = require("express");
const { response } = require("../app");
const router = express.Router();
const bodyParser = express.urlencoded({ extended: true });
// we will use this package to make an HTTP call
// to the reCaptcha API
const fetch = require("node-fetch");
//get the environment variables
const { RECAPTCHA_SECRET, RECAPTCHA_SITE_KEY } = require("../config");

/* Create an end point function for GET /locations */
router.get("/", function (req, res) {
  // 1. query the database for a full list of  locations
  // 2. send those locations to the view
  const knex = req.app.get("db");
  // knex always returns a promise
  return knex
    .select("name", "id")
    .from("location")
    .then((data) => {
      // maybe process the data
      // use the data
      res.render("locations", { cities: data });
    });
});

router.get("/form", function (req, res) {
  // pass the site_key to the form
  res.render("add_location_form", { SITE_KEY: RECAPTCHA_SITE_KEY });
});

router.get("/:id", function (req, res) {
  const { id } = req.params;
  const knex = req.app.get("db");
  return knex
    .select("id", "name", "description", "location", "rating")
    .from("vendor")
    .where("location", id)
    .then((data) => {
      res.render("locationVendorList", { vendors: data, location: id });
    });
});

router.post("/", bodyParser, function (req, res) {
  // get the location name from the
  const { location_name, token } = req.body;

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
        res.render("add_location_form", {
          error: "Sorry, you are not human",
          SITE_KEY: RECAPTCHA_SITE_KEY,
        });
      }

      // validate the location
      // if the location is blank
      if (!location_name.trim()) {
        return res.render("add_location_form", {
          error: "Please enter a name",
          SITE_KEY: RECAPTCHA_SITE_KEY,
        });
      }

      // get the database connection
      const knex = req.app.get("db");

      // get a count of the number of times
      // this name is in the database
      return knex
        .count("name")
        .where("name", location_name)
        .from("location")
        .then((result) => {
          // if the name appears more than 0 times then it is a duplicate
          if (+result[0].count !== 0) {
            return res.render("add_location_form", {
              error: "That location already exists",
              SITE_KEY: RECAPTCHA_SITE_KEY,
            });
          }
          // otherwise insert new location into the database
          return knex
            .returning("id")
            .insert({ name: location_name })
            .into("location")
            .then((id) => {
              res.render("add_location_success", {
                id: id,
                name: location_name,
              });
            });
        });
    });
});

module.exports = router;
