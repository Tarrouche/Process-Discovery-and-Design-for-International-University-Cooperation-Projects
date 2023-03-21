const express = require('express');
const router = express.Router();
const { client, validateRequest, requireResponsible } = require('../db');

/*
{
    _id,
    programId,
    name,
    location,
    logo,
    typeOfProgram: [ ],
    funded: {
      funded: ,
      fundingRequirements: [],
      fundingAllowances: []
    },
    createdAt: ,
    updatedAt: 
  }
*/

router.get('/:id', async (req, res) => { // Get program by id
    const id = req.params.id;

    const db = client.db('test');
    const collection = db.collection('programs');

    const result = await collection.findOne(
        { programId: id },
        { projection: { name: 1, location: 1, website: 1, logo: 1, typeOfProgram: 1, responsibles: 1, funded: 1, _id: 0 } }
    );
    res.status(200).json(result);
});

router.post('/:id/settings', requireResponsible, async (req, res) => { // Set program by id
    const id = req.params.id;

    let requestValid = validateRequest(req.body, ['responsibles'], true);
    for (let i = 0; i < req.body.responsibles.length && requestValid; i++) {
        const item = req.body.responsibles[i];
        if (!validateRequest(item, ['userId', 'email'], true)) {
            requestValid = false;
            break;
        }
    }


    if (!requestValid) {
        return res.status(400).json({ message: 'Invalid Body' });
    }

    const db = client.db('test');
    const collection = db.collection('programs');

    // setting the given changes
    const upd = await collection.updateOne(
        { programId: id },
        { $set: { ...req.body, updatedAt: new Date() } }
    );

    console.log(`SET PROGRAM ${id}`);
    //console.log(req.body);

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

router.post('/:id/edit', async (req, res) => { // Edit program by id
    const id = req.params.id;
    const requestValid = validateRequest(req.body, ['name', 'location', 'typeOfProgram', 'funded', 'logo'], true);

    if (!requestValid) {
        return res.status(400).json({ message: 'Invalid Body' });
    }

    const db = client.db('test');
    const collection = db.collection('programs');

    const upd = await collection.updateOne(
        { programId: id },
        { $set: { ...req.body, updatedAt: new Date() } }
    );

    console.log(`EDIT PROGRAM ${id}`);
    //console.log(req.body);

    if (!upd.acknowledged) {
        return res.status(400).json({ message: 'Something went wrong' });
    }

    if (upd.deletedCount === 0) {
        return res.status(400).json({ message: 'Does not exist' });
    }

    res.status(200).json({ message: 'Acknowledged' });
});

module.exports = router;