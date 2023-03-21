const express = require('express');
const router = express.Router();
const { client, validateRequest, generateId, requireAdmin } = require('../db');

/*
{
    _id,
    institutionId,
    name,
    country,
    city,
    logo, 
    website,
    programs: [ { programId, applicationId} ],
    createdAt,
    updatedAt,
   
  }
*/


router.get('/:id', async (req, res) => { // Get institution by id
  const id = req.params.id;
  const db = client.db('test');
  const collection = db.collection('institutions');

  const result = await collection.findOne(
    { institutionId: id },
    { projection: { name: 1, country: 1, city: 1, website: 1, logo: 1, updatedAt: 1, _id: 0 } }
  );
  res.status(200).json(result);

});

router.post('/:id/settings', requireAdmin, async (req, res) => { // Set institution by id
  const id = req.params.id;
  const requestValid = validateRequest(req.body, ['programs'], true);
  const db = client.db('test');
  const applications = db.collection('applications');

  if (requestValid) {
    const programs = req.body.programs;
    const date = new Date();

    // Validate the given changes
    // find all programs with the given institutionId
    const existingPrograms = await applications.find({ institutionId: id }).toArray();

    const programsToAdd = [];
    const programsToUpdate = [];
    const programsToDelete = [];

    // check each program in the request body
    programs.forEach((program) => {
      const { programId, institutionId, ...rest } = program;

      if (!institutionId) {
        programsToAdd.push({ institutionId: id, programId, ...rest });
      }
      //solve updates with bool
    });

    // check which programs to delete
    existingPrograms.forEach((existingProgram) => {
      const programId = existingProgram.programId;

      // check if the program is not in the request body
      const programExists = programs.some(p => p.programId === programId);

      if (!programExists) {
        // mark the program to be deleted
        programsToDelete.push({ applicationId: existingProgram.applicationId });
      }
    });

    // perform the database operations
    try {
      // insert new programs
      if (programsToAdd.length > 0) {
        const programsToAddForApplications = [];
        const programsToAddForInstitution = [];

        for (let i = 0; i < programsToAdd.length; i++) {
          const program = programsToAdd[i];
          const applicationId = await generateId(applications);
          programsToAddForApplications.push({ applicationId, institutionId: id, programId: program.programId, ...program, createdAt: date });
          programsToAddForInstitution.push({ programId: program.programId, applicationId: applicationId, createdAt: date });
        }

        // add applicationId and programId to institution's programs list
        await db.collection('institutions').updateOne(
          { institutionId: id },
          { $addToSet: { programs: { $each: programsToAddForInstitution } } }
        );
        await applications.insertMany(programsToAddForApplications);
      }


      // update existing programs
      if (programsToUpdate.length > 0) {
        for (let i = 0; i < programsToUpdate.length; i++) {
          const program = programsToUpdate[i];
          //TODO
        }
      }

      // delete programs
      if (programsToDelete.length > 0) {
        for (let i = 0; i < programsToDelete.length; i++) {
          const program = programsToDelete[i];
          await db.collection('institutions').updateOne(
            { institutionId: id },
            {
              $pull: { programs: { applicationId: program.applicationId } },
              $set: { updatedAt: date }
            }
          );
          await applications.deleteOne({ applicationId: program.applicationId });
        }
      }
      const collection = db.collection("applications");
      const update = await collection.find({ institutionId: id }).project({ _id: 0 }).toArray();

      console.log(`SET INSTITUTION ${id}:`);
      //console.log(update);

      res.status(200).json({ message: 'Acknowleged', programs: update });

    } catch (error) {
      console.error(`Error /api/institution/:id/settings? ${error}`);
      res.status(400).json({ message: 'Something went wrong' });
    }
  }
});

router.get('/:id/programs', async (req, res) => { // Get institution programs from applications collection by id
  const id = req.params.id;
  const db = client.db('test');
  const collection = db.collection("applications");

  const programs = await collection.find({ institutionId: id }).project({ _id: 0 }).toArray();
  res.status(200).json(programs);
});

router.post('/:id/edit', requireAdmin, async (req, res) => { // Edit institution by id
  const id = req.params.id;
  const requestValid = validateRequest(req.body, ['name', 'country', 'city', 'logo', 'website'], true);

  if (requestValid) {
    const db = client.db('test');
    const collection = db.collection('institutions');

    const upd = await collection.updateOne({ institutionId: id }, { $set: { ...req.body, updatedAt: new Date() } });

    console.log(`INSTITUTION ${id} EDIT:`);
    //console.log(req.body);

    if (!upd.acknowledged) {
      res.status(400).json({ message: 'Something went wrong' });
    } else if (upd.deletedCount == 0) {
      res.status(400).json({ message: 'Doesn\'t exist' });
    } else {
      res.status(200).json({ message: 'Acknowleged' });
    }
  } else {
    res.status(400).json({ message: 'Not allowed' });
  }
});

module.exports = router;
