require('dotenv').config()

const fetch    = require('node-fetch');
const fs       = require('fs');
const cheerio  = require('cheerio');
const Mustache = require('mustache');
const Database = require('./Database.js');
const Email    = require('./Email.js');

const database = new Database({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
});

const email = new Email({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

function init() {

    let template = fs.readFileSync('./template.html', 'utf8');

    let url = new URL('https://www.hemnet.se/bostader');
    for (let config in process.env) {
        if (config.startsWith('HEMNET')) {
            let key = config.replace('HEMNET_', '').toLowerCase();
            let values = process.env[config].split(',');

            for (let value of values) {
                if (value) {
                    url.searchParams.append(key, value);
                }
            }
        }
    }

    fetch(url.toString())
        .then(data => data.text())
        .then(async (html) => {
            const $ = cheerio.load(html);

            let rows = [];
            let apartments = [];
            $('ul.normal-results li.js-normal-results').each(function(i, el) {
                let link = $(el).find('a.js-listing-card-link').attr('href');
                let attributes = $(el).find('div.listing-card__attributes--primary div');

                rows.push({
                    id: link.match(/\d+$/)[0],
                    link: link,
                    address: $(el).find('h2.listing-card__address--normal').clone().children().remove().end().text().replace(/[\n\r]/g, '').trim(),
                    location: $(el).find('div.listing-card__location').text().replace(/[\n\r]/g, '').trim(),
                    img: $(el).find('img.listing-card__media').data('src') || '',
                    price: parseInt(attributes.eq(0).text().replace(/\s/g, '')) || 0,
                    size: parseFloat(attributes.eq(1).text().replace(/,/, '.')) || 0,
                    rooms: parseInt(attributes.eq(2).text()) || 0,
                });
            });

            for (let row of rows) {
                let results = await database.query('INSERT IGNORE INTO apartments SET ?', row);

                if (results.affectedRows) {
                    apartments.push(row)
                }
            }

            if (apartments.length) {
                email.send({
                    from: process.env.EMAIL_FROM,
                    to: process.env.EMAIL_TO,
                    subject: 'Hemnet Scraper',
                    html: Mustache.render(template, { "apartments": apartments }),
                });
            }

            database.close();
        })
        .catch(error => {
            database.close();
            email.send({
                from: process.env.EMAIL_FROM,
                to: process.env.EMAIL_TO,
                subject: 'Hemnet Scraper',
                text: error.toString(),
            });
        });
}

module.exports = init();
