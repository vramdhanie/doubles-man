// Server side Vendor routes
const express = require("express");
const router = express.Router();
const bodyParser = express.urlencoded({ extended: true });

router.get("/addform/:location_id", function (req, res) {
  const { location_id } = req.params;
  console.log(location_id);
  res.render("add_vendor_form", { location: location_id });
});

// POST /vendors
router.post("/", bodyParser, function (req, res) {
  // get the data from the form
  const { vendor_name, vendor_description, vendor_rating, location } = req.body;

  // validate the form data
  if (!vendor_name || vendor_name.trim() === "") {
    // vendor name is empty
    return res.render("add_vendor_form", {
      name_error: "Please enter a name",
      ...req.body,
    });
  }

  if (!vendor_rating || vendor_rating.trim() === "") {
    // vendor rating is empty
    return res.render("add_vendor_form", {
      rating_error: "Please enter a rating",
      ...req.body,
    });
  }

  const rating_num = parseInt(vendor_rating);
  if (Number.isNaN(rating_num)) {
    // rating was not a number
    return res.render("add_vendor_form", {
      rating_error: "Please enter a number between 1 and 5",
      ...req.body,
    });
  }

  if (rating_num < 1 || rating_num > 5) {
    return res.render("add_vendor_form", {
      rating_error: "Please enter a number between 1 and 5",
      ...req.body,
    });
  }

  // Do XSS cleanup of input
  // What can you do?
  // remove all script tags from the text?
  // escape the script tags yourself?

  // All validations pass
  // get the database connection
  const knex = req.app.get("db");

  // insert into vendor (name, description, location, rating) value('', '', '', 2)

  return knex
    .insert({
      name: vendor_name,
      description: vendor_description,
      rating: rating_num,
      location: location,
    })
    .into("vendor")
    .then(() => {
      // success
      res.render("add_vendor_success", { vendor_name, location });
    });

  res.end();
  // if invalid respond with an error message
  // if valid insert into DB and render success view
});

module.exports = router;
