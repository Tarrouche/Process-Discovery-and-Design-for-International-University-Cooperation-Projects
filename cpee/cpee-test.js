const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  console.log(req.headers['cpee-instance-uuid']);
  res.json({
    fundingStart: 'Hello',
    fundingEnd: 'Goodbye',
    differentInstitution: true
  });
});

app.post('/supervisor_approval', (req, res) => {
  //Link is used when the applicant has a final response from the supervisor.
  const link = req.headers['cpee-callback'];
  res.set('cpee-update', 'true');
  res.send('Callback link stored.');

  setTimeout(() => {
    fetch(link, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ approval: true }),
    });
  }, 5000);
});

app.post('/institution_approval', (req, res) => {
  //Link is used when the applicant has a final response from the chosen institution.
  const link = req.headers['cpee-callback'];
  res.set('cpee-update', 'true');
  res.send('Callback link stored.');

  setTimeout(() => {
    fetch(link, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ approval: true }),
    })
  }, 5000);
});

app.post('/mobility_agreement', (req, res) => {
  //Link is used when mobility agreement is settled.
  const link = req.headers['cpee-callback'];
  res.set('cpee-update', 'true');
  res.send('Callback link stored.');

  setTimeout(() => {
    fetch(link, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobilityStart: 'salut',
        mobilityEnd: 'au revoir',
        userNationality: 'Tunisian',
        destinationCountry: 'France'
      }),
    });
  }, 5000);
});

app.post('/check_visa', (req, res) => {
  res.send('POST request received');
});

app.post('/prepare_application', (req, res) => {
  //Link is used when documents are ready and maybe stored in the database.
  const link = req.headers['cpee-callback'];
  res.set('cpee-update', 'true');
  res.send('Callback link stored.');


  setTimeout(() => {
    fetch(link, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId: 'test-test'
      }),
    });
  }, 5000);
});

app.post('/apply_grant', (req, res) => {
  //Link is used for confirming grant application.
  const link = req.headers['cpee-callback'];
  res.set('cpee-update', 'true');
  res.send('Callback link stored.');

  setTimeout(() => {
    fetch(link, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, 5000);
});

app.post('/wait_grant', (req, res) => {
  const link = req.headers['cpee-callback'];
  res.set('cpee-update', 'true');
  res.send('Callback link stored.');
  //link is used to submit grant approval state, needs to be saved in database

  setTimeout(() => {
    fetch(link, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ approval: true }),
    });
  }, 5000);
});

app.post('/confirm_participation', (req, res) => {
  const link = req.headers['cpee-callback'];
  res.set('cpee-update', 'true');
  res.send('Callback link stored.');
  //link is used for confirming participation, needs to be saved in database

  setTimeout(() => {
    fetch(link, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fundingStart: 'Hello 2',
        fundingEnd: 'Goodbye 2'
      }),
    });
  }, 5000);
});

app.get('/start_funding', (req, res) => {
  res.json({
    modulesAvailable: false,
    reportsRequired: false
  });
});

app.post('/change_period', (req, res) => {
  const link = req.headers['cpee-callback'];
  res.set('cpee-update', 'true');
  res.send('Callback link stored.');
  //link is used for changing dates, needs to be saved in database
});

app.get('/end_funding', (req, res) => {
  res.json({
    finalReport: false,
    finalPresentation: false
  });
});

app.post('/final_report', (req, res) => {
  const link = req.headers['cpee-callback'];
  res.set('cpee-update', 'true');
  res.send('Callback link stored.');
  //link is used for submitting final report, needs to be saved in database
});

app.post('/final_presentation', (req, res) => {
  const link = req.headers['cpee-callback'];
  res.set('cpee-update', 'true');
  res.send('Callback link stored.');
  //link is used for changing dates, needs to be saved in database
});

app.listen(port, '93.90.203.127', () => {
  console.log(`Server running at http://93.90.203.127:${port}/`);
});
