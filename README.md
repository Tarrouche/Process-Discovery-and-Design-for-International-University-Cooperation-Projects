# .

This project requires prior configuration of a MongoDB database to serve data to the back-end which provides an API for the front-end to get the neccessary data. Please follow the instructions below to set up the database.

## Installation

1. Make sure to install mongodb with the following commands

sudo apt update
sudo apt install mongodb

## Configuration

1. Update the configuration file using the file provided in the project at `/etc/mongod.conf`

2. Launch mongosh:
mongosh

3. Connect to the MongoDB server using the default connection string:
use admin

4. Create a user with the desired username and password:
db.createUser({
  user: "<username>",
  pwd: "<password>",
  roles: [{ role: "readWrite", db: "<database_name>" }]
})

- The credentials are then used in the back-end to communicate with the database


## Running the Project

Once you have set up MongoDB, proceed with the back-end followed by the front-end (next)

