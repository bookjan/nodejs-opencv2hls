const express = require('express');
const http = require('http');
const morgan = require('morgan');
const path = require('path');
const ngrok = require('ngrok');

const httpPort = 8080;

const app = express();

app.set('port', httpPort);
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Random public URL created by ngrok, default is localhost
let ngrokURL = `http://localhost:${app.get('port')}`;

// Render index.html and interpolate the url constiable
app.get('/', function (req, res) {
  res.render('index', { title: 'Face Detection', url: ngrokURL });
});

// HTTP server
const server = http.createServer(app);
server.listen(app.get('port'), '0.0.0.0', function () {
  console.log('HTTP server listening on port ' + app.get('port'));
});

// Get ngrok url 
(async function () { // IIFE: Immediately Invoked Function Expression
  ngrokURL = await ngrok.connect(app.get('port'));
  console.log('ngrokURL', ngrokURL);
})();

module.exports.app = app;