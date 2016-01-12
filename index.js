require('dotenv').load();
var eq = require('./lib/equinox.js')();
var fp = require('./lib/myfitnesspal.js')();
var express = require('express'),
    cors = require('cors');
var Promise = require('bluebird');
var app = express();

app.get('/eq', function (req, res) {
  eq.login().then(function() {
    console.log('Logged in!');
    eq.getCheckins().then(function(data) {
      res.json(data);
    });
  });
});

app.get('/fp', function(req, res) {
  fp.getCalorieInfo().then(function(data) {
    res.json(data);
  });
});

app.get('/trackall', function(req, res) {
  Promise.all([fp.getCalorieInfo(), eq.loginAndGetCheckins()]).then(function(resolved) {
    var resObj = {
      calories: resolved[0],
      gym: resolved[1]
    };

    res.json(resObj);
  });
});

app.use(express.static('public'));
app.use(cors());

app.listen(process.env.PORT, function () {
  console.log('API listening on port: ' + process.env.PORT);
});
