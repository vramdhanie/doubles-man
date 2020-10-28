module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://doubles_man:hot_sauce@localhost/doubles",
  RECAPTCHA_SECRET: process.env.RECAPTCHA_SECRET,
  RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
};
