const express = require('express');
const router = express.Router();
const { client } = require('../db');

const db = client.db('test');
const usersCollection = db.collection('users');
const programsCollection = db.collection('programs');

//CPEE sets the application process state (step), by calling the corresponding endpoint.
//For asynchronous patterns, the update url is saved in the user's document. 
//When the user finishes the activity he uses the callback/ for giving a response.

router.post('/', async (req, res) => {
  const program = await programsCollection.findOne({ programId: req.body.program });
  if (program.transfer === 'Not allowed') {
    res.json({
      differentInstitution: false
    });
  } else if (program.transfer === 'Required') {
    res.json({
      differentInstitution: true
    });
  } else {
    const link = req.headers['cpee-callback'];

    const user = await usersCollection.findOne({ userId: req.body.applicant });

    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.program);

      if (application) {
        // Update the "callback" field in the found application object
        application.callback = { link, step: 'initialization' };

        // Update the user document with the modified "applications" array
        await usersCollection.updateOne(
          { userId: req.body.applicant },
          { $set: { applications: user.applications } }
        );
        res.set('cpee-update', 'true');
        res.send('Callback link stored.');
      } else {
        // Application with matching "programId" not found
        res.json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.json({
        error: 'User not found'
      });
    }
  }
});

router.post('/callback/', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);

      if (application) {
        try {
          application.transfer = req.body.transfer;

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(application.callback.link, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              differentInstitution: req.body.transfer
            }),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/supervisor_approval', async (req, res) => {
  //Link is used when the applicant has a final response from the supervisor.
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });
  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "callback" field in the found application object
      application.callback = { link, step: 'supervisor_approval' };
      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );
      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.status(404).json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.status(404).json({
      error: 'User not found'
    });
  }
});

