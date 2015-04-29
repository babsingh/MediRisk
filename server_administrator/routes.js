var express = require('express');
var router = express.Router();

module.exports = function (app) {
  var controller = require('./controllers/controller1');

  app.get('/statistics', function(req, res){
    if (req.session.user) {
      res.render('graph', { fullname:req.session.fullname,
                            msg:req.session.msg});
    } else {
      req.session.msg = 'Access denied!';
      res.redirect('/login');
    }
  });

  app.get('/signup', function(req, res){
    if(req.session.user){
      res.redirect('/');
    }
    res.render('signup', {msg:req.session.msg});
  });

  app.get('/login',  function(req, res){
    if(req.session.user){
      res.redirect('/');
    }
    res.render('login', {msg:req.session.msg});
  });

  app.get('/logout', function(req, res){
    req.session.destroy(function(){
      res.redirect('/login');
    });
  });

  app.use('/static', express.static( './static'));

  app.get('/', function(req, res){
    if (req.session.user) {
      res.render('index', {username:req.session.username,
                           fullname:req.session.fullname,
                           msg:req.session.msg});
    } else {
      res.render('welcome');
    }
  });

  app.get('/profile', function(req, res){
    if (req.session.user) {
      res.render('profile', {msg:req.session.msg});
    } else {
      req.session.msg = 'Access denied!';
      res.redirect('/login');
    }
  });

  app.get('/user/profile', controller.getUserProfile);
  app.get('/models/get', controller.getAllModels);
  app.get('/models/get1', controller.getAllModels1);
  app.get('/models/get/my', controller.getMyModels);
  app.get('/models/get/name/:id', controller.findModelsByName);
  app.get('/models/get/date/:id', controller.findModelsByDate);

  app.post('/signup', controller.register);
  app.post('/login', controller.login);
  app.post('/profile/update', controller.updateUserProfile);
  app.post('/profile/delete', controller.userDelete);

  app.post('/newmodel', controller.addNewModel);
  app.post('/send/authkey', controller.sendAuthKey);
  app.post('/model/update/:id', controller.updateModel);
  app.post('/model/delete/:id', controller.deleteModel);
}
