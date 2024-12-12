# CryptoCalc

Polynomial arithmetic made simple.

# Features

* Modern React frontend
* Intuitive and responsive user interface based on glassmorphism, gradient accents, and micro-interactions.
* Secure and fast Flask backend with PostgreSQL for user operations and user auth.
* Log in and sign up securely to the interface with ability to reset password if needed.
* User authentication based on hashed, salted username and password with secure cookie storage for "Remember me" functionality. Strong and proven password requirements for sign ups.
* Perform any polynomial field arithmatic in Galois fields in any input and output format with ability to specify custom mod polynomial.
* Manage your parameters for calculation (formats, mod polynomial) using parameters section.
* Quick input capabilities for polynomial formats.
* Display all detailed calculation steps.
* Extensively tested, well-documented, and feature-rich polynomial library supporting features much beyond the user interface. You can also use it in your own projects.
* Polynomial library is also responsive, secure, and native. It is expandable to any input, output, and mod pair (not limited to GF(2<sup>8</sup>).
* Stores user history dynamically, reserving inputs and outputs and all parameters as well as final output, with ability to search in user input.
* Ability to log out and delete account if needed.

# Deployment

> **Backend Note!**  
> The Render free instance will spin down with inactivity, which can delay requests by 50 seconds or more.\
> If the website is not responsive, try refreshing it until the Render instance goes live again.

> **Database Note!**  
> The Database size is limited to 500 megabytes only. As such, the deployed instance can only handle 100-500 users.

[The website is available live](https://cryptocalc-p0qp.onrender.com/).

It is deployed using [Render](https://render.com) for serving the backend and 
[Supabase](https://supabase.com/) for the PostgreSQL database using their free tiers.

If your experience is not satisfactory with the free instance, feel free to perform a local deployment described below as it does not suffer from sluggishness experienced with the deployed version.

# Local Deployment

## Backend
You can also deploy a copy of the website locally for your own needs. This requires the following steps:

1. Install [Node.js](https://nodejs.org/en) 20 or higher, [Python](https://www.python.org/) 3.8 or higher as appropriate for your operating system and architechture.
To clone this repository, you also need to have a Git client installed.

2. Clone this repository.
```bash
$ git clone https://github.com/nadineMck/CryptoCalc
```
3. Change to the directory of the clone
```bash
$ cd CryptoCalc
```

4. Install required dependencies

```bash
$ npm install
$ pip install -r requirements.txt
```

5. Change the frontend to link to your local backend instead of the deployed one. This can simply be done by editing the relevant section of each frontend component at the top of its file in `/src/`.

```javascript
const client = axios.create({
    baseURL: "http://127.0.0.1:5000",
});
```

5. Build the frontend to link to it statically from the backend.

```bash
$ npm run build
```

6. Launch the backend.
* If you are on linux, you can use `gunicorn` to host the website.

```bash
$ gunicorn backend.server:app
```

* If you are on Windows, you can execute the server file directly from python as a module.

```bash
$ python -m backend.server
```

7. Congratulations 🎉! The website is up and running.

## Database

If you would also like to serve your own local database then you need to perform additional steps to do that.

1. Install [PostgreSQL](https://www.postgresql.org/) as appropriate for your operating system and architechture.

2. In PostgreSQL, create a database and called `crypto`, then create the tables `User_Auth` and `User_Operations` as defined in `/assets/sql/mktable.sql`.

```sql
CREATE DATABASE crypto WITH
  OWNER = postgres ENCODING = 'UTF8' LC_COLLATE = 'English_United States.1256' LC_CTYPE = 'English_United States.1256' LOCALE_PROVIDER = 'libc' TABLESPACE = pg_default CONNECTION LIMIT = -1 IS_TEMPLATE = False;

CREATE TABLE IF NOT EXISTS User_Operations (
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
```

3. Then, you need to change the database parameters at the beginning of the database backend handler `/backend/database.py`. The default settings of PostgreSQL are shown in the below snippet.

```python
databaseName = "crypto"
db_user = "postgres"
db_password = <put your password here>
host = "localhost"
port = 5432
```

4. Then, launch the backend as described above, and the website should work as expected.

# License
This project is licensed under the MIT License. For more information, see the `LICENSE` file in the root of the GitHub repository.