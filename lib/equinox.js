var request = require('request-promise');

function eq(config) {
  return {
    login: login,
    getCheckins: getCheckins
  };

  function login(un, pw) {
    un = un || config.equinox.username;
    pw = pw || config.equinox.password;
    var loginUrl = config.equinox.apiRoot + '/v1/authentication/login';

    return request({
      url: loginUrl,
      method: 'POST',
      jar: true,
      form: {
        username: un,
        password: pw
      }
    });
  }

  function getCheckins(month, year) {
    var checkinUrl = config.equinox.apiRoot + '/v2.6/me/check-ins/2016/1';
    return request.get({
      url: checkinUrl,
      json: true,
      jar: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
        'Origin': 'https://www.equinox.com',
        'Referer': 'https://www.equinox.com/activity'
      }
    });
  }

}

module.exports = eq;
