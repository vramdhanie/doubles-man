const express = require("express");
const { response } = require("../app");
const router = express.Router();
const bodyParser = express.urlencoded({ extended: true });
const fetch = require("node-fetch");
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
      // use the data
      res.render("locations", { cities: data });
    });
});

router.get("/form", function (req, res) {
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
      res.render("locationVendorList", { vendors: data });
    });
});

router.post("/", bodyParser, function (req, res) {
  // get the location name from the
  const { location_name, token } = req.body;

  // recaptcha validate
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${token}`;
  fetch(url, { method: "POST" })
    .then((res) => res.json())
    .then((token_response) => {
      if (!token_response.success || token_response.score < 0.7) {
        res.render("add_location_form", { error: "Sorry, you are not human" });
      }

      // validate the location
      // if the location is blank
      if (!location_name.trim()) {
        return res.render("add_location_form", {
          error: "Please enter a name",
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
