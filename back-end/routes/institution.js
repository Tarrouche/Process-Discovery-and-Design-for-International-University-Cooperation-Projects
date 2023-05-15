const express = require('express');
const router = express.Router();
const Joi = require('joi');
const fs = require('fs');
const { client, validateRequest, generateId, generateFileId, requireInstitutionResponsible, requireAdmin } = require('../db');
const { upload, pdfHeader, rtfHeader, filterFilesByHeader } = require('./upload');
const xss = require('xss');

const db = client.db('test');

//Allowing only authorized users using requireAdmin/requireInstitutionResponsible.
//When user input is displayed to other users, it is validated using Joi.
//For strings, sanitization is also required.

router.get('/:id', async (req, res) => { //Get institution by id
  const id = req.params.id;
  const collection = db.collection('institutions');
  const result = await collection.findOne(
    { institutionId: id },
    { projection: { name: 1, country: 1, city: 1, website: 1, logo: 1, updatedAt: 1, _id: 0 } }
  );
  res.status(200).json(result);

});

router.get('/:id/programs', async (req, res) => { //Get institution programs from applications collection by id
  const id = req.params.id;
  const collection = db.collection("applications");
  const programs = await collection.find({ institutionId: id }).project({ _id: 0 }).toArray();
  res.status(200).json(programs);
});

const editSchema = Joi.object({
  name: Joi.string().custom((value, helpers) => {
    const sanitizedValue = xss(value); // Sanitize the input value
    return sanitizedValue;
  }),
  country: Joi.string().custom((value, helpers) => {
    const sanitizedValue = xss(value); // Sanitize the input value
    return sanitizedValue;
  }),
  website: Joi.string()
    .uri({ scheme: ['http', 'https'] }),
  logo: Joi.string()
    .uri({ scheme: ['http', 'https'] })
});

router.post('/create', requireAdmin, async (req, res) => { //Create an institution
  const { error, value } = editSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: 'Not allowed!' });
  }
  const collection = db.collection('institutions');
  const id = await generateId(collection);
  await collection.insertOne({ institutionId: id, ...value, responsibles: [], createdAt: new Date() });
  res.status(200).json({ institutionId: id });
});

router.post('/:id/settings', requireInstitutionResponsible, async (req, res) => { //Set institution by id
  const id = req.params.id;
  const requestValid = validateRequest(req.body, ['programs'], true);
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
      let program;
      for (program of programs) {
        if (program.programId === programId) {
          break;
        }
      }
      if (!program) {
        // mark the program to be deleted
        programsToDelete.push({ applicationId: existingProgram.applicationId, programId: existingProgram.programId });
      } else if (program && (existingProgram.in !== program.in || existingProgram.out !== program.out)) {
        // mark the program to be updated be updated
        programsToUpdate.push({ applicationId: existingProgram.applicationId, in: program.in, out: program.out });
      }
    });

    // perform the database operations
    try {
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
          await db.collection('programs').updateOne(
            { programId: program.programId },
            {
              $pull: { participatingInstitutions: { applicationId: program.applicationId } },
              $set: { updatedAt: date }
            }
          );
          await applications.deleteOne({ applicationId: program.applicationId });
        }
      }
      if (programsToUpdate.length > 0) {
        for (let application of programsToUpdate) {
          await db.collection('applications').updateOne(
            { applicationId: application.applicationId },
            { $set: { in: application.in, out: application.out, updatedAt: new Date() } }
          );
          await db.collection('institutions').updateOne(
            { programs: { $elemMatch: { applicationId: application.applicationId } } },
            { $set: { "programs.$.in": application.in, "programs.$.out": application.out, "programs.$.updatedAt": new Date() } }
          );
          await db.collection('programs').updateOne(
            { participatingInstitutions: { $elemMatch: { applicationId: application.applicationId } } },
            { $set: { "participatingInstitutions.$.in": application.in, "participatingInstitutions.$.out": application.out, "participatingInstitutions.$.updatedAt": new Date() } }
          );

        };
      }


      // insert new programs
      if (programsToAdd.length > 0) {
        const programsToAddForApplications = [];
        const programsToAddForInstitution = [];

        for (let i = 0; i < programsToAdd.length; i++) {
          const program = programsToAdd[i];
          const applicationId = await generateId(applications);
          programsToAddForApplications.push({ applicationId, institutionId: id, programId: program.programId, ...program, createdAt: date });
          programsToAddForInstitution.push({ programId: program.programId, applicationId: applicationId, offerer: program.offerer, title: program.title, createdAt: date });
          await db.collection('programs').updateOne(
            { programId: program.programId },
            { $addToSet: { participatingInstitutions: { applicationId, institutionId: id, programId: program.programId, ...program, createdAt: date } } }
          );
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

router.post('/:id/edit', requireInstitutionResponsible, async (req, res) => { //Edit institution by id
  const id = req.params.id;
  const { error, value } = editSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: 'Not allowed!' });
  }

  const collection = db.collection('institutions');
  const upd = await collection.updateOne({ institutionId: id }, { $set: { ...value, updatedAt: new Date() } });

  if (!upd.acknowledged) {
    res.status(400).json({ message: 'Something went wrong' });
  } else if (upd.deletedCount == 0) {
    res.status(400).json({ message: 'Doesn\'t exist' });
  } else {
    res.status(200).json({ message: 'Acknowleged' });
  }
});

