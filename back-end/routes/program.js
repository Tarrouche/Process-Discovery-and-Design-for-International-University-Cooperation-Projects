const express = require('express');
const router = express.Router();
const fs = require('fs');
const { client, validateRequest, requireProgramResponsible, downloadFile, generateFileId, requireAdmin, generateId, requireLogin } = require('../db');
const { upload, rtfHeader, pdfHeader, filterFilesByHeader } = require('./upload');
const Joi = require('joi');
const xss = require('xss');

const db = client.db('test');
const allowedTypes = ["Research", "Teaching"];
const transferOptions = ["Required", "Possible", "Not allowed"];
const locationOptions = ["International", "Partner Countries", "Participating Institutions"];
const applicantOptions = ['Institution', 'User'];
const applicationMethods = ['Mail', 'Post', 'Platform'];
const callsStates = ['Required', 'Available', 'Not Available'];
const modulesStates = ['Available', 'Not Available'];
const reportsStates = ['Required', 'Not Required'];
const frequencyOptions = { reportTypes: ['every', 'after', 'before'], finalReportTypes: ['within'], units: ['weeks', 'months'] };
const applicationTimeOptions = ['During Application', 'During Program', 'Both'];

//Allowing only authorized users using requireAdmin/requireProgramResponsible.
//When user input is displayed to other users, it is validated using Joi.
//For strings, sanitization is also required.

router.get("/", async (req, res) => { //Get programs
    const programs = await db.collection("programs").find({}).toArray();
    res.send({ message: programs })
});

router.post('/create', requireAdmin, async (req, res) => { //Create a program
    const collection = db.collection('programs');
    const id = await generateId(collection);
    await collection.insertOne({ programId: id, ...req.body, responsibles: [], createdAt: new Date() });
    res.status(200).json({ programId: id });
});

router.get('/:id', async (req, res) => { //Get program by id
    const id = req.params.id;
    const collection = db.collection('programs');
    const result = await collection.findOne(
        { programId: id },
        { projection: { _id: 0 } }
    );
    res.status(200).json(result);
});

router.get("/:id/applications", async (req, res) => { //Get program applications (added by institutions)
    const id = req.params.id;
    const applications = await db.collection("applications").find({ programId: id }).toArray();
    res.send({ message: applications })
});

router.post('/:id/apply', requireLogin, async (req, res) => { //Apply for program by id
    const id = req.params.id;
    const userId = req.session.user.userId;

    const programsCollection = db.collection('programs');
    const usersCollection = db.collection('users');

    try {
        //find the program by programId
        const program = await programsCollection.findOne({ programId: id });

        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }

        //create a process instance in CPEE
        const url = 'https://cpee.org/flow/engine/';
        const formData = new FormData();
        formData.append('info', 'example');

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            console.error('Failed create instance for process: ' + response.status);
            return res.status(500).json({ error: 'Failed to create process instance' });
        }

        const instanceId = await response.json();

        //load XML in process instance
        const data = await fs.promises.readFile('cpee.xml', 'utf8');
        //update userId and programId
        const updatedData = data
            .replace('<userId>0xdead</userId>', `<userId>${userId}</userId>`)
            .replace('<programId>0xdead</programId>', `<programId>${id}</programId>`);

        const payload = updatedData;

        //set model in CPEE
        const patchResponse = await fetch(url + `${instanceId}/properties/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'text/xml',
                'Content-ID': 'properties',
                'CPEE-Event-Source': instanceId
            },
            body: payload
        });

        if (!patchResponse.ok) {
            console.error('Failed to load XML in process instance: ' + patchResponse.status);
            return res.status(500).json({ error: 'Failed to load XML in process instance' });
        }

        //update process state to 'running'
        const statePayload = 'value=running';
        const putResponse = await fetch(url + `${instanceId}/properties/state/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: statePayload
        });

        if (!putResponse.ok) {
            console.error('Failed to update process state: ' + putResponse.status);
            return res.status(500).json({ error: 'Failed to update process state' });
        }

        let newApplication = { programId: id, currentStep: 0, cpee: instanceId };
        if (program.transfer === 'Not allowed' || !program.transfer) {
            newApplication.callback = { step: 'prepare_application' };
        } else if (program.transfer === 'Required') {
            newApplication.callback = { step: 'supervisor_approval' };
            newApplication.transfer = true;
        } else {
            newApplication.callback = { step: 'initialization' };
        }

        //update user's applications
        const updateResult = await usersCollection.updateOne(
            { userId: userId },
            { $push: { applications: newApplication } }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: newApplication });

    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

