const axios = require('axios');
require('dotenv').config();
const db = require('../db').pgPromise;

async function make(req, res) {
  const validFullUrl = makeUrlValid(req.body.fullUrl);

  // Check if url is valid
  try {
    const response = await axios.get(validFullUrl);

    if (response.statusText === 'OK') {
      const result = await db.oneOrNone(
        'INSERT INTO urls VALUES(${fullUrl}, DEFAULT) ON CONFLICT DO NOTHING RETURNING *',
        { fullUrl: validFullUrl }
      );

      if (result) {
        res.render('index', {
          msg: 'Your short url is',
          shortUrl: 'short.jakepfaf.dev/' + result.short,
          fullUrl: req.body.fullUrl,
        });
      } else {
        const existing = await db.one(
          'SELECT * from urls WHERE url = ${fullUrl}',
          { fullUrl: validFullUrl }
        );
        res.render('index', {
          msg: "You've already shortened this url:",
          shortUrl: 'short.jakepfaf.dev/' + existing.short,
          fullUrl: req.body.fullUrl,
        });
      }
    }
  } catch (err) {
    console.log('oops');
    res.render('index', {
      msg: 'Enter a valid url',
      fullUrl: req.body.fullUrl,
    });
  }
}

async function retrieve(req, res) {
  const shortUrl = req.url.replace('/', '');

  let result = await db.oneOrNone(
    'SELECT url FROM urls WHERE short = ${shortUrl}',
    { shortUrl }
  );
  result.url = makeUrlValid(result.url);

  res.redirect(result.url);
}

function makeUrlValid(url) {
  return url.includes('https://') || url.includes('http://')
    ? url
    : 'https://' + url;
}

module.exports = { make, retrieve };
