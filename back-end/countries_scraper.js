const axios = require('axios');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://myUserAdmin:1Tarrouche@127.0.0.1:27017/';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Initialize the connection pool
client.connect().then(async () => {
    console.log(`Connected to MongoDB`);
    const db = client.db('test');

    const countriesCollection = db.collection("countries");
    const nationalitiesCollection = db.collection("nationalities");

    countriesCollection.deleteMany({})
        .then(result => {
            console.log(`Deleted ${result.deletedCount} documents`);
        })
        .catch(err => {
            console.error(`Error deleting documents: ${err}`);
        });

    const url = 'https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_area';

    await axios.get(url)
        .then(async response => {
            const $ = cheerio.load(response.data);
            const table = $('table.wikitable.sortable').eq(0);
            const rows = table.find('tbody tr');
            const docs = [];

            rows.each(async (i, row) => {
                const columns = $(row).find('td');

                const rankText = columns.eq(0).text().trim();
                let country;
                let rank;
                if (rankText === '–') {
                    //Here we can handle countries which aren't sovereign states
                    //country = columns.eq(1).text().trim().replace(/\s*\([^)]*\)/, '');
                } else {
                    rank = parseInt(rankText, 10);
                    country = columns.eq(1).text().trim().replace(/\[[^\]]*\]/g, '');
                    // If rank is not found in first column, check second column
                    if (isNaN(rank)) {
                        rank = parseInt(columns.eq(1).text().trim(), 10);
                        country = columns.eq(0).text().trim().replace(/\[[^\]]*\]/g, '');
                    }
                }

                if ((rankText === '–' || Number.isInteger(rank)) && country) {
                    let tmp;
                    if (country === 'East Timor') {
                        tmp = { country, alt: 'Timor-Leste' };
                    } else if (country === 'DR Congo') {
                        tmp = { country, alt: 'Democratic Republic of the Congo' };
                    } else if (country === 'Congo') {
                        tmp = { country, alt: 'Republic of the Congo' };
                    } else if (country === 'Ivory Coast') {
                        tmp = { country, alt: 'Côte d\'Ivoire' };
                    } else if (country === 'United Kingdom') {
                        tmp = { country, alt: 'United Kingdom and Crown dependencies' };
                    } else if (country === 'United States') {
                        tmp = { country, alt: 'United States and territories' };
                    } else if (country === 'France') {
                        tmp = { country, alt: 'France and territories' };
                    } else if (country === 'Australia') {
                        tmp = { country, alt: 'Australia and territories' };
                    } else if (country === 'New Zealand') {
                        tmp = { country, alt: 'New Zealand and territories' };
                    } else if (country === 'Denmark') {
                        tmp = { country, alt: 'Denmark and territories' };
                    } else if (country === 'Netherlands') {
                        tmp = { country, alt: 'Netherlands and territories' };
                    } else if (country === 'China') {
                        tmp = { country, alt: 'China and territories' };
                    } else if (country === 'Cape Verde') {
                        tmp = { country, alt: 'Cabo Verde' };
                    } else if (country === 'Micronesia') {
                        tmp = { country, alt: 'Federated States of Micronesia' };
                    } else if (country === 'Turkey') {
                        tmp = { country, alt: 'Türkiye' };
                    } else {
                        tmp = { country };
                    }

                    docs.push(tmp);
                }
            });


            await countriesCollection.insertMany(docs.sort((a, b) => a.country.localeCompare(b.country)))
                .then(() => {
                    console.log(`Added documents to countries collection`);
                })
                .catch(error => {
                    console.log(`Error adding documents to countries collection: ${error}`);
                });

            let countriesList = [];
            await countriesCollection.find().toArray()
                .then(docs => {
                    console.log(`Found ${docs.length} documents in countries collection:`);
                    countriesList = docs;
                })
                .catch(err => {
                    console.error(`Error finding documents in countries collection: ${err}`);
                });
            const possibleVisa = []
            await nationalitiesCollection.find().forEach(doc => {
                let count = 0;
                let notFound = [];
                let countriesWithVisaInfo = Object.keys(doc.visaRequirements);

                for (obj of countriesWithVisaInfo) {
                    if (!possibleVisa.includes(doc.visaRequirements[obj].visa))
                        possibleVisa.push(doc.visaRequirements[obj].visa);
                }

                for (obj of countriesList) {
                    if (!countriesWithVisaInfo.includes(obj.country) && !countriesWithVisaInfo.includes(obj.alt)) {
                        count++;
                        notFound.push(obj.country);
                    }
                }
                if (count > 2) { //Palestine (sadly) and the country itself {2}
                    console.log('Not Found: ' + count + ' in ' + doc.citizenship)
                    if (!(count > 20))
                        console.log(notFound)
                }
            });
            for (obj of possibleVisa)
                console.log(obj);
        });
})
    .catch(error => {
        console.error(error);
    });
