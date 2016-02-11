var PepperMint = require('pepper-mint');
var moment = require('moment');
var _ = require('underscore');

function mint() {

  return {
    loginAndGetTransactions: loginAndGetTransactions
  };

  function loginAndGetTransactions() {
    var un = process.env.MINT_USERNAME,
        pw = process.env.MINT_PASSWORD;
    return PepperMint(un, pw).then(function(mint) {
      return mint.getTransactions();
    })
    .then(function(txns) {
      var txnTotalsByDate = 
        _.chain(txns)
          .groupBy('date')
          .mapObject(function(txnsForDay) {
              return _.reduce(txnsForDay, function(memo, txnObject) {
                return memo + getAmount(txnObject); 
              }, 0);
            })
            .value();
          return { 
            transactions: txnTotalsByDate,
            recent: getTotalToday(txnTotalsByDate)
          };
    })
    .fail(function(err) {
        console.error("Boo :(", err);
    });
  }

  function getTotalToday(txns) {
    var infoDate = (moment().hour() < 12) ? moment().subtract(1, 'days') : moment();
    var todayKey = infoDate.format('MMM D');
    return {
      date: infoDate.format('YYYY-MM-DD'),
      total: txns[todayKey] || 0
    };
  }

  function getAmount(txn) {
    if (typeof txn == 'undefined' || typeof txn.amount !== 'string') {
      return 0;
    } else {
      return parseFloat(txn.amount.substr(1));
    }
  }

  /*
  function getWeeklySpending() {
    var url = 'https://wwws.mint.com/trendData.xevent';

    return request({
      url: url,
      json: true,
      body: {
        searchQuery: {"reportType":"ST","chartType":"toggleable","comparison":"","matchAny":true,"terms":[],"accounts":{"groupIds":["AA"],"accountIds":[]},"dateRange":{"period":{"label":"Last 7 days","value":"L7D"},"start":"1/11/2016","end":"1/17/2016"},"drilldown":null,"categoryTypeFilter":"all"},
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
      }
    });

  }
  */
}

module.exports = mint;
