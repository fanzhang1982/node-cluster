var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var domainModule = require('domain');
var _ = require('underscore');

function staticFiles(app, isDev) {
  console.log("Static files");
  if (isDev) {
    app.use(express.static(path.join(__dirname, '../client/dist')))
       .use(express.static(path.join(__dirname, '../client-cmaf/src')))
       .use(express.static(path.join(__dirname, '../client-cmaf')));
  } else {
    var staticCache = require("../utils.js").staticCache;
    app.use(staticCache.cache);
  }
}

function enableAuthentication(app) {
  var authentication = require('../server/authentication.js');
  var security = require("../server/security.js");
  authentication.initialize(app, authentication.initAuthentication(app));
  security.initialAuthorization();

  function isUncheckedUrl(reqPath) {
    var returnValue = false;
    _.each(["/login", "/user", "/logout"], function (pathPattern) {
      if (returnValue) {
        return;
      }
      if (reqPath.indexOf(pathPattern) == reqPath.length - pathPattern.length) {
        return returnValue = true;
      }
    });
    return returnValue;
  }

  app.use(function (req, res, next) {
    if (!isUncheckedUrl(req.path)) {
      if (!req.user || !security.checkAuthorization(req.user, req.path)) {
        return res.status(401).end();
      }
    }
    next();
  });
}

module.exports = function(workerId, globalConfig, workersConfig) {
  var app = express();
  var logger = globalConfig.logger();

  staticFiles(app, globalConfig.isDev);

  var domain = domainModule.create();
  domain.on('error', function (err) {
    console.error(err.stack);
    logger.error(err.stack);
  });

  domain.run(function () {
    app.use(function (req, res, next) {
      var requestDomain = domainModule.create();
      requestDomain.add(req);
      requestDomain.add(res);
      requestDomain.on('error', next);
      requestDomain.run(next);
    });

    var systemStatusModule = require("../server/system/status.js");
    systemStatusModule.initializeStatusPersist();
    app
      .use(function (req, res, next) {
        systemStatusModule.recordResponseTime(req, res, next);
      })
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({extended: true}))
      .use(cookieParser())
      .use(expressSession({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 60
        },
        rolling: true
      }));

    globalConfig.authenticate && enableAuthentication(app);

    var dynamicRouter = require("../server/dynamic-router.js")(app);
    workersConfig[workerId].initialize(app, dynamicRouter, globalConfig);
  });

  return app
    .use(function(req, res, next){
      res.type('text/plain');
      res.status(404);
      res.send('404 - Not Found');
    })
    .use(function(err, req, res, next) {
      //统一的错误处理, 把Error的Stacktrace发给客户端.
      res.status(500).send(err.stack);
      throw err;
    })
}