router.post('/callback/supervisor_approval', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);

      if (application) {
        try {
          application.supervisorApproved = req.body.approval;

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(application.callback.link, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              approval: req.body.approval
            }),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/institution_approval', async (req, res) => {
  //Link is used when the applicant has a final response from the chosen institution.
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "callback" field in the found application object
      application.callback = { link, step: 'institution_approval' };

      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );

      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/institution_approval', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);

      if (application) {
        try {
          application.chosenInstitution = req.body.institution;
          application.institutionApproved = req.body.approval;

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(application.callback.link, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              approval: req.body.approval
            }),
          });

          if (!response.ok) {
            res.status(500).json({
              error: 'Failed to update the cpee process'
            });
          }

          res.json({
            message: 'Updated'
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({
            error: 'Failed to update application'
          });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/mobility_agreement', async (req, res) => {
  //Link is used when mobility agreement is settled.
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "callback" field in the found application object
      application.callback = { link, step: 'mobility_agreement' };

      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );
      console.log(user)
      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/mobility_agreement', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);

      if (application) {
        try {
          application.mobilityPeriod = req.body.period;

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(application.callback.link, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mobilityStart: req.body.period.start,
              mobilityEnd: req.body.period.end,
              userNationality: 'Tunisian',
              destinationCountry: 'France'
            }),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/check_visa', async (req, res) => {
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "callback" field in the found application object
      application.callback = { link, step: 'check_visa' };

      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );
      console.log(user)
      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/check_visa', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);
      if (application) {
        try {
          application.visaChecked = req.body.visa;

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(application.callback.link, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              visa: req.body.visa,
            }),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/prepare_application', async (req, res) => {
  //Link is used when documents are ready and maybe stored in the database.
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "callback" field in the found application object
      application.callback = { link, step: 'prepare_application' };

      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );
      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/prepare_application', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);
      console.log(application.callback)
      if (application) {
        try {
          application.documentsPrepared = req.body.documents;

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(application.callback.link, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documents: req.body.documents,
            }),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/apply_grant', async (req, res) => {
  //Link is used for confirming grant application.
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "callback" field in the found application object
      application.callback = { link, step: 'apply_grant' };

      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );
      console.log(user)
      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/apply_grant', async (req, res) => {
  console.log('callback apply')
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);
      console.log(application.callback)
      if (application) {
        try {
          application.grantApplied = req.body.applied;

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(application.callback.link, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              applied: req.body.applied,
            }),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/wait_grant', async (req, res) => {
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "callback" field in the found application object
      application.callback = { link, step: 'wait_grant' };

      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );
      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/wait_grant', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);

      if (application) {
        try {
          application.fundingApproved = req.body.approval;

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(application.callback.link, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              approval: req.body.approval
            }),
          });

          if (!response.ok) {
            res.status(500).json({
              error: 'Failed to update the cpee process'
            });
          }

          res.json({
            message: 'Updated'
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({
            error: 'Failed to update application'
          });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/confirm_participation', async (req, res) => {
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "callback" field in the found application object
      application.callback = { link, step: 'confirm_participation' };

      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );
      console.log(user)
      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/confirm_participation', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);

      if (application) {
        try {
          application.fundingPeriod = req.body.period;
          application.programPeriod = req.body.period;

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(application.callback.link, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fundingStart: req.body.period.start,
              fundingEnd: req.body.period.end,
            }),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/start_funding', async (req, res) => {
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "callback" field in the found application object
      application.callback = { link, step: 'start_funding' };

      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );

      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/start_funding', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);
      const program = await programsCollection.findOne({ programId: req.body.programId });
      const modulesAvailable = program.modules.state == 'Available';
      const reportsRequired = program.reports.state == 'Required';
      if (application) {
        try {
          application.arrivalConfirmed = true;
          application.modules = program.modules;
          application.reports = program.reports;
          application.actions = [];

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(application.callback.link, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              stopProgram: false,
              changePeriod: false,
              applyModule: !modulesAvailable,
              submitReport: !reportsRequired
            }),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/change_period', async (req, res) => {
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "actions" field in the found application object
      const index = application.actions.findIndex((item) => item.action === 'change_period');

      if (index === -1) {
        // There is no change_period link, so push the new link to the end of the array
        application.actions.push({ link, action: 'change_period' });
      } else {
        // There is a change_period link, so update the link of the existing element
        application.actions[index].link = link;
      }


      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );
      console.log(application.actions)
      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/change_period', async (req, res) => {
  console.log(req.body.period)
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);
      if (application) {
        const changePeriodLink = application.actions.find((item) => item.action === 'change_period')?.link;

        try {
          application.programPeriod = req.body.period;

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(changePeriodLink, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/apply_module', async (req, res) => {
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "actions" field in the found application object
      const index = application.actions.findIndex((item) => item.action === 'apply_module');

      if (index === -1) {
        // There is no apply_module link, so push the new link to the end of the array
        application.actions.push({ link, action: 'apply_module' });
      } else {
        // There is a apply_module link, so update the link of the existing element
        application.actions[index].link = link;
      }

      application.appliedModules = application.appliedModules || [];


      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );
      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/apply_module', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);
      if (application) {
        const applyModuleLink = application.actions.find((item) => item.action === 'apply_module')?.link;
        try {
          application.appliedModules.push({ name: req.body.name, date: req.body.date });

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(applyModuleLink, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/submit_report', async (req, res) => {
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "actions" field in the found application object
      const index = application.actions.findIndex((item) => item.action === 'submit_report');

      if (index === -1) {
        // There is no submit_report link, so push the new link to the end of the array
        application.actions.push({ link, action: 'submit_report' });
      } else {
        // There is a submit_report link, so update the link of the existing element
        application.actions[index].link = link;
      }

      application.submittedReports = application.submittedReports || [];

      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );
      console.log(application.actions)
      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/submit_report', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);
      if (application) {
        const submitReportLink = application.actions.find((item) => item.action === 'submit_report')?.link;
        console.log(application.actions)

        try {

          application.submittedReports.push({ date: req.body.date, deadline: req.body.deadline });

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(submitReportLink, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/stop_program', async (req, res) => {
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "actions" field in the found application object
      application.actions.push({ link, action: 'stop_program' });
      application.callback = { step: 'perform_actions' };

      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );
      console.log(application.actions)
      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/stop_program', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);
      if (application) {
        const stopProgramLink = application.actions.find((item) => item.action === 'stop_program')?.link;

        try {
          const response = await fetch(stopProgramLink, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/end_funding', async (req, res) => {
  console.log(req.body.program)
  const program = await programsCollection.findOne({ programId: req.body.program });
  console.log(program)
  if (program.finalReport.state === 'Required') {
    res.json({
      finalReport: true,
      differentInstitution: false
    });
  } else {
    res.json({
      finalReport: false,
      finalPresentation: false
    });
  }
});

router.post('/final_report', async (req, res) => {
  const link = req.headers['cpee-callback'];
  const user = await usersCollection.findOne({ userId: req.body.applicant });

  if (user) {
    // Find the application object within the "applications" array that has matching "programId"
    const application = user.applications.find(app => app.programId === req.body.program);

    if (application) {
      // Update the "callback" field in the found application object
      application.callback = { link, step: 'final_report' };

      // Update the user document with the modified "applications" array
      await usersCollection.updateOne(
        { userId: req.body.applicant },
        { $set: { applications: user.applications } }
      );

      res.set('cpee-update', 'true');
      res.send('Callback link stored.');
    } else {
      // Application with matching "programId" not found
      res.json({
        error: 'Application not found'
      });
    }
  } else {
    // User with matching "userId" not found
    res.json({
      error: 'User not found'
    });
  }
});

router.post('/callback/final_report', async (req, res) => {
  if (req.session.user) {
    const user = await usersCollection.findOne({ userId: req.session.user.userId });
    if (user) {
      // Find the application object within the "applications" array that has matching "programId"
      const application = user.applications.find(app => app.programId === req.body.programId);
      if (application) {
        try {
          application.finalReportSubmitted = true;

          await usersCollection.updateOne(
            { userId: user.userId },
            { $set: { applications: user.applications } }
          );

          const response = await fetch(application.callback.link, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          if (!response.ok) {
            res.status(500).json({ error: 'Failed to update the cpee process' });
          }

          res.json({ message: 'Updated' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update application' });
        }

      } else {
        // Application with matching "programId" not found
        res.status(404).json({
          error: 'Application not found'
        });
      }
    } else {
      // User with matching "userId" not found
      res.status(404).json({
        error: 'User not found'
      });
    }
  }
});

router.post('/final_presentation', (req, res) => {
  const link = req.headers['cpee-callback'];
  res.set('cpee-update', 'true');
  res.send('Callback link stored.');
  //link is used for changing dates, needs to be saved in database
});

module.exports = router;
