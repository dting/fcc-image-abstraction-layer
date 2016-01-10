'use strict';

require('dotenv').load();

// config
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/app-dev';
var mongoOptions = {db: {safe: true}};
var port = process.env.PORT || 5000;
var searchUrl = 'https://www.googleapis.com/customsearch/v1' +
                '?searchType=image&key=' + process.env.GOOGLE_API_KEY +
                '&cx=' + process.env.GOOGLE_CX + '&q=';
var request = require('request');
var Query = require('./model/query');

var mongoose = require('mongoose');
mongoose.connect(mongoUri, mongoOptions);
mongoose.connection.on('error', function(err) {
        console.error('MongoDB connection error: ' + err);
        process.exit(-1);
    }
);

var express = require('express');
var app = express();
app.set('port', port);

app.route('/api/imagesearch/:q').get(function(req, res) {
    var url = searchUrl + req.params.q;
    var start = +req.query.offset || 0;
    if (start > 0) {
        url += '&start=' + start;
    }
    request.get(url, function(err, results, body) {
        if (err) return res.status(500).send(err);
        if (results.statusCode !== 200) return res.sendStatus(results.status);
        var response = JSON.parse(body).items.map(function(el) {
            return {
                url: el.link,
                snippet: el.snippet,
                thumbnail: el.image.thumbnailLink,
                context: el.image.contextLink
            };
        });
        Query.create({
            q: req.params.q,
            offset: req.query.offset
        }, function(err) {
            if (err) return res.status(500).send(err);
            res.json(response);
        });
    });
});

app.route('/api/latest/imagesearch').get(function(req, res) {
    Query.find({})
        .sort({field: 'asc', _id: -1})
        .limit(10)
        .exec(function(err, results) {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
