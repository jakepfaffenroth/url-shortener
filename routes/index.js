const express = require('express');
const router = express.Router();

const shortener = require('../shortener');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/shorten', shortener.make);

router.get('/:shortUrl', shortener.retrieve)

module.exports = router;
