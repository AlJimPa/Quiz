var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());

//auto-logout - almaceno la fecha como milisegundos en session.lastAccess
app.use(function(req, res, next) {
	if (req.session.user){
		//para pruebas: 12s; version final: 2 minutos -> 120s -> 120000ms
		var now = Date.now();
		if (!req.session.lastAccess 
				|| (req.session.lastAccess && (now - req.session.lastAccess) < 120000)) {
			//No caduca
			req.session.lastAccess = now;
			res.locals.session = req.session;
		} else {
			//Caducado - para mantener la página de destino, no puedo redirigir a logout
			//marcando la página de vuelta login, pues entraría en bucle; 
			//forzar cierre y redirección sin saltar a otro middleware
			delete req.session.lastAccess;
			delete req.session.user;
			req.session.redir = req.path;
			res.locals.session = req.session;
			res.redirect('/login');
			return;
		}
	}
	next();
});

//Helpers dinamicos
app.use(function(req, res, next) {
	//guardar path en la session.redir para despues del login
	if (!req.path.match(/\/login|\/logout/)) {
		req.session.redir = req.path;
	}
	//hacer visible session en las vistas
	res.locals.session = req.session;
	next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


module.exports = app;
