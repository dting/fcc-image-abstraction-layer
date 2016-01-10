'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Query = new Schema({
    q: {type: String, required: true},
    offset: {type: String}
});

module.exports = mongoose.model('Query', Query);
