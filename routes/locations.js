const express = require("express");
const router = express.Router();

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

  // code to get a specific location
});

module.exports = router;