router.post('/:id/nextStep', async (req, res) => { //Next step in an application (not activity)
    const id = req.params.id;
    const userId = req.session.user.userId; // Assuming userId is present in req.session.user
    const usersCollection = db.collection('users');

    try {
        //find the user by userId
        const user = await usersCollection.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        //find the application by programId
        const application = user.applications.find(app => app.programId === id);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        //increment currentStep
        application.currentStep++;

        //update user's applications
        const updateResult = await usersCollection.updateOne(
            { userId },
            { $set: { applications: user.applications } }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(500).json({ error: 'Failed to update application' });
        }

        req.session.user.applications = user.applications;

        res.status(200).json({ message: application });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const setProgramSchema = Joi.object({
    applicant: Joi.string().valid(...applicantOptions).allow(''),

    applicationForm: Joi.object({
        method: Joi.string().valid(...applicationMethods).allow(''),
        endpoint: Joi.string().allow('').custom((value, helpers) => {
            const sanitizedValue = xss(value);
            return sanitizedValue;
        })
    }),

    calls: Joi.object({
        state: Joi.string().valid(...callsStates).allow(''),
        source: Joi.string().allow('').custom((value, helpers) => {
            const sanitizedValue = xss(value);
            return sanitizedValue;
        })
    }),

    modules: Joi.object({
        state: Joi.string().valid(...modulesStates).allow(''),
        modules: Joi.array().items(Joi.object({
            name: Joi.string().allow('').custom((value, helpers) => {
                const sanitizedValue = xss(value);
                return sanitizedValue;
            }),
            applicationTime: Joi.string().valid(...applicationTimeOptions).allow('')
        }))
    }),

    reports: Joi.object({
        state: Joi.string().valid(...reportsStates).allow(''),
        frequency: Joi.object({
            type: Joi.string().valid(...frequencyOptions.reportTypes).allow(''),
            n: Joi.number().integer(),
            unit: Joi.string().valid(...frequencyOptions.units).allow(''),
        })
    }),

    finalReport: Joi.object({
        state: Joi.string().valid(...reportsStates).allow(''),
        frequency: Joi.object({
            type: Joi.string().valid(...frequencyOptions.finalReportTypes).allow(''),
            n: Joi.number().integer().min(1).max(11),
            unit: Joi.string().valid(...frequencyOptions.units).allow(''),
        })
    }),

    steps: Joi.array().items(Joi.object({
        title: Joi.string().required().custom((value, helpers) => {
            const sanitizedValue = xss(value);
            return sanitizedValue;
        }),
        description: Joi.array().items(Joi.string().allow('')),
        deadline: Joi.string().allow(''),
        condition: Joi.string().allow('')
    }))

});

router.post('/:id/settings', requireProgramResponsible, async (req, res) => { //Set program by id
    const id = req.params.id;
    const { error, value } = setProgramSchema.validate(req.body);
    if (error) {
        console.log(error.details);
        return res.status(400).send({ message: 'Not allowed!' });
    }
    const collection = db.collection('programs');

    // setting the given changes
    const upd = await collection.updateOne(
        { programId: id },
        { $set: { ...value, updatedAt: new Date() } }
    );

    console.log(`SET PROGRAM ${id}`);

    //DB error
    if (!upd.acknowledged) {
        return res.status(400).json({ message: 'Something went wrong' });
    }

    //programId not found
    if (upd.deletedCount === 0) {
        return res.status(400).json({ message: 'Does not exist' });
    }

    res.status(200).json({ message: 'Acknowledged' });
});

const editProgramSchema = Joi.object({
    offerer: Joi.string().allow('').custom((value, helpers) => {
        const sanitizedValue = xss(value);
        return sanitizedValue;
    }),

    title: Joi.string().allow('').custom((value, helpers) => {
        const sanitizedValue = xss(value);
        return sanitizedValue;
    }),

    typeOfProgram: Joi.array()
        .items(Joi.string().valid(...allowedTypes)),

    website: Joi.string().uri({ scheme: ['http', 'https'] }).allow(''),

    logo: Joi.string().uri({ scheme: ['http', 'https'] }).allow(''),

    funded: Joi.object({
        funded: Joi.boolean().required(),
        period: Joi.object({
            start: Joi.string().allow(''),
            end: Joi.string().allow('')
        }),
        fundingRequirements: Joi.array().items(
            Joi.string().allow('').custom((value, helpers) => {
                const sanitizedValue = xss(value);
                return sanitizedValue;
            })
        ),
        fundingAllowances: Joi.array().items(
            Joi.string().allow('').custom((value, helpers) => {
                const sanitizedValue = xss(value);
                return sanitizedValue;
            })
        )
    }),

    transfer: Joi.string().valid(...transferOptions).allow(''),

    applicationPeriod: Joi.object({
        start: Joi.string().allow(''),
        end: Joi.string().allow('')
    }),

    eligiblePositions: Joi.object({
        PhD: Joi.boolean().required(),
        PostDoc: Joi.boolean().required(),
        Professorship: Joi.boolean().required(),
    }),

    location: Joi.object({
        from: Joi.object({
            state: Joi.string().valid(...locationOptions).allow(''),
            countries: Joi.array().items(Joi.object({
                country: Joi.string().allow(''),
                conditions: Joi.array().items(
                    Joi.string().allow('').custom((value, helpers) => {
                        const sanitizedValue = xss(value);
                        return sanitizedValue;
                    }))
            }))
        }),
        to: Joi.object({
            state: Joi.string().valid(...locationOptions).allow(''),
            countries: Joi.array().items(Joi.object({
                country: Joi.string().allow(''),
                conditions: Joi.array().items(
                    Joi.string().allow('').custom((value, helpers) => {
                        const sanitizedValue = xss(value);
                        return sanitizedValue;
                    }))
            }))
        })
    }),

    partnerInstitutions: Joi.object()
});

router.post('/:id/edit', requireProgramResponsible, async (req, res) => { //Edit program by id
    const id = req.params.id;
    const { error, value } = editProgramSchema.validate(req.body);
    if (error) {
        console.log(error.details);
        return res.status(400).send({ message: 'Not allowed!' });
    }
    const collection = db.collection('programs');

    const upd = await collection.updateOne(
        { programId: id },
        { $set: { ...value, updatedAt: new Date() } }
    );
    if (value.participatingInstitutions) {
        for (let institution of value.participatingInstitutions) {
            await db.collection('applications').updateOne(
                { applicationId: institution.applicationId },
                { $set: { programConfirmed: institution.programConfirmed, updatedAt: new Date() } }
            );
            await db.collection('institutions').updateOne(
                { programs: { $elemMatch: { applicationId: institution.applicationId } } },
                { $set: { "programs.$.programConfirmed": institution.programConfirmed, "programs.$.updatedAt": new Date() } }
            );

        }
    }

    console.log(`EDIT PROGRAM ${id}`);

    if (!upd.acknowledged) {
        return res.status(400).json({ message: 'Something went wrong' });
    }

    if (upd.deletedCount === 0) {
        return res.status(400).json({ message: 'Does not exist' });
    }

    res.status(200).json({ message: 'Acknowledged' });
});

router.post('/:id/uploadFiles', requireProgramResponsible, upload.array('files'), async (req, res) => { //Upload program documents
    const id = req.params.id;
    const collection = db.collection('programs');

    const allowedHeaders = { pdfHeader, rtfHeader };
    //get fileIds to generate unique ids
    const existingFiles = await collection.findOne({ programId: id }, { files: 1 });
    const existingFileIds = existingFiles.files.map(file => file.fileId);

    const links = JSON.parse(req.body.links);
    const filters = JSON.parse(req.body.filters);

    let error = {};
    let newFiles = [];

    if (req.files.length > 0) {
        //filter the allowed file types by header
        const validFiles = await filterFilesByHeader(req.files, allowedHeaders);
        if (validFiles.length !== req.files.length)
            error.files = `Couldn't upload ${req.files.length - validFiles.length} file(s).`;
        if (validFiles.length > 0) {
            //prepare DB values
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

    //update program documents with the new files
    const result = await collection.updateOne(
        { programId: id },
        { $push: { files: { $each: newFiles } } }
    );

    if (result.modifiedCount === 1) {
        res.json({ files: newFiles, error });
    } else {
        res.status(500).json(error);
    }
});

router.post('/:id/deleteFile', requireProgramResponsible, async (req, res) => { //Delete a program document
    const id = req.params.id;
    const collection = db.collection('programs');
    const fileToDelete = req.body;

    try {
        const program = await collection.findOne({ programId: id });

        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }

        const file = program.files.find(f => f.fileId === fileToDelete.fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        const filePath = file.filePath;

        //delete the file from the file system
        await fs.promises.unlink(filePath);

        //delete the file from the database
        const result = await collection.updateOne(
            { programId: id },
            { $pull: { files: { fileId: fileToDelete.fileId } } }
        );

        if (result.modifiedCount === 1) {
            res.send('File deleted successfully');
        } else {
            res.status(500).json({ error: 'Error while deleting file' });
        }
    } catch (error) {
        res.status(500).json({});
    }
});

const responsibleSchema = Joi.object({
    responsible: Joi.string().required()
});

router.post("/:id/responsibles/add", requireProgramResponsible, async (req, res) => { //Add a program's responsible
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

    const program = await db.collection("programs").findOne({ programId: id });
    if (!program) {
        return res.status(400).json({ message: "Program not found." });
    }

    if (program.responsibles.some(responsible => responsible.email === email)) {
        return res.status(400).json({ error: "User already responsible." });
    }

    await db.collection("programs").updateOne(
        { programId: id },
        { $push: { responsibles: { userId: user.userId, email } } }
    );

    return res.status(200).json({ message: "Responsible added successfully." });
});

router.post("/:id/responsibles/remove", requireProgramResponsible, async (req, res) => { //Remove a program's responsible
    const id = req.params.id;
    const { error, value } = responsibleSchema.validate(req.body);
    if (error) {
        return res.status(400).send({ message: 'Not allowed!' });
    }

    const email = value.responsible;
    const program = await db.collection("programs").findOne({ programId: id });

    if (!program) {
        return res.status(400).json({ message: "Program not found." });
    }

    if (!program.responsibles.some(responsible => responsible.email === email)) {
        return res.status(400).json({ message: "Responsible not found in program." });
    }

    await db.collection("programs").updateOne(
        { programId: id },
        { $pull: { responsibles: { email } } }
    );

    return res.status(200).json({ message: "Responsible removed successfully." });
});

router.post("/:id/applications/:application/application", async (req, res) => {
    const { id, application } = req.params;
    await db.collection("applications").updateOne({ applicationId: application }, { $set: { programConfirmed: false } })
        .then(() => {
            res.send({
                message: "Application has been updated"
            });
        })
        .catch(err => {
            console.error(`Something went wrong: ${err}`);
            res.status(500).send({
                message: "Error while deleting applications"
            });
        });

});



module.exports = router;