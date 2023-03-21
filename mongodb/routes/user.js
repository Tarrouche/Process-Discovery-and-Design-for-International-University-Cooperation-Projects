const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Password Hashing
const { client, validateRequest, requireAdmin } = require('../db');
const allowedRoles = ['Applicant', 'Admin', 'Responsible'];


router.get('/', (req, res) => { // Get user session
    if (req.session.user) {
        res.status(200).json(req.session.user);
    } else {
        res.status(200);
    }
});

router.post('/login', async (req, res) => { // Login req.session.user === { userId, name, email, role}
    const requestValid = validateRequest(req.body, ['email', 'password'], false);

    if (requestValid) {
        const { email, password } = req.body;
        const db = client.db('test');
        const collection = db.collection('users');
        // Find the user by email
        const user = await collection.find({ email: email })
            .project({
                userId: 1, email: 1, password: 1, firstName: 1, lastName: 1, role: 1,
                _id: 0
            })
            .toArray();

        // If the user does not exist, return an error
        if (user.length === 0) {
            return res.status(401).json({ message: 'No account registered with that email' });
        }

        // Compare the password hash with the provided password
        const match = await bcrypt.compare(password, user[0].password);

        // If the passwords don't match, return an error
        if (!match) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const id = user[0].userId;
        console.log(`LOGGED IN ${id}`)
        // Set the user's session
        req.session.user = {
            userId: id,
            email: email,
            name: user[0].firstName + ' ' + user[0].lastName,
            role: user[0].role
        };
        req.session.save();

        res.status(200).json({ message: req.session.user });
    } else {
        res.status(400).json({ message: 'Not allowed' });
    }
});

router.post('/logout', (req, res) => { // Logout
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

router.post('/role', requireAdmin, async (req, res) => { // Set user role
    const { id, role } = req.body;
    // Validate the given role
    if (allowedRoles.includes(role)) {

        const db = client.db('test');
        const collection = db.collection('users');
        const upd = await collection.updateOne({ userId: id }, { $set: { role: role } });
        console.log('user role set');
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