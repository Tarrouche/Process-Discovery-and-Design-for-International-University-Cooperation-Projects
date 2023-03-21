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

const MongoStore = require('connect-mongo');

const { client, generateId, validateRequest, requireAdmin } = require('./db');
const bcrypt = require('bcrypt'); // Password Hashing
const saltRounds = 10; // password hashing


const cors = require('cors'); //To make cross-origin request from Next
app.use(bodyParser.json());
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

const routes = ['user', 'program', 'institution'];
const userRequestFormat = ['email', 'password', 'firstName', 'lastName', 'institution'];
const programRequestFormat = ['name', 'location', 'logo', 'typeOfProgram', 'funded'];
const institutionRequestFromat = ['name', 'country', 'city', 'logo', 'website'];

const allowedRoles = ['Applicant', 'Admin', 'Responsible'];

async function main() {
  let dbt = client.db('test');

  app.get('/api/dashboard', requireAdmin, async (req, response) => {
    dbt.collection("institutions").find({}).project({ institutionId: 1, name: 1, country: 1, city: 1, _id: 0 }).toArray()
      .then(institutions => {
        dbt.collection("programs").find({}).project({ programId: 1, name: 1, location: 1, typeOfProgram: 1, funded: 1, logo: 1, _id: 0 }).toArray()
          .then(programs => {
            dbt.collection("users").find({}).project({ userId: 1, email: 1, role: 1, _id: 0 }).toArray()
              .then(users => {
                response.send({
                  institutions,
                  programs,
                  users
                });
              })
              .catch(err => {
                console.error(`Error fetching programs: ${err}`);
                response.status(500).send({
                  error: "Error fetching programs"
                });
              });
          })
      })
      .catch(err => {
        console.error(`Error fetching institutions: ${err}`);
        response.status(500).send({
          error: "Error fetching institutions"
        });
      });
  });

  app.post('/api/:element/create/', async (req, res) => {
    const { element } = req.params;

    // Check that the element parameter is valid
    if (routes.indexOf(element) === -1) {
      return res.status(400).json({ message: 'Invalid element type' });
    }

    const collection = dbt.collection(`${element}s`);
    const id = await generateId(collection);
    let requestValid = true;
    let toAdd = {};
    if (routes.indexOf(element) === 0) { //user validation

      requestValid = validateRequest(req.body, userRequestFormat, false);

      if (requestValid) {
        const user = await collection.findOne({ email: req.body.email });
        if (!user) {
          const hashedPassword = await bcrypt.hash(req.body.password, saltRounds); // Hash the password
          toAdd = { password: hashedPassword, role: 'Applicant' };
        } else {
          return res.status(401).json({ message: 'Email already used' });
        }
      }
    }

    if (routes.indexOf(element) === 1) { //program validation

      requestValid = validateRequest(req.body, programRequestFormat, true);
      console.log(req.body);
      toAdd = { responsibles: [] }
    }

    if (routes.indexOf(element) === 2) { //institution validation
      requestValid = validateRequest(req.body, institutionRequestFromat, false);
    }

    if (requestValid) {
      const crt = await collection.insertOne({ [`${element}Id`]: id, ...req.body, ...toAdd, createdAt: new Date() });
      console.log(`${element} ${id} created`);
      //console.log(req.body);
      return res.status(200).json({ [`${element}Id`]: id });
    }


    res.status(400).json({ message: 'Not allowed' });
  });

  app.get('/api/emails', async (req, res) => {
    const db = client.db('test');
    const collection = db.collection('users');
    const emails = await collection.find({}).project({ userId: 1, email: 1, _id: 0 }).toArray();
    res.status(200).json({ emails });
  });

  app.get("/api/roles", (req, res) => {
    res.status(200).json(allowedRoles);
  });

  app.post('/api/:element/:id/delete', requireAdmin, async (req, res) => {
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

  app.get("/institutions", (req, response, next) => {
    dbt.collection("institutions")
      .find({}).toArray()
      .then(
        res => response.send({
          message: res
        }),
        err => console.error(`Something went wrong: ${err}`),
      );
  });

  app.get("/api/institutions/names", (req, response, next) => {
    dbt.collection("institutions")
      .find({}).project({ institutionId: 1, name: 1, _id: 0 })
      .toArray().then(
        res => response.send({
          message: res
        }),
        err => console.error(`Something went wrong: ${err}`),
      );
  });

  app.get("/programs", (req, response, next) => {
    dbt.collection("programs")
      .find({}).toArray()
      .then(
        res => response.send({
          message: res
        }),
        err => console.error(`Something went wrong: ${err}`),
      );
  });

  await dbt.collection("programs").find({}).toArray().then(res => console.log(res));

  https.createServer(httpsOptions, app).listen(4000, 'snorlax.wtf', () => {
    console.log('HTTPS server running on port 4000');
  });

  const server = http.createServer(app);

  app.listen(port, '127.0.0.1', () => {
    console.log(`Server is listening on port ${port}`);
  });

}
main().catch(console.error);


