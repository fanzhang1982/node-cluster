/**
 * Created by zhangfan on 16/5/16.
 */

var _ = require('underscore');
var lb = require('./load-balancer');

var cluster;
var workers;
var globalConfig;
var workersConfig;

function config() {
  var log4js = require('log4js');
  log4js.configure({
    appenders: [
      {
        type: "clustered",
        appenders: [
          { type: 'file', filename: "../wedata.log", maxLogSize: 10000000, backups: 3 },
        ]
      }
    ]
  });
}

function onMessage(message) {
  var workerId = message.worker;
  var worker = workers[workerId];

  if(message.isRestart) {
    return setTimeout(function() {
      console.log("restart", workerId);
      worker.send({isRestart:true});
    }, 1000);
  }
  if(message.runNode) {
    return worker.send(message);
  }
}

function createWorker(workerInfo, workerId) {
  var worker = cluster.fork();
  worker.send({isInit: true, id: workerId, info: workerInfo});
  worker.on('message', onMessage);
  return worker;
}

function restartWorker(worker, code, signal){
  console.log("prepared to restart", code, signal);

  var pid = worker.process.pid;
  var workerId = _.findKey(workers, function(worker) {
    return worker.process.pid === pid
  });
  console.log("restart ", workerId);
  workers[workerId] = createWorker(workersConfig[workerId], workerId);
}

module.exports = function(_cluster, _globalConfig, _workersConfig) {
  console.log("Start Master");

  cluster = _cluster;
  globalConfig = _globalConfig;
  workersConfig = _workersConfig;

  config();

  workers = _.mapObject(workersConfig, createWorker);

  cluster.on('exit', restartWorker);

  lb.createServer(workersConfig).listen(globalConfig.httpPort, function() {
    console.log("Start master finished on port:", globalConfig.httpPort);
  });
}