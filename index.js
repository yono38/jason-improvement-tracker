require('dotenv').load();
var eq = require('./lib/equinox.js')();
var fp = require('./lib/myfitnesspal.js')();
var app = require('express')();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

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

app.listen(process.env.PORT, function () {
  console.log('API listening on port: ' + process.env.PORT);
});
