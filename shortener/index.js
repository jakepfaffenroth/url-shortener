require('dotenv').config();
const db = require('../db').pgPromise;

async function make(req, res) {
  // const shortUrl = makeShorter();
  // const rand = await db.one('SELECT substr(md5(random()::text), 0, 5)');
  // console.log('rand:', rand);
  const result = await db.oneOrNone(
    'INSERT INTO urls VALUES(${fullUrl}, DEFAULT) ON CONFLICT DO NOTHING RETURNING *',
    req.body
  );
  console.log('result:', result);

  // if (result.url === req.body.fullUrl) {
  //   const existing = await db.one(
  //     'DELETE FROM urls WHERE url = ${url} AND short = ${short}; SELECT * from urls WHERE url = ${url}',
  //     result
  //   );
  //   res.render('index', {
  //     msg: "You've already shortened this url:",
  //     shortUrl: 'short.jakepfaf.dev/' + existing.short,
  //     fullUrl: req.body.fullUrl,
  //   });
  // }
  if (result) {
    res.render('index', {
      msg: 'Your short url is',
      shortUrl: 'short.jakepfaf.dev/' + result.short,
      fullUrl: req.body.fullUrl,
    });
  } else {
    const existing = await db.one(
      'SELECT * from urls WHERE url = ${fullUrl}',
      req.body
    );
    res.render('index', {
      msg: "You've already shortened this url:",
      shortUrl: 'short.jakepfaf.dev/' + existing.short,
      fullUrl: req.body.fullUrl,
    });
  }
}

function makeShorter() {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function retrieve(req, res) {
  const shortUrl = req.url.replace('/', '');

  let result = await db.oneOrNone(
    'SELECT url FROM urls WHERE short = ${shortUrl}',
    { shortUrl }
  );
  result.url =
    result.url.includes('https://') || result.url.includes('http://')
      ? result.url
      : 'https://' + result.url;

  res.redirect(result.url);
}

module.exports = { make, retrieve };
