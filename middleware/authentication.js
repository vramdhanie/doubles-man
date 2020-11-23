const { JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");

function requiredAuth(req, res, next) {
  //get the token from the cookie, default to "" if it is absent
  const { token = "" } = req.cookies;

  const knex = req.app.get("db");

  try {
    // Use JWT to verify that the token is valid
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // query the database for the user with that username/email
    knex("users")
      .where({ email: payload.sub })
      .first()
      .then((user) => {
        // if the user does not exist then they are unauthorised
        if (!user) return res.render("unauthorised");
        // otherwise continue to endpoint
        next();
      })
      .catch((err) => {
        next(err);
      });
  } catch (error) {
    res.render("unauthorised");
  }
}

module.exports = requiredAuth;
