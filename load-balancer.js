/**
 * Created by zhangfan on 16/5/16.
 */

var _ = require('underscore');
var http = require('http');
var httpProxy = require('http-proxy');
var HttpProxyRules = require('http-proxy-rules');

function createProxyRules(workersConfig) {
  var rules = {};
  var defaultWorkerInfo;
  _.each(workersConfig, function(workerInfo, workerId) {
    if(workerInfo.default) {
      defaultWorkerInfo = workerInfo;
      return;
    }

    var routers = workerInfo.routers;
    if(!_.isArray(routers)) {
      routers = [routers];
    }
    _.each(routers, function(routerPath) {
      rules["/"+routerPath+"/"] = "http://" + workerInfo.host + ":" + workerInfo.port + "/" + routerPath + "/";
    });
  });

  return new HttpProxyRules({
    rules: rules,
    default: "http://" + defaultWorkerInfo.host + ":" + defaultWorkerInfo.port
  });
}

function createProxy() {
  var proxy = httpProxy.createProxy();
  proxy.on('error', function(e) {
    console.log(e.stack);
  });
  return proxy;
}

function NO_MATCH_HANDLER(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' })
     .end('请求网页不存在');
}

exports.createServer = function(workersConfig) {
  console.log("Start Loadbalancer")

  var proxyRules = createProxyRules(workersConfig);
  var proxy = createProxy();

  return http.createServer(function(req, res) {
    var target = proxyRules.match(req);
    if(target) {
      console.log('proxy request to', target)
      proxy.web(req, res, {target: target})
    } else {
      console.log('No matched proxy target!')
      NO_MATCH_HANDLER(req, res);
    }
  })
}
