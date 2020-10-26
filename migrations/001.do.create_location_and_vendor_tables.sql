-- Install the UUID extension for generating random primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a locations table
CREATE TABLE location
(
  id uuid DEFAULT uuid_generate_v4(),
  name VARCHAR(250) NOT NULL,
  PRIMARY KEY (id)
); 
 -- CREATE a Vendor table
CREATE TABLE vendor
(
  id uuid DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  description VARCHAR(250),
  location uuid REFERENCES location(id),
  rating integer DEFAULT 1,
  PRIMARY KEY (id)
);