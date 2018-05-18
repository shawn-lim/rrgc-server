// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var path       = require('path');

import Seeder from './app/seeds/initialize';

import User from './app/models/User';
import SignIns from './app/models/SignIns';
import Sessions from './app/models/Sessions';
import Services from './app/models/Services';

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

const handleError = (req, res) => {
  return (error) => {
    res.status(500).send(error);
  }
};

const handleQuery = (req, res) => {
  return (response) => {
    if(response) {
      res.status(200).send(response);
    }
    else {
      res.status(404).send('not_found');
    }
  }
};

router.route('/users')
  .get((req,res) => {
    User.find(req.query.find)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  })
  .post((req,res) => {
    User.create(req.body)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  });

router.route('/users/:id')
  .get((req, res) => {
    User.get(req.params.id)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  })
  .put((req, res) => {
    User.update(req.params.id, req.body)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  })
  .delete((req, res) => {
    User.delete(req.params.id)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  });

router.route('/users/:id')
  .get((req, res) => {
    User.get(req.params.id)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  })
  .put((req, res) => {
    User.update(req.params.id, req.body)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  })
  .delete((req, res) => {
    User.delete(req.params.id)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  });

router.route('/officers')
  .get((req,res) => {
    User.officers()
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  });

router.route('/officers/:id')
  .get((req, res) => {
    User.getOfficer(req.params.id)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  })
  .post((req, res) => {
    User.addOfficer(req.params.id)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  })
  .delete((req, res) => {
    User.removeOfficer(req.params.id)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  })

const dummy_session = {
  user_id: 2,
  name: 'Test',
  start_float: 100
};

const dummy_signin = {
  user_id: 3,
  session_id: 1,
  rentals: {
    range: 1,
    services: [
      'bow_rental',
      'arrow_rental',
      'target_face'
    ]
  }
}

router.route('/signins/:id?')
  .get((req, res) => {
    if(req.params.id) {
      SignIns.get(req.params.id)
        .then(handleQuery(req, res))
        .catch(handleError(req, res));
    }
    else {
      res.status(400).send('ID_REQUIRED');
    }
  })
  .put((req, res) => {
    // SignIns.create(dummy)
    // .then(handleQuery(req, res))
    // .catch(handleError(req, res));
  })
  .post((req, res) => {
    SignIns.create(dummy_signin)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  })

router.route('/sessions/:id?')
  .get((req, res) => {
    if(req.params.id) {
      Sessions.get(req.params.id)
        .then(handleQuery(req, res))
        .catch(handleError(req, res));
    }
    else if (req.query.date) {
      Sessions.getSession(req.query.date)
        .then(handleQuery(req, res))
        .catch(handleError(req, res));
    }
    else {
      Sessions.getToday()
        .then(handleQuery(req, res))
        .catch(handleError(req, res));
    }
  })
  .post((req, res) => {
    Sessions.create(dummy_session)
      .then(handleQuery(req, res))
      .catch(handleError(req, res));
  })


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
