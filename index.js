require('dotenv').load();
var eq = require('./lib/equinox.js')();
var fp = require('./lib/myfitnesspal.js')();
var duo = require('./lib/duolingo.js')();
var mint= require('./lib/mint.js')();
var express = require('express'),
    cors = require('cors');
var Promise = require('bluebird');
var app = express();

app.get('/duo', function(req, res) {
  duo.login().then(function(data) {
    console.log('Logged in!');
    duo.getStreak().then(function(data) {
      res.json(data);
    });
  });
});

app.get('/eq', function (req, res) {
  eq.login().then(function() {
    console.log('Logged in!');
    eq.getCheckins().then(function(data) {
      res.json(data);
    });
  });
});

app.get('/mint', function(req, res) {
  mint.loginAndGetTransactions().then(function(data) {
    res.json(data);
  });
});

app.get('/fp', function(req, res) {
  fp.loginAndGetCalorieInfo().then(function(data) {
    res.json(data);
  });
});

app.get('/trackall', function(req, res) {
  Promise.all([fp.loginAndGetCalorieInfo(), eq.loginAndGetCheckins(), duo.loginAndGetStreak(), mint.loginAndGetTransactions()]).then(function(resolved) {
    console.log(resolved);
    var resObj = {
      calories: resolved[0],
      gym: resolved[1],
      language: resolved[2],
      money: resolved[3]
    };

    res.json(resObj);
  });
});

app.use(express.static('public'));
app.use(cors());

app.listen(process.env.PORT, function () {
  console.log('API listening on port: ' + process.env.PORT);
});
