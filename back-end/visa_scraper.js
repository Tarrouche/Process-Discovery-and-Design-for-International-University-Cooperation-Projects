const axios = require('axios');
const cheerio = require('cheerio');
const $ = require('jquery');

const { MongoClient } = require('mongodb');

const url = 'mongodb://myUserAdmin:1Tarrouche@127.0.0.1:27017/';

const inputs = {
    'American': '/wiki/Visa_requirements_for_United_States_citizens',
    'Puerto Rican': '/wiki/Visa_requirements_for_United_States_citizens',

    'Anguillan': '/wiki/Visa_requirements_for_British_Overseas_Territories_citizens',
    'Bermudian': '/wiki/Visa_requirements_for_British_Overseas_Territories_citizens',
    'British Virgin Islander': '/wiki/Visa_requirements_for_British_Overseas_Territories_citizens',
    'Cayman Islander': '/wiki/Visa_requirements_for_British_Overseas_Territories_citizens',
    'Gibraltarian': '/wiki/Visa_requirements_for_British_Overseas_Territories_citizens',
    'Montserratian': '/wiki/Visa_requirements_for_British_Overseas_Territories_citizens',
    'Pitcairn Islander': '/wiki/Visa_requirements_for_British_Overseas_Territories_citizens',
    'St Helenian': '/wiki/Visa_requirements_for_British_Overseas_Territories_citizens',
    'Turks and Caicos Islander': '/wiki/Visa_requirements_for_British_Overseas_Territories_citizens',
    'Tristanian': '/wiki/Visa_requirements_for_British_Overseas_Territories_citizens',

    'Citizen of Antigua and Barbuda': '/wiki/Visa_requirements_for_Antigua_and_Barbuda_citizens',
    'Citizen of Bosnia and Herzegovina': '/wiki/Visa_requirements_for_Bosnia_and_Herzegovina_citizens',
    'Botswanan': '/wiki/Visa_requirements_for_Botswana_citizens',
    'Burkinan': '/wiki/Visa_requirements_for_Burkinabe_citizens',
    'Burmese': '/wiki/Visa_requirements_for_Myanmar_citizens',
    'Comoran': '/wiki/Visa_requirements_for_Comorian_citizens',
    'Congolese (Congo)': '/wiki/Visa_requirements_for_Republic_of_the_Congo_citizens',
    'Congolese (DRC)': '/wiki/Visa_requirements_for_Democratic_Republic_of_the_Congo_citizens',


    'Citizen of the Dominican Republic': '/wiki/Visa_requirements_for_Dominican_Republic_citizens',
    'Ecuadorean': '/wiki/Visa_requirements_for_Ecuadorian_citizens',
    'Filipino': '/wiki/Visa_requirements_for_Philippine_citizens',
    'Guamanian': '/wiki/Visa_requirements_for_Guatemalan_citizens',
    'Citizen of Guinea-Bissau': '/wiki/Visa_requirements_for_Guinea-Bissauan_citizens',
    'Hong Konger': '/wiki/Visa_requirements_for_Chinese_citizens_of_Hong_Kong',
    'Kittitian': '/wiki/Visa_requirements_for_Saint_Kitts_and_Nevis_citizens',
    'Citizen of Kiribati': '/wiki/Visa_requirements_for_Kiribati_citizens',
    'Kosovan': '/wiki/Visa_requirements_for_Kosovar_citizens',
    'Luxembourger': '/wiki/Visa_requirements_for_citizens_of_Luxembourg',
    'Macanese': '/wiki/Visa_requirements_for_Chinese_citizens_of_Macau',
    'Macedonian': '/wiki/Visa_requirements_for_citizens_of_North_Macedonia',
    'Marshallese': '/wiki/Visa_requirements_for_Marshall_Islands_citizens',
    'Martiniquais': '/wiki/Visa_requirements_for_French_citizens',
    'Monegasque': '/wiki/Visa_requirements_for_Mon%C3%A9gasque_citizens',
    'Mosotho': '/wiki/Visa_requirements_for_Lesotho_citizens',

    'New Zealander': '/wiki/Visa_requirements_for_New_Zealand_citizens',
    'Niuean': '/wiki/Visa_requirements_for_New_Zealand_citizens',
    'Cook Islander': '/wiki/Visa_requirements_for_New_Zealand_citizens',

    'Salvadorean': '/wiki/Visa_requirements_for_El_Salvador_citizens',
    'Sao Tomean': '/wiki/Visa_requirements_for_Santomean_citizens',
    'Saudi Arabian': '/wiki/Visa_requirements_for_Saudi_citizens',
    'Citizen of Seychelles': '/wiki/Visa_requirements_for_Seychellois_citizens',
    'Solomon Islander': '/wiki/Visa_requirements_for_Solomon_Islands_citizens',
    'St Lucian': '/wiki/Visa_requirements_for_Saint_Lucian_citizens',
    'Stateless': '/',
    'Trinidadian': '/wiki/Visa_requirements_for_Trinidad_and_Tobago_citizens',
    'Citizen of Vanuatu': '/wiki/Visa_requirements_for_Vanuatuan_citizens',
    'Vincentian': '/wiki/Visa_requirements_for_Saint_Vincent_and_the_Grenadines_citizens',
    'Lao': '/wiki/Visa_requirements_for_Laotian_citizens',

    'Scottish': '/wiki/Visa_requirements_for_British_citizens',
    'Welsh': '/wiki/Visa_requirements_for_British_citizens'
}

