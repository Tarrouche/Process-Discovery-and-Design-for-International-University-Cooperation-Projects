const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const secureRandomString = require('secure-random-string')
const cookieParser = require("cookie-parser");

const httpsOptions = {
  key: fs.readFileSync('/etc/ssl/private/server_private_key.key'),
  cert: fs.readFileSync('/etc/ssl/certs/snorlax.wtf_ssl_certificate.cer'),
  ca: fs.readFileSync('/etc/ssl/certs/snorlax_intermedite.cer')
};

const port = process.env.PORT || 4000;
const ip = '93.90.203.127';

const institutionRoutes = require('./routes/institution');
const programRoutes = require('./routes/program');
const userRoutes = require('./routes/user');
const cpeeRoutes = require('./routes/cpee');

const MongoStore = require('connect-mongo');

const { client, generateId, validateRequest, requireAdmin, requireAdminOrResponsible } = require('./db');
const bcrypt = require('bcrypt'); // Password Hashing
const saltRounds = 10; // password hashing


const cors = require('cors'); //To make cross-origin request from Next

app.use(bodyParser.json()); // To parse json body
app.use(bodyParser.urlencoded({ extended: true })); // To parse CPEE requests

const corsOptions = {
  origin: ['https://snorlax.wtf', 'https://www.snorlax.wtf', 'https://93.90.203.127'],
  credentials: true,
};
app.use(cors(corsOptions));
const sessionOptions = {
  secret: '0bcaab0b17b1ad24e4ff2173f008b513f34a37e10089d870f3064918c889b3ec',
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://myUserAdmin:1Tarrouche@127.0.0.1:27017/' }),
  cookie: {
    httpOnly: true,
    secure: true,
    originalMaxAge: 1000 * 60 * 60 * 24,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours after the current time
    sameSite: 'lax',
    domain: '.snorlax.wtf' // Set the domain option to the parent domain
  },
  genid: function (req) {
    return secureRandomString({ length: 32 });
  }
};
app.use(session(sessionOptions));
app.use(cookieParser());

app.use('/api/institution', institutionRoutes);
app.use('/api/program', programRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cpee', cpeeRoutes);

const routes = ['user', 'program', 'institution'];
const userRequestFormat = ['email', 'password', 'firstName', 'lastName', 'institution', 'nationality'];
const programRequestFormat = ['offerer', 'title', 'location', 'website', 'logo', 'typeOfProgram', 'funded', 'transfer', 'applicationPeriod', 'eligiblePositions']
const institutionRequestFromat = ['name', 'country', 'logo', 'website'];

const allowedRoles = ['Applicant', 'Admin', 'Responsible'];

async function main() {
  let dbt = client.db('test');

  app.get('/api/dashboard', requireAdminOrResponsible, async (req, res) => { //Get dashboard data, different for admins and responsibles
    const user = await dbt.collection("users").findOne({ userId: req.session.user.userId });
    if (user.role === 'Admin') {
      const [institutions, programs, users] = await Promise.all([
        dbt.collection("institutions").find({}).project({ institutionId: 1, name: 1, country: 1, city: 1, responsibles: 1, _id: 0 }).toArray(),
        dbt.collection("programs").find({}).toArray(),
        dbt.collection("users").find({}).project({ userId: 1, email: 1, role: 1, _id: 0 }).toArray()
      ]);
      return res.send({ institutions, programs, users });
    } else {
      const [userInstitutions, userPrograms] = await Promise.all([
        dbt.collection("institutions").find({ "responsibles.userId": user.userId }).project({ institutionId: 1, name: 1, country: 1, city: 1, responsibles: 1, _id: 0 }).toArray(),
        dbt.collection("programs").find({ "responsibles.userId": user.userId }).toArray()
      ]);
      return res.send({ institutions: userInstitutions, programs: userPrograms });
    }
  });

  app.get("/api/roles", (req, res) => { //Get allowed roles
    res.status(200).json(allowedRoles);
  });

  app.post('/api/:element/:id/delete', requireAdmin, async (req, res) => { //Delete a user, institution or program
    const { element, id } = req.params;

    // Check that the element parameter is valid
    if (routes.indexOf(element) === -1) {
      return res.status(400).json({ message: 'Invalid element type' });
    }

    const collection = dbt.collection(`${element}s`);
    const del = await collection.deleteOne({ [`${element}Id`]: id });
    console.log(`${element} ${id} deleted`);

    if (del.acknowledged && del.deletedCount == 0) {
      res.status(200).json({ message: 'Doesn\'t exist' });
    } else if (del.acknowledged) {
      res.status(200).json({ message: 'Acknowleged' });
    }

  });

  app.get("/api/institutions/names", async (req, res) => {//Get institutions names
    const result = await dbt.collection("institutions").find({}).project({ institutionId: 1, name: 1, _id: 0 }).toArray();
    res.send({ message: result });
  });

  app.get("/api/applications", async (req, res) => {//Get applications
    const result = await dbt.collection("applications").find({}).project({ _id: 0 }).toArray();
    res.send(result);
  });


  app.get("/api/countries", async (req, res) => {//Get countries
    const result = await dbt.collection("countries").find({}).project({ _id: 0 }).toArray();
    res.send(result)
  });

  app.get("/api/nationalities", async (req, res) => {//Get nationalities
    const result = await dbt.collection("nationalities").find({}).project({ citizenship: 1, _id: 0 }).toArray();
    res.send(result);
  });

  app.get("/api/visa", async (req, res) => {//Get visa requirements given nationality and country
    const { nationality, country } = req.query; //extract country and nationality from query parameters
    if (country && nationality) {
      const result = await dbt.collection("nationalities").find({ citizenship: nationality }).project({ visaRequirements: 1, _id: 0 }).toArray();
      if (result && result.visaRequirements && result.visaRequirements[country]) {
        //retrieve the visa requirement for the specified country
        const visaRequirement = result.visaRequirements[country];
        res.send(visaRequirement);
      } else {
        res.status(404).send("Wrong parameters.");
      }
    } else {
      res.status(400).send("Both nationality and country are required.");
    }
  });

  app.get("/institutions", async (req, res) => {
    const result = await dbt.collection("institutions").find({}).toArray();
    res.send({ message: result });
  });

  app.get("/programs", async (req, res) => {
    const result = await dbt.collection("programs").find({}).toArray();
    res.send({ message: result });
  });

  https.createServer(httpsOptions, app).listen(4000, 'snorlax.wtf', () => {
    console.log('HTTPS server running on port 4000');
  });

  const server = http.createServer(app);

  app.listen(port, '127.0.0.1', () => {
    console.log(`Server is listening on port ${port}`);
  });

}
main().catch(console.error);


