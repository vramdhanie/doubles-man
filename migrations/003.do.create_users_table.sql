CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4(),
  email VARCHAR(250) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  date_created TIMESTAMP DEFAULT now() NOT NULL,
  PRIMARY KEY (id)
);
