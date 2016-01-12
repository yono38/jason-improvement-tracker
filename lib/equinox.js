var request = require('request-promise');
var moment = require('moment');

function eq() {
  return {
    login: login,
    getCheckins: getCheckins,
    loginAndGetCheckins: loginAndGetCheckins
  };

  function login(un, pw) {
    console.log(process.env);
    un = un || process.env.EQUINOX_USERNAME;
    pw = pw || process.env.EQUINOX_PASSWORD;
    var loginUrl = process.env.EQUINOX_API_ROOT + '/v1/authentication/login';

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

  function thisWeek(date) {
    var weekStart = moment().startOf('week'); // Sunday
    var weekEnd = moment().endOf('week'); // Saturday
    return moment(date).isSameOrAfter(weekStart) && moment(date).isSameOrBefore(weekEnd);
  }

  function loginAndGetCheckins() {
    return login().then(function() {
      return getCheckins();
    });
  }

  function getCheckins(month, year) {
    year = year || moment().year();
    month = month || moment().format('M');
    var checkinUrl = process.env.EQUINOX_API_ROOT + '/v2.6/me/check-ins/' + year + '/' + month;
    return request.get({
      url: checkinUrl,
      json: true,
      jar: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
        'Origin': 'https://www.equinox.com',
        'Referer': 'https://www.equinox.com/activity'
      }
    }).then(function(data) {
      var weekTotal = 0;
      data.checkIns.forEach(function(checkin) {
        if (thisWeek(checkin.startDate)) {
          weekTotal++;
        }
      });
      return {
        totals: {
          month: data.checkIns.length,
          week: weekTotal
        },
        checkins: data.checkIns
      };
    });
  }

}

module.exports = eq;
