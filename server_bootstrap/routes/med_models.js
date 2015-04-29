var fs = require('fs');

exports.findAll = function (req, res, next) {
        res.send(models);
};

exports.findById = function (req, res, next) {
        var id = req.params.id;
        res.send(models[id]);
};

exports.getModel = function (req, res, next) {
        var id = req.params.id;
        console.log(models[id]['src']);
        var model = JSON.parse(fs.readFileSync(models[id]['src'], 'utf8'));
        res.send(model);
};

var models = [
    {id:0, name:"SOB-HF", src:"./models/sob_hf_v1.json", desc:"Calculate accute heart failure likelihood"},
    {id:1, name:"Wells Score", src:"./models/wells.json", desc:"Objectifies risk of pulmonary embolism"},
    {id:2, name:"PERC Score", src:"./models/perc.json", desc:"Criteria for ruling out pulmonary embolism if pre-test probability is <15%"},
    {id:3, name:"COPD Model", src:"./models/copd.json", desc:"Make disposition decision for chronic obstructive pulmonary disease"},
    {id:4, name:"VAMP Model", src:"./models/vampirism.json", desc:"Are you a vampire? Find out now!"}

];
