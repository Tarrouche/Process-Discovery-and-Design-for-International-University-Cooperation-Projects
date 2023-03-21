const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid'); // ID Generator

const uri = 'mongodb://myUserAdmin:1Tarrouche@127.0.0.1:27017/';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Initialize the connection pool
client.connect().then(() => {
    console.log(`Connected to MongoDB`)
});

function validateRequest(reqBody, allowedKeys, lessOrEqual) { // Validate the keys in req.body ({})
    const bodyKeys = Object.keys(reqBody);

    if (lessOrEqual) { // Keys can be less than required
        return bodyKeys.every(key => allowedKeys.includes(key));
    } else {
        return bodyKeys.length === allowedKeys.length &&
            bodyKeys.every(key => allowedKeys.includes(key));
    }
}

async function generateId(collection) { // Generate a unique ID in the collection given in the params
    let userId;
    let res;
    do {
        userId = uuidv4(); // Generate a random UUID
        res = await collection.findOne({ userId: userId });
    } while (res); // Loop until a unique ID is found
    return userId;
}

const requireAdmin = async (req, res, next) => { // Check in users collection whether user is admin
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
        // The user has admin role, continue to the next middleware or route handler
        next();
    } else {
        // The user does not have admin role, send a 403 Forbidden error
        res.status(403).json({ message: 'You are not authorized to perform this action' });
    }
};


const requireResponsible = async (req, res, next) => { //Check in programs collection whether user is included as responsible
    const db = client.db('test');
    const collection = db.collection('programs');
    const program = await collection.findOne({
        programId: req.params.id
    });

    if (!program) {
        return res.status(400).json({ message: 'Program not found' });
    }

    const isResponsible = program.responsibles.some((r) => r.userId === req.session.user.userId);

    if (!isResponsible) {
        return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }

    next();
};


// Export the connection pool and other need functions
module.exports = { client, validateRequest, generateId, requireAdmin, requireResponsible };