const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid'); // ID Generator
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');


const uri = 'mongodb://myUserAdmin:1Tarrouche@127.0.0.1:27017/';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//initialize the connection pool used by other scripts
client.connect().then(() => {
    console.log(`Connected to MongoDB`)
});

function validateRequest(reqBody, allowedKeys, lessOrEqual) { //Validate the keys in req.body ({}), use Joi instead
    const bodyKeys = Object.keys(reqBody);

    if (lessOrEqual) { //keys can be less than required
        return bodyKeys.every(key => allowedKeys.includes(key));
    } else {
        return bodyKeys.length === allowedKeys.length &&
            bodyKeys.every(key => allowedKeys.includes(key));
    }
}

async function downloadFile(url, outputDir) { //Download a file using URL in the filesystem
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download file from ${url}: ${response.status} ${response.statusText}`);
    }

    const contentDispositionHeader = response.headers.get('content-disposition');
    const fileNameMatch = contentDispositionHeader && contentDispositionHeader.match(/filename="?(.+)"?/);

    const fileName = fileNameMatch ? fileNameMatch[1] : path.basename(url);
    const outputPath = path.join(outputDir, fileName);

    const dest = fs.createWriteStream(outputPath);
    return new Promise((resolve, reject) => {
        response.body.pipe(dest);
        response.body.on('error', (err) => {
            reject(new Error(`Failed to download file from ${url}: ${err.message}`));
        });
        dest.on('finish', () => {
            resolve(outputPath);
        });
        dest.on('error', (err) => {
            reject(new Error(`Failed to write file to ${outputPath}: ${err.message}`));
        });
    });
}

async function generateId(collection) { //Generate a unique ID in the collection given in the params
    let userId;
    let res;
    do {
        userId = uuidv4(); // Generate a random UUID
        res = await collection.findOne({ userId: userId });
    } while (res); // Loop until a unique ID is found
    return userId;
}

const requireLogin = async (req, res, next) => { //User must be logged in
    const user = req.session.user;
    if (!user) {
        return res.status(403).json({ message: 'Authentication required' });
    }
    next();
}

const requireAdmin = async (req, res, next) => { //User must be admin
    const user = req.session.user;
    if (!user) {
        return res.status(403).json({ message: 'Authentication required' });
    }

    const db = client.db('test');
    const collection = db.collection('users');
    const dbUser = await collection.findOne({
        userId: user.userId
    });
    if (dbUser && dbUser.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'You are not authorized to perform this action' });
    }
};

const requireAdminOrResponsible = async (req, res, next) => { // Check in users collection whether user is admin
    const user = req.session.user;
    if (!user) {
        return res.status(403).json({ message: 'Authentication required' });
    }

    const db = client.db('test');
    const collection = db.collection('users');
    const dbUser = await collection.findOne({
        userId: user.userId
    });
    if (dbUser && (dbUser.role === 'Admin' || dbUser.role === 'Responsible')) {
        // The user has admin role, continue to the next middleware or route handler
        next();
    } else {
        // The user does not have admin role, send a 403 Forbidden error
        res.status(403).json({ message: 'You are not authorized to perform this action' });
    }
};

const requireInstitutionResponsible = async (req, res, next) => { //Check whether the user is responsible or admin
    const user = req.session.user;
    if (!user) {
        return res.status(403).json({ message: 'Authentication required' });
    }
    const db = client.db('test');
    const institutionsCollection = db.collection('institutions');
    const usersCollection = db.collection('users');

    const dbUser = await usersCollection.findOne({
        userId: user.userId
    });
    const institution = await institutionsCollection.findOne({
        institutionId: req.params.id
    });
    if (!institution) {
        return res.status(400).json({ message: 'Institution not found' });
    }

    const isResponsible = institution.responsibles.some((r) => r.userId === req.session.user.userId);

    if (isResponsible || (dbUser && dbUser.role === 'Admin')) {
        // The user is a responsible or has admin role, continue to the next middleware or route handler
        next();
    } else {
        // Not authorized
        return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }
};

const requireProgramResponsible = async (req, res, next) => { //Check whether the user is responsible or admin
    const user = req.session.user;
    if (!user) {
        return res.status(403).json({ message: 'Authentication required' });
    }
    const db = client.db('test');
    const programsCollection = db.collection('programs');
    const usersCollection = db.collection('users');

    const dbUser = await usersCollection.findOne({
        userId: user.userId
    });
    const program = await programsCollection.findOne({
        programId: req.params.id
    });

    if (!program) {
        return res.status(400).json({ message: 'Program not found' });
    }

    const isResponsible = program.responsibles.some((r) => r.userId === req.session.user.userId);

    if (isResponsible || (dbUser && dbUser.role === 'Admin')) {
        // The user is a responsible or has admin role, continue to the next middleware or route handler
        next();
    } else {
        // Not authorized
        return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }
};

function generateFileId(existingFileIds) {
    let fileId = uuidv4();
    while (existingFileIds.includes(fileId)) {
        fileId = uuidv4();
    }
    return fileId;
}

// Export the connection pool and other need functions
module.exports = { client, validateRequest, generateId, requireLogin, requireAdmin, requireAdminOrResponsible, requireProgramResponsible, requireInstitutionResponsible, downloadFile, generateFileId };