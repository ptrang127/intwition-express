var express = require('express');
var router = express.Router();
var twitter = require('../services/twitter-service');
var Sentiment = require('sentiment');
var sentiment = new Sentiment();


/* GET sentiment given a term. */
router.get('/term/:term', function (req, res, next) {
  twitter.get('search/tweets', { q: req.params.term + " -filter:retweets", lang: 'en', result_type: 'mixed', count: 100, tweet_mode: 'extended' }, function (error, tweets, response) {

    let statuses = tweets.statuses;

    let tweet_array = statuses.map(tweet => {
      return tweet.full_text;
    })

    let sentiments = tweet_array.map(tweet => {
      return {
        text: tweet,
        sentiment: sentiment.analyze(tweet)
      };
    });

    let scores = sentiments.map(sentiment => {
      return sentiment.sentiment.score;
    });

    let comparatives = sentiments.map(sentiment => {
      return sentiment.sentiment.comparative;
    });

    const arrSum = arr => arr.reduce((a, b) => a + b, 0);
    const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    let sum = arrSum(scores);
    let avg = arrAvg(scores);

    let sum_comparative = arrSum(comparatives);
    let avg_comparative = arrAvg(comparatives);

    let result = '';
    if (sum_comparative < -4) {
      result = "Very Negative";
    } else if (sum_comparative < -2) {
      result = "Negative";
    } else if (sum_comparative < 2) {
      result = "Neutral";
    } else if (sum_comparative < 4) {
      result = "Positive";
    } else {
      result = "Very Positive";
    }

    res.send({
      sum_score: sum,
      avg_score: avg,
      sum_comparative: sum_comparative,
      avg_comparative, avg_comparative,
      result: result,
      length: scores.length,
      tweets: tweet_array
    });

  });

});

/* GET sentiment given an account. */
router.get('/account/:account', function (req, res, next) {
  res.send(req.params.account);
});

/* GET sentiment given a hashtag. */
router.get('/hashtag', function (req, res, next) {
  res.send(req.params.hashtag);
});

module.exports = router;