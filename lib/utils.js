/**
* Helper Functions
*/
const request = require('request-promise');
const basicAuth = require('basic-auth');
const moment = require('moment');

function makeRequest(url, method, form) {
  let requestOpts = {
    url,
    method,
    json: true,
    jar: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
      'Origin': 'https://www.equinox.com',
      'Referer': 'https://www.equinox.com/activity'
    }
  };
  if (form) {
    requestOpts.form = form;
  }
  return request(requestOpts);
}

function thisWeek(date) {
  let weekStart = moment().startOf('week'); // Sunday
  let weekEnd = moment().endOf('week'); // Saturday
  return moment(date).isSameOrAfter(weekStart) && moment(date).isSameOrBefore(weekEnd);
}

function unauthorized(res) {
  res.statusCode = 401;
  res.setHeader('WWW-Authenticate', 'Basic realm=Authorization Required');
  res.end('Access denied')
};

function auth(req, res, next) {
  const credentials = basicAuth(req);

  if (!credentials || !credentials.name || !credentials.pass) {
    return unauthorized(res);
  } else {
    return next();
  }
}

module.exports = { makeRequest, thisWeek, unauthorized, auth };
