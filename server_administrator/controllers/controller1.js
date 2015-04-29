  var crypto = require('crypto');
  var nodemailer = require('nodemailer');
  var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  MedModel = mongoose.model('MedModel');
  Message = mongoose.model('Message');
  Authkey = mongoose.model('Authkey');

  exports.addNewModel = function(req, res) {
    console.log(req.body.name);
    console.log(req.body.desc);
    console.log(req.body.src);
    var dt = new Date();
    var model = new MedModel({name:req.body.name});
    model.set('desc', req.body.desc);
    model.set('src', req.body.src);
    model.set('timestamp', dt);
    model.set('author', req.body.author);
    model.set('downloads', 0);
    model.set('logo', "img/lungs.png");
    model.save(function(err) {
      if (err){
        res.session.error = err;
        res.redirect('/');
      } else {
        req.session.msg = 'Successfully added ' + req.body.name;
        res.redirect('/');
      }
    });
  };

  exports.getAllModels = function(req, res) {
    MedModel.find()
    .exec(function(err, models) {
      if (!models){
        res.json(404, {msg: 'Models Not Found.'});
      } else {
        var i;
        for (i = 0; i < models.length; i++) {
          MedModel.findOne({ _id: models[i]._id })
          .exec(function(err, model) {
            var change = model.downloads + 0.5;
            model.set('downloads', change);
            model.save(function(err) {
              if (err){
                res.sessor.error = err;
              } else {
                console.log(model);
                req.session.msg = 'Model: ' + req.params.id + ' Updated.';
              }
            });
          });
        }
        console.log("Sent models");
        res.json(models);
      }
    });
  };

  exports.getAllModels1 = function(req, res) {
    MedModel.find()
    .exec(function(err, models) {
      if (!models){
        res.json(404, {msg: 'Models Not Found.'});
      } else {
        console.log("Sent models");
        res.json(models);
      }
    });
  };

  exports.getMyModels = function(req, res) {
    User.findOne({ _id: req.session.user })
    .exec(function(err, user) {
      if(user){
        MedModel.find({author: user.username})
        .exec(function(err, models) {
          if (!models){
            res.json(404, {msg: 'Models Not Found.'});
          } else {
            console.log("Sent my models");
            res.json(models);
          }
        });
      }
    });
  };

  exports.updateModel = function(req, res){
    console.log(req.params.id);
    console.log(req.body.name);
    MedModel.findOne({ _id: req.params.id })
    .exec(function(err, model) {
      model.set('src', req.body.src);
      model.set('desc', req.body.desc);
      model.set('name', req.body.name);
      model.save(function(err) {
        if (err){
          res.sessor.error = err;
        } else {
          console.log(model);
          req.session.msg = 'Model: ' + req.params.id + ' Updated.';
        }
        res.redirect('/');
      });
    });
  };

  exports.sendAuthKey = function (req, res) {
    var email = req.body.newadminemail;
    var key = makeAuthKey();
    var authkey = new Authkey({email: email});
    authkey.set('authkey', key);

    authkey.save(function(err) {
      if (err){
        res.session.error = err;
        res.redirect('/');
      } else {
        req.session.msg = 'Successfully added ' + email;
        res.redirect('/');
      }
    });

    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'babneet1234@gmail.com',
            pass: 'babneet4321'
        }
    });

    var mailOptions = {
        from: 'NoReply <noreply@medirisk.com>', // sender address
        to: email, // list of receivers
        subject: 'MediRisk Auth Key', // Subject line
        html: '<b>Your MediRisk Admin Authentication Key is \"' + key + '\".</b>' // html body
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
  };

  exports.deleteModel = function (req, res) {
    console.log(req.params.id);
    MedModel.findOne({ _id: req.params.id })
    .exec(function(err, idea) {
      if(idea){
        idea.remove(function(err){
          if (err){
            req.session.msg = err;
          }
          res.redirect('/');
        });
      } else{
        req.session.msg = "Model Not Found!";
        res.redirect('/');
      }
    });
  };

  exports.findModelsByName = function(req, res) {
      MedModel.find({ name: req.params.id })
      .exec(function(err, models) {
        if (!models){
          res.json(404, {msg: 'Model Not Found.'});
        } else {
          console.log("Sent model " + models.name);
          res.json(models);
        }
      });
  };

  exports.findModelsByDate = function (req, res) {
    var input = req.params.id;
    input = input.split("++");
    var startDate = new Date(input[0]);
    var endDate = new Date(input[1]);
    var num = input[2];
    endDate.setDate(endDate.getDate() + 1);
    console.log(startDate);
    console.log(endDate);
    console.log(num);
    MedModel.find({
      timestamp: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort({downloads: -1}).limit(num).exec(function (err, models) {
      if (!models){
        res.json(404, {msg: 'No models Found.'});
      } else {
        console.log("Sent models");
        // console.log(ideas);
        res.json(models);
      }
    });
  };

  exports.login = function(req, res){
    User.findOne({ username: req.body.username })
    .exec(function(err, user) {
      if (!user){
        err = 'User not registered';
      } else if (user.password ===
        encryptPassword(req.body.password.toString())) {
          req.session.regenerate(function(){
            req.session.user = user.id;
            req.session.username = user.username;
            req.session.fullname = user.fullname;
            req.session.msg = 'Logged in as ' + user.username;
            res.redirect('/');
          });
        }else{
          err = 'Incorrect username or password';
        }
        if(err){
          req.session.regenerate(function(){
            req.session.msg = err;
            res.redirect('/login');
          });
        }
      });
  };

  exports.register = function(req, res){
    User.findOne({ username: req.body.username })
    .exec(function(err, user) {
      if (!user){
        Authkey.findOne({ email: req.body.username })
        .exec(function(err, entry) {
          if (entry.authkey == req.body.authkey) {
            console.log("Signing Up - " + req.body.username);
            var user = new User({username:req.body.username});
            user.set('password', encryptPassword(req.body.password));
            user.set('fullname', req.body.fullname);
            user.save(function(err) {
              if (err){
                res.session.error = err;
                res.redirect('/signup');
              } else {
                req.session.user = user.id;
                req.session.username = user.username;
                req.session.fullname = user.fullname;
                req.session.msg = 'Logged in as ' + user.username;
                res.redirect('/');
              }
            });
          } else {
            req.session.msg = 'Access denied: Invalid Authentication Key';
            res.redirect('/signup');
          }
        });
      }else{
        req.session.msg = 'Username already exists';
        res.redirect('/signup');
      }
    });
  };

  exports.updateUserProfile = function(req, res){
    User.findOne({ _id: req.session.user })
    .exec(function(err, user) {
      user.set('username', req.body.username);
      user.set('fullname', req.body.fullname);
      var passwd = req.body.password;
      if (passwd != "" || passwd.length != 0) {
        user.set('password', encryptPassword(req.body.password));
      }
      user.save(function(err) {
        if (err){
          res.sessor.error = err;
        } else {
          req.session.msg = 'User profile updated';
        }
        res.redirect('/');
      });
    });
  };

  exports.getUserProfile = function(req, res) {
    User.findOne({ _id: req.session.user })
    .exec(function(err, user) {
      if (!user){
        res.json(404, {err: 'User not registered'});
      } else {
        console.log('Profile of user sent');
        res.json(user);
      }
    });
  };

  exports.userDelete = function(req, res){
    User.findOne({ _id: req.session.user })
    .exec(function(err, user) {
      if(user){
        user.remove(function(err){
          if (err){
            req.session.msg = err;
          }
          req.session.destroy(function(){
            res.redirect('/login');
          });
        });
      } else{
        req.session.msg = "User not registered - Not found";
        req.session.destroy(function(){
          res.redirect('/login');
        });
      }
    });
  };

  function encryptPassword(password){
    //algorithm - sha256
    return crypto.createHash('sha256').update(password).digest('base64').toString();
  }

  function makeAuthKey() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < 5; i++ ) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
  }
