CREATE DATABASE crypto
WITH
  OWNER = postgres ENCODING = 'UTF8' LC_COLLATE = 'English_United States.1256' LC_CTYPE = 'English_United States.1256' LOCALE_PROVIDER = 'libc' TABLESPACE = pg_default CONNECTION LIMIT = -1 IS_TEMPLATE = False;

CREATE TABLE
  IF NOT EXISTS User_Operations (
    username_hash VARCHAR(128),
    operation_id SERIAL,
    date_created TIMESTAMP,
    field VARCHAR(10),
    irreduciblePolynomial VARCHAR(50),
    operation VARCHAR(20),
    input1 VARCHAR(500),
    input2 VARCHAR(500),
    result VARCHAR(500),
    inputFormat VARCHAR(50),
    outputFormat VARCHAR(50),
    PRIMARY KEY (username_hash, operation_id)
  );

CREATE TABLE IF NOT EXISTS User_Auth (
    username VARCHAR(50) NOT NULL,
    username_hash CHAR(64) NOT NULL,
    email VARCHAR(320) NOT NULL,
    password CHAR(64) NOT NULL,
    salt VARCHAR(32) NOT NULL,
    PRIMARY KEY (email)
);
