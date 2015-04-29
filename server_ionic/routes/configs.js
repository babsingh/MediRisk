var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
//    mongoose.model('configs').find(function(err, configs) {
//        res.send(configs);
//    });
    res.send("hello");
});

module.exports = router;
