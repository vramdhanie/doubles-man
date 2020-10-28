const express = require("express");
const { response } = require("../app");
const router = express.Router();
const bodyParser = express.urlencoded({ extended: true });

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
  res.render("add_location_form");
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
  const { location_name } = req.body;

  // validate the location
  // skipping validation for now

  // insert new location into the database
  const knex = req.app.get("db");
  return knex
    .returning("id")
    .insert({ name: location_name })
    .into("location")
    .then((id) => {
      res.render("add_location_success", { id: id, name: location_name });
    });
});

module.exports = router;