const responsibleSchema = Joi.object({
  responsible: Joi.string().required()
});

router.post("/:id/responsibles/add", requireInstitutionResponsible, async (req, res) => { //Add an institution's responsible
  const id = req.params.id;
  const { error, value } = responsibleSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: 'Not allowed!' });
  }

  const email = value.responsible;
  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found." });
  } else if (user.role === 'Admin') {
    return res.status(400).json({ message: "User already Admin." });
  } else if (user.role !== 'Responsible') {
    return res.status(400).json({ message: "User's role must be first set to Responsible adding him." });
  }

  const institution = await db.collection("institutions").findOne({ institutionId: id });
  if (!institution) {
    return res.status(400).json({ message: "Institution not found." });
  }

  if (institution.responsibles && institution.responsibles.some(responsible => responsible.email === email)) {
    return res.status(400).json({ message: "User already responsible." });
  }

  await db.collection("institutions").updateOne(
    { institutionId: id },
    { $push: { responsibles: { userId: user.userId, email } } }
  );

  return res.status(200).json({ message: "Responsible added successfully." });
});

router.post("/:id/responsibles/remove", requireInstitutionResponsible, async (req, res) => { //Remove an institution's responsible
  const id = req.params.id;
  const { error, value } = responsibleSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: 'Not allowed!' });
  }

  const email = value.responsible;
  const institution = await db.collection("institutions").findOne({ institutionId: id });

  if (!institution) {
    return res.status(400).json({ message: "Institution not found." });
  }

  if (!institution.responsibles.some(responsible => responsible.email === email)) {
    return res.status(400).json({ message: "Responsible not found in program." });
  }

  await db.collection("institutions").updateOne(
    { institutionId: id },
    { $pull: { responsibles: { email } } }
  );

  return res.status(200).json({ message: "Responsible removed successfully." });
});

router.post('/:applicationId/uploadApplicationFiles', upload.array('files'), async (req, res) => { //Upload files for a program's application
  const { applicationId } = req.params;
  const collection = db.collection('applications');

  const allowedHeaders = { pdfHeader, rtfHeader };
  //get existing fileIds to generate unique ids
  const existingFiles = await collection.findOne({ applicationId }, { files: 1 });
  let existingFileIds = [];
  if (existingFiles && existingFiles.files)
    existingFileIds = existingFiles.files.map(file => file.fileId);

  const links = JSON.parse(req.body.links);
  const filters = JSON.parse(req.body.filters);

  let error = {};
  let newFiles = [];
  if (req.files.length > 0) {
    //filter allowed files by headers
    const validFiles = await filterFilesByHeader(req.files, allowedHeaders);
    //check how many files were filtered out
    if (req.files.length !== validFiles.length)
      error.files = `Couldn't upload ${req.files.length - validFiles.length} file(s).`;
    if (validFiles.length > 0) {
      newFiles = validFiles.map(file => {
        const fileId = generateFileId(existingFileIds);
        return {
          fileId,
          fileName: file.originalname,
          filePath: file.path,
          eligiblePositions: filters.eligiblePositions,
          steps: filters.steps
        };

      });
    }
  }

  if (links.length > 0) {
    //upload files from link and do same 
    for (const link of links) {
      await downloadFile(link.url, './uploads/')
        .then((filePath) => {
          console.log(`File downloaded successfully to ${filePath}`);
          const fileId = generateFileId(existingFileIds);
          newFiles.push({
            fileId,
            fileName: link.name,
            filePath,
            eligiblePositions: filters.eligiblePositions,
            steps: filters.steps
          });
        })
        .catch((err) => console.error(err));
    }
  }


  //update application documents with the new files
  const result = await collection.updateOne(
    { applicationId },
    { $push: { files: { $each: newFiles } } }
  );

  if (result.modifiedCount === 1) {
    res.json({ files: newFiles, error });
  } else {
    res.status(500).json(error);
  }
});

router.post('/:applicationId/deleteApplicationFile', async (req, res) => { //Delete a file added by an institution for a program's application
  const { applicationId } = req.params;
  const collection = db.collection('applications');
  const fileToDelete = req.body;

  try {
    const program = await collection.findOne({ applicationId });

    if (!program) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const file = program.files.find(f => f.fileId === fileToDelete.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    const filePath = file.filePath;
    //delete the file from the filesystem
    await fs.promises.unlink(filePath);

    //delete the file from the database
    const result = await collection.updateOne(
      { applicationId },
      { $pull: { files: { fileId: fileToDelete.fileId } } }
    );

    if (result.modifiedCount === 1) {
      res.send('File deleted successfully');
    } else {
      return res.status(500).json({ error: 'Error while deleting file' });
    }
  } catch (error) {
    res.status(500).json({});
  }
});

module.exports = router;
