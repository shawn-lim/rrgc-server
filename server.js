// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var path       = require('path');

import User from './app/models/User';

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/index_bundle.js', express.static(path.join(__dirname, 'public', 'index_bundle.js')));
//app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));
//app.use('/app.full.min.css', express.static(path.join(__dirname, 'app.full.min.css')));
//app.use('/app.full.min.js', express.static(path.join(__dirname, 'app.full.min.js')));

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
app.use('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

router.route('/users')
  .get((req,res) => {
    User.find(req.query.find).then((users)=>{
      res.json(users);
    }).catch((e)=>{
      res.status(500).send(e);
    });
  })
  .post((req,res) => {
    User.create(req.body).then((user)=>{
      res.status(200).send(user);
    }).catch((e)=>{
      res.status(500).send(e);
    });
  });

router.route('/users/:id')
  .get((req, res) => {
    User.get(req.params.id).then((user)=>{
      res.json(user);
    }).catch((e)=>{
      res.status(500).send(e);
    });
  })
  .put((req, res) => {
    User.update(req.params.id, req.body).then((user)=>{
      res.status(200).send(user);
    }).catch((e)=>{
      res.status(500).send(e);
    });
  })
  .delete((req, res) => {
    User.delete(req.params.id).then((user)=>{
      res.status(200).send(user);
    }).catch((e)=>{
      res.status(500).send(e);
    });
  })

router.route('/officers')
  .get((req,res) => {
    User.officers().then((users)=>{
      console.log(users);
      res.json(users);
    }).catch((e)=>{
      res.status(500).send(e);
    });
  });

router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });   
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
