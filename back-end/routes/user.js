const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Password Hashing
const { client, validateRequest, requireLogin, requireAdmin, generateFileId, generateId } = require('../db');
const { upload, pdfHeader, rtfHeader, filterFilesByHeader, generateKey, encryptFile, decryptFile } = require('./encryptedUpload');
const crypto = require('crypto');
const fs = require('fs');
const Joi = require('joi');
const saltRounds = 10; // password hashing

const db = client.db('test');

const allowedRoles = ['Applicant', 'Admin', 'Responsible'];

router.post('/create', async (req, res) => { //Create a user
    const collection = db.collection('users');
    const user = await collection.findOne({ email: req.body.email });
    if (user) {
        return res.status(401).json({ message: 'Email already used' });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds); // Hash the password
    req.body.password = ''; //Only password's hash is stored
    const id = await generateId(collection);
    await collection.insertOne({ userId: id, ...req.body, password: hashedPassword, role: 'Applicant', applications: [], createdAt: new Date() });
    res.status(200).json({ userId: id });
});

router.post('/upload', requireLogin, upload.array('files'), async (req, res) => { //Upload + Encrypt a file during application process
    const collection = db.collection('users');
    const password = req.body.password;
    let newFiles = [];
    const salt = crypto.randomBytes(16);
    const iterations = 100000;

    const user = await collection.findOne({ userId: req.session.user.userId }, { filesPassword: 1, files: 1 });
    if (user.filesPassword) { //if user already has set a password
        const match = await bcrypt.compare(password, user.filesPassword);
        //if the passwords don't match, return an error
        if (!match) {
            return res.status(401).json({ message: 'Wrong files password' });
        }
    } else {
        //store the new password's hash
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await collection.updateOne(
            { userId: req.session.user.userId },
            { $set: { filesPassword: hashedPassword } }
        )
    }

    //get existing fileIds to generate unique ones
    let existingFileIds = [];
    if (user && user.files)
        existingFileIds = user.files.map(file => file.fileId);

    //encrypt the files, and delete the original files
    req.files.forEach(file => {
        const key = generateKey(password, salt, iterations);
        encryptFile(file.path, key);
    });

    newFiles = req.files.map(file => {
        const fileId = generateFileId(existingFileIds);
        return {
            fileId,
            fileName: file.originalname + '.enc',
            filePath: file.path + '.enc',
            programId: req.body.programId,
            step: req.body.step,
            salt,
            iterations
        };

    });

    //updata user's document with the new files
    const result = await collection.updateOne(
        { userId: req.session.user.userId },
        { $push: { files: { $each: newFiles } } }
    );

    if (result.modifiedCount === 1) {
        res.json({ files: newFiles });
    } else {
        res.status(500).json();
    }
});

router.post('/download/:fileId', requireLogin, async (req, res) => { //Decrypt + Download a file
    try {
        const fileId = req.params.fileId;
        const collection = db.collection('users');
        const user = await collection.findOne({ userId: req.session.user.userId });

        const match = await bcrypt.compare(req.body.password, user.filesPassword);
        //if the passwords don't match, return an error
        if (!match) {
            return res.status(401).json({ message: 'Wrong files password' });
        }

        //find the file by its ID in the user's files array
        const file = user.files.find(file => file.fileId === fileId);
        if (!file) {
            return res.status(404).send('File not found');
        }
        const key = generateKey(req.body.password, file.salt.buffer, file.iterations);
        await decryptFile(file.filePath, key); //file is now at file.filePath + '.dec'

        //send the decrypted file to the user for download
        res.download(file.filePath.replace('.enc', ''), file.fileName.replace('.enc', ''), err => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
            } else {
                //delete the decrypted file after it has been sent to the user
                fs.unlink(file.filePath.replace('.enc', ''), err => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


router.get('/files/:programId', requireLogin, async (req, res) => { //Get user uploaded files for a program/application
    const collection = db.collection('users');
    const user = await collection.findOne({ userId: req.session.user.userId });
    let data = [];
    if (user.files) {
        const files = user.files.filter(file => file.programId === req.params.programId);
        data = files.map(file => ({
            fileId: file.fileId,
            fileName: file.fileName,
            step: file.step
        }));
    }
    res.status(200).json(data);
});

router.get('/', requireLogin, async (req, res) => { //Get user session
    res.status(200).json(req.session.user);
});

router.get('/applications', requireLogin, async (req, res) => { //Get user's applications
    const collection = db.collection('users');
    const user = await collection.findOne({ userId: req.session.user.userId });
    res.status(200).json(user.applications);
});

router.get('/application/:id', requireLogin, async (req, res) => { //Get an application by id
    const collection = db.collection('users');
    const user = await collection.findOne({ userId: req.session.user.userId });
    const application = user.applications.find(app => app.programId === req.params.id);
    if (application) {
        res.status(200).json(application);
    } else {
        res.status(404).json({ message: 'Application not found' });
    }
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

router.post('/login', async (req, res) => { //Login 
    /*const { error, value } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).send({ message: 'Not allowed!' });
    }*/

    const { email, password } = req.body;//value;
    const collection = db.collection('users');
    //find the user by email
    const user = await collection.find({ email: email })
        .project({
            userId: 1, email: 1, password: 1, firstName: 1, lastName: 1, role: 1, nationality: 1, institution: 1,
            _id: 0
        })
        .toArray();

    //if the user does not exist, return an error
    if (user.length === 0) {
        return res.status(401).json({ message: 'No account registered with that email' });
    }

    //compare the password hash with the provided password
    const match = await bcrypt.compare(password, user[0].password);

    //if the passwords don't match, return an error
    if (!match) {
        return res.status(401).json({ message: 'Authentication failed' });
    }
    const id = user[0].userId;
    console.log(`LOGGED IN ${id}`)
    //set the user's session
    req.session.user = {
        userId: id,
        email: email,
        name: user[0].firstName + ' ' + user[0].lastName,
        role: user[0].role,
        institution: user[0].institution,
        nationality: user[0].nationality
    };
    req.session.save();

    res.status(200).json({ message: req.session.user });
});

router.post('/logout', requireLogin, (req, res) => { // Logout
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`LOGGED OUT`)
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.redirect('https://snorlax.wtf/'); // Redirect to the homepage
        }
    });
});

const setRoleSchema = Joi.object({
    id: Joi.string().required(),
    role: Joi.string().valid(...allowedRoles).required()
});

router.post('/role', requireAdmin, async (req, res) => { // Set user role
    const { error, value } = setRoleSchema.validate(req.body);
    if (error) {
        return res.status(400).send({ message: 'Not allowed!' });
    }

    const collection = db.collection('users');
    const upd = await collection.updateOne({ userId: value.id }, { $set: { role: value.role } });

    if (!upd.acknowledged) {
        res.status(400).json({ message: 'Something went wrong' });
    } else if (upd.deletedCount == 0) {
        res.status(400).json({ message: 'Doesn\'t exist' });
    } else {
        res.status(200).json({ message: 'Acknowleged' });
    }
});

module.exports = router;