const removedNationalities = [
    'English', 'Prydeinig',//British
    'Northern Irish',//Irish
    'Cymraes', 'Cymro', 'Wallisian'//Welsh
];

async function clearNationalitiesCollection(collection) {
    const result = await collection.deleteMany({});
    console.log(`Deleted ${result.deletedCount} documents`);
}

async function getNationalities() {
    try {
        const response = await axios.get('https://www.gov.uk/government/publications/nationalities/list-of-nationalities');
        const html = response.data;
        const $ = cheerio.load(html);
        const uk_nationalities = $('div.gem-c-govspeak').text().trim().split('\n');

        // Remove empty strings and trim whitespace from the remaining strings
        const cleanedNationalities = uk_nationalities.filter(n => n.trim() !== '' && n.trim().length !== 1 && !removedNationalities.includes(n.trim())).map(n => n.trim());
        cleanedNationalities.push('British');

        return cleanedNationalities;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to get nationalities');
    }
}

async function getRequirementByNationalityLink(cleanedNationalities) {
    try {
        const [response1, response2] = await axios.all([
            axios.get('https://en.wikipedia.org/wiki/Category:Visa_requirements_by_nationality'),
            axios.get('https://en.wikipedia.org/w/index.php?title=Category:Visa_requirements_by_nationality&pagefrom=Trinidad+and+Tobago%0AVisa+requirements+for+Trinidad+and+Tobago+citizens#mw-pages')
        ]);

        const $1 = cheerio.load(response1.data);
        const $2 = cheerio.load(response2.data);
        const citizenships = [];

        $1('div#mw-pages div.mw-content-ltr ul li a, div#mw-subcategories div.mw-content-ltr ul li a').each((i, element) => {
            const title = $1(element).attr('title');
            const link = $1(element).attr('href');
            if (title && title.includes(' citizens')) {
                citizenships.push([title, link]);
            }
        });

        $2('div#mw-pages div.mw-content-ltr ul li a').each((i, element) => {
            const title = $2(element).attr('title');
            const link = $2(element).attr('href');
            if (title && title.includes(' citizens')) {
                citizenships.push([title, link]);
            }
        });

        const founds = [];
        const manualInputs = [];
        for (let i = 0; i < cleanedNationalities.length; i++) {
            if (inputs[cleanedNationalities[i]]) {
                founds.push({ 'nationality': cleanedNationalities[i], 'visaRequirements': inputs[cleanedNationalities[i]] });
            } else {
                let found = false;
                for (let j = 0; j < citizenships.length; j++) {
                    if (citizenships[j][0].includes('for ' + cleanedNationalities[i])) {
                        founds.push({ 'nationality': cleanedNationalities[i], 'visaRequirements': citizenships[j][1] });
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    manualInputs.push('Not Found: ' + cleanedNationalities[i]);
                }
            }
        }
        console.log(founds.length + ' found');
        console.log(manualInputs.length + ' not found');
        /*for (let i = 0; i < manualInputs.length; i++) {
          console.log(manualInputs[i]);
        }*/

        return founds;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to get visa requirements (by nationality) links');
    }
}


async function getVisaRequirements(link) {
    try {
        const response = await axios.get('https://en.wikipedia.org' + link);
        const html = response.data;
        const $ = cheerio.load(html);
        //const table = $('table.wikitable:not(:has(th:first-of-type:contains("Areas"))):not(:has(th:first-of-type:contains("Yellow fever vaccination"))):not(:has(th:nth-child(2):contains("Number of visitors"))):not(:has(th:contains("Foreign travel statistics"))):not(:has(th:nth-child(4):contains("Basic conditions"))):not(:has(th:nth-child(2):contains("Number"))):not(:has(th:nth-child(2):contains("for entry to"))):not(:has(th:nth-child(2):contains("Abolished"))):not(:has(th:nth-child(2):contains("Duration")))');
        //Areas because of Taiwanese     Number of visitors for British    Foreign tavel stats in russian    Basic conditions spanish   Abolished & Number for Jamaican   Entry to for South African
        //Yellow Fever Polish    Duration for Portuguese
        const tables = $('table.wikitable:contains("Country"):contains("requirement"):contains("Allowed stay")');
        const data = {};
        tables.each((i, table) => {
            const headerColumns = $(table).find('th');
            const colsNumber = headerColumns.length;
            console.log(`Table ${link} has ${colsNumber} columns in the header.`);

            const tableBody = $(table).find('tbody');
            const rows = tableBody.find('tr');
            let printed = false;
            rows.each((i, row) => {
                if (i === 0) {
                    // Skip the first row
                    return;
                }
                const columns = $(row).find('td');
                if (columns.length >= 3) {
                    if (![3, 4].includes(columns.length) && !printed) {
                        console.log(columns.length + ' ' + link)
                        printed = true;
                    }
                    const country = $(columns[0]).text().trim().replace(/\[[^\]]*\]/g, '');
                    const visaRequirement = $(columns[1]).text().trim().replace(/\[[^\]]*\]/g, '');
                    let allowedStay, notes;
                    if (columns.length == colsNumber) {
                        allowedStay = $(columns[2]).text().trim().replace(/\[[^\]]*\]/g, '');
                        notes = $(columns[3]).text().trim().replace(/\[[^\]]*\]/g, '');
                    } else {
                        notes = $(columns[2]).text().trim().replace(/\[[^\]]*\]/g, '');
                    }
                    data[country] = { visa: visaRequirement, stay: allowedStay, notes: notes };
                }
            });
        });

        return data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to get visa requirements');
    }
}

async function run() {
    let client;
    try {
        client = await MongoClient.connect(url, { useNewUrlParser: true });
        console.log(`Connected to MongoDB`);
        const nationalitiesCollection = client.db("test").collection("nationalities");
        await clearNationalitiesCollection(nationalitiesCollection);
        const cleanedNationalities = await getNationalities();
        const founds = await getRequirementByNationalityLink(cleanedNationalities);

        const docs = [];
        for (let i = 0; i < founds.length; i++) {
            if (founds[i]['visaRequirements'].length !== 1) {
                const data = await getVisaRequirements(founds[i]['visaRequirements']);
                const nationalityDocument = {
                    citizenship: founds[i]['nationality'],
                    visaRequirements: data
                };

                docs.push(nationalityDocument);
                if (docs.length === 1)
                    process.stdout.write('Processing...');
                else if (docs.length === founds.length - 1)
                    console.log('.');
                else
                    process.stdout.write('.');
            }
        }

        await nationalitiesCollection.insertMany(docs);
        console.log(`Added documents to nationalities collection`);
    } catch (error) {
        console.log(`Error: ${error}`);
    } finally {
        client.close();
        console.log(`Disconnected from MongoDB`);
    }
}

run();

