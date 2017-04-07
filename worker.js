/**
 * Created by zhangfan on 16/5/16.
 */

var server = require('./server');

var globalConfig;
var workersConfig;
var workerId;

function config() {
  var log4js = require('log4js');
  log4js.configure({
    appenders: [
      {type: "clustered"}
    ]
  });
}

function startWorker(message) {
  workerId = message.id;
  var port = message.info.port;

  console.log("Start worker:", workerId);
  server(workerId, globalConfig, workersConfig).listen(port, function(){
    console.log("worker:" + workerId + ' started on :' + port);
  });
}

function onMessage(message) {
  if(message.isInit) {
    return startWorker(message);
  }
  if(message.isRestart) {
    return process.exit(1);
  }
  if(message.runNode) {
    var script = message.script;
    console.log("Run javascript in", workerId, ':', script);
    try {
      require("../server/admin-console").runNode(script);
    } catch(error) {
      console.log("run node script error", error);
    }
    return;
  }
}

module.exports = function(cluster, _globalConfig, _workersConfig) {
  config();

  globalConfig = _globalConfig;
  workersConfig = _workersConfig;

  process.on("message", onMessage);
}
