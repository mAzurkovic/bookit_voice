var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const {dialogflow} = require('actions-on-google')
const mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');

var Schema = mongoose.Schema;

var app = express();

var RoomSchema = new Schema({
    name: {type: String},
    isReserved: {type: Number},
    room: {type: Number}
});

var Room = mongoose.model('Room', RoomSchema);


mongoose.connect('mongodb://admin:admin1234@ds113815.mlab.com:13815/bookit', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected");
});

var app = express();
var voice = dialogflow();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.post('/fulfillment', function (req, res) {
  console.log(req.body);

  const intentString = req.body.queryResult.intent.displayName;

  if (intentString == "Get Open Rooms") {

    Room.findOne({room: 201}, function (err, doc) {
      if (err) {
          console.log(err);
      } else {
          if (doc.isReserved == 1) {
            let responseObj = {
              "fulfillmentText": "Sorry, all rooms are booked",
              "fulfillmentMessages": [{"text":{"text": ["Sorry, all rooms are booked"]}}]
            }
            res.send(JSON.stringify(responseObj));
          } else {
            let responseObj = {
              "fulfillmentText": "Room 201 is open, would you like to reserve it?",
              "fulfillmentMessages": [{"text":{"text": ["Room 201 is open, would you like to reserve it?"]}}]
            }
            res.send(JSON.stringify(responseObj));
          }
      }
  })

  } else if (intentString == "Reserve Room") {
    Room.findOne({room: 201}, function (err, doc) {
      if (err) {
          console.log(err);
      } else {
          if (doc.isReserved == 1) {
            let responseObj = {
              "fulfillmentText": "Sorry, room 201 is booked",
              "fulfillmentMessages": [{"text":{"text": ["Sorry, room 201 is booked"]}}]
            }
            res.send(JSON.stringify(responseObj));
          } else {
            doc.isReserved = 1;
            doc.name = "You";
            doc.save();

            let responseObj = {
              "fulfillmentText": "Great, your room is saved!",
              "fulfillmentMessages": [{"text":{"text": ["Great, your room is saved!"]}}]
            }
            res.send(JSON.stringify(responseObj));
          }
      }
  })
  } else {
      let responseObj = {
        "fulfillmentText": "no its working",
        "fulfillmentMessages": [{"text":{"text": ["no its working"]}}]
      }
      res.send(JSON.stringify(responseObj));
  }

})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
