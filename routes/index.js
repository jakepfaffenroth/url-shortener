const express = require('express');
const router = express.Router();

const shortener = require('../shortener');

router.get('/', function (req, res) {
  res.render('index');
});

router.post('/shorten', shortener.make);

router.get('/:url', shortener.retrieve);

module.exports = router;
