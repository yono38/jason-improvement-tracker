var moment = require('moment');
var request = require('request-promise');

function duo() {
  var me = {};

  return {
    login,
    getStreak,
    loginAndGetStreak
  };
  function login(un, pw) {
    un = un || process.env.DUOLINGO_USERNAME;
    pw = pw || process.env.DUOLINGO_PASSWORD;
    var loginUrl = process.env.DUOLINGO_WEB_ROOT + '/login';

    return request({
      url: loginUrl,
      method: 'POST',
      jar: true,
      form: {
        login: un,
        password: pw
      }
    }).then(function(res) {
      res = JSON.parse(res);
      if (res.response === 'OK') {
        me.username = res.username;
        me.id = res.user_id;
      }
    });
  }

  function getStreak() {
    var url = process.env.DUOLINGO_WEB_ROOT + '/users/' + me.username;
    return request({
      url: url,
      method: 'GET',
      json: true
    }).then(function(data) {
      //console.log(JSON.stringify(data,null,2));
      var duoData = {
        streak: data.language_data.es.streak
      };
      if (data.calendar.length > 0) {
        duoData.lessonToday = isToday(data.calendar[data.calendar.length-1].datetime);
      }
      return duoData;
    });
  }

  function loginAndGetStreak() {
    return login().then(function(data) {
      return getStreak();
    });
  }

  function isToday(date) {
    return moment(date).isSame(new Date(), 'day');
  }
}

module.exports = duo;
