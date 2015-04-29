var fs = require('fs');
var crypto = require('crypto');
var mongoose = require('mongoose');
var connection = mongoose.connect('mongodb://localhost/admin_interface');
require('./models/models.js');
var User = mongoose.model('User');
var MedModel = mongoose.model('MedModel');
var Authkey = mongoose.model('Authkey');

var mockUsers = ["Master Admin", "Dark Star", "Luffy Senpai", "Icongito Dual", "Robert Douche",
"Shawn Con", "Tom Potter", "Jerry Lit", "Bruce Wayne", "Archer Conners",
"Icon Shadow", "Hawkeye Cake"];

var split;
var temp;
var usern;
var name;
var passwd;
var authkey;
var i;
var j;

// Remove existing users and ideas
Authkey.remove({}, function(err) {
  console.log('authkey collection removed');
  User.remove({}, function(err) {
     console.log('user collection removed');
     MedModel.remove({}, function(err) {
        console.log('model collection removed');
        addUsers();
        addModels();
     });
  });
});

// Add new users and ideas
function addUsers () {
  for (i = 0; i < mockUsers.length; i++) {
    split = mockUsers[i].split(" ");
    temp = split[0] + "." + split[1];
    usern = temp.toLowerCase() + "@gmail.com";
    name = mockUsers[i];
    passwd = temp.toLowerCase() + "4321";
    authkey = makeAuthKey();

    var authkey = new Authkey({email: usern});
    authkey.set('authkey', authkey);

    authkey.save(function(err) {
      // handle error
    });

    var user = new User({username:usern});
    user.set('password', encryptPassword(passwd));
    user.set('fullname', name);
    user.set('authkey', authkey);
    user.save(function(err) {
      // handle error
    });

    console.log("Added User - " + name);
  }
}

var med_models = [
    {id:0, downloads:24, name:"SOB-HF", src:"./med_models/sob_hf_v1.json", desc:"Calculate accute heart failure likelihood", logo:"img/lungs.png"},
    {id:1, downloads:16, name:"Wells Score", src:"./med_models/wells.json", desc:"Objectifies risk of pulmonary embolism", logo:"img/wells.jpg"},
    {id:2, downloads:18, name:"PERC Score", src:"./med_models/perc.json", desc:"Criteria for ruling out pulmonary embolism if pre-test probability is <15%", logo:"img/wells.jpg"},
    {id:3, downloads:17, name:"COPD Model", src:"./med_models/copd.json", desc:"Make disposition decision for chronic obstructive pulmonary disease", logo:"img/copd.png"},
    {id:4, downloads:18, name:"VAMP Model", src:"./med_models/vampirism.json", desc:"Are you a vampire? Find out now!", logo:"img/vampire.jpg"}
];

var model_src;

function addModels () {
  for (j = 0; j < med_models.length; j++) {
    var dt = randomDate(new Date(2015, 2, 2), new Date());
    var authr = mockUsers[j].split(" ");
    authr = authr[0]+"."+authr[1]+"@gmail.com";
    authr = authr.toLowerCase();
    model_src = JSON.parse(fs.readFileSync(med_models[j]['src'], 'utf8'));
    // model_src = model_src.stringify();
    var medModel = new MedModel({name:med_models[j]['name']});
    medModel.set('idref', med_models[j]['id']);
    medModel.set('desc', med_models[j]['desc']);
    medModel.set('logo', med_models[j]['logo']);
    medModel.set('src', model_src);
    medModel.set('timestamp', dt);
    medModel.set('author', authr);
    medModel.set('downloads', med_models[j]['downloads']);
    medModel.save(function(err) {
      // handle error
    });

    console.log("Added Model - " + med_models[j]['name']);
  }
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function encryptPassword(pwd){
  //algorithm - sha256
  return crypto.createHash('sha256').update(pwd).digest('base64').toString();
}

function makeAuthKey()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for( var i=0; i < 10; i++ ) {
        text += possible.charAt(Math.floor(possible.length*Math.random()));
    }
    return text;
